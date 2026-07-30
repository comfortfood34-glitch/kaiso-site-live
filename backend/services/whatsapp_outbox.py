"""WhatsApp outbox: multi-tenant, atomic delivery, no re-sends, privacy-first.

State machine: pending → claimed → sent/failed → (retry pending) → sent
- pending: new event, not yet claimed for delivery
- claimed: atomically locked by single worker for delivery
- sent: confirmed by provider (never send again)
- failed: delivery failed, eligible for retry

Guarantees:
- same key/same tenant: no duplicates (unique index enforces)
- same key/different tenants: allowed (multi-tenant isolation)
- sent events: never call provider again (idempotent from app perspective)
- atomic claim: find_one_and_update prevents concurrent sends
- privacy: no full phone in key/logs, masked in all logs
- restaurant_id: from secure server config, never from client
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from pymongo.errors import DuplicateKeyError
from services.whatsapp_outbox_models import OutboxEvent, MAX_RETRIES

logger = logging.getLogger(__name__)

ABANDONED_TIMEOUT_SECONDS = 300  # 5 minutes


class WhatsAppOutbox:
    """MongoDB-backed outbox: atomic delivery, recovery, privacy."""

    def __init__(self, db):
        self.db = db
        self.collection = db.whatsapp_outbox_events

    async def ensure_indexes(self):
        """Create all required indexes (idempotent, called on startup)."""
        try:
            # Unique per tenant + event key (prevents duplicate sends)
            await self.collection.create_index(
                [("restaurant_id", 1), ("key", 1)],
                unique=True,
                name="unique_outbox_per_tenant_key"
            )

            # Recovery by tenant, state, and retry schedule
            await self.collection.create_index(
                [("restaurant_id", 1), ("state", 1), ("next_retry_at", 1)],
                name="idx_outbox_recovery_by_tenant_state_retry"
            )

            # Abandoned detection
            await self.collection.create_index(
                [("restaurant_id", 1), ("state", 1), ("processing_started_at", 1)],
                name="idx_outbox_abandoned_by_tenant"
            )

            # Lookup by tenant + reservation
            await self.collection.create_index(
                [("restaurant_id", 1), ("reservation_id", 1)],
                name="idx_outbox_by_tenant_reservation"
            )

            logger.info("[OUTBOX_INDEXES] created/verified successfully")
            return True
        except Exception as e:
            logger.error(f"[OUTBOX_INDEXES_ERROR] {str(e)[:100]}")
            return False

    async def get_or_create(self, restaurant_id: str, reservation_id: str, event_type: str, phone: str, payload: dict) -> OutboxEvent:
        """Idempotent get/create (state=pending on creation, never sent yet)."""
        key = f"{restaurant_id}:{reservation_id}:{event_type}:customer"

        # Try to find existing (if exists, return as-is, no re-send)
        doc = await self.collection.find_one({
            "restaurant_id": restaurant_id,
            "key": key
        })
        if doc:
            logger.info(f"[OUTBOX_EXISTING] tenant={restaurant_id} rid={reservation_id[:8]} event={event_type} state={doc.get('state')}")
            return OutboxEvent(doc)

        # Create new (starts in pending state, not processing)
        now = datetime.now(timezone.utc).isoformat()
        doc = {
            "restaurant_id": restaurant_id,
            "key": key,
            "reservation_id": reservation_id,
            "event_type": event_type,
            "phone": phone,
            "payload": payload,
            "state": "pending",
            "processing_started_at": None,
            "sent_at": None,
            "error": None,
            "retry_count": 0,
            "next_retry_at": None,
            "updated_at": now
        }
        try:
            result = await self.collection.insert_one(doc)
            doc["_id"] = result.inserted_id
            logger.info(f"[OUTBOX_CREATED] tenant={restaurant_id} rid={reservation_id[:8]} event={event_type}")
        except DuplicateKeyError:
            logger.warning(f"[OUTBOX_DUPLICATE_KEY] tenant={restaurant_id} rid={reservation_id[:8]} key={key}")
            doc = await self.collection.find_one({
                "restaurant_id": restaurant_id,
                "key": key
            })
            if not doc:
                raise
        return OutboxEvent(doc)

    async def claim_for_delivery(self, event: OutboxEvent) -> Optional['OutboxEvent']:
        """Atomically claim event for delivery (only pending or retryable failed).

        Returns updated event if claimed, None if not claimable.
        """
        now = datetime.now(timezone.utc).isoformat()

        # Claim pending events (first time)
        result = await self.collection.find_one_and_update(
            {
                "restaurant_id": event.restaurant_id,
                "key": event.key,
                "state": "pending"
            },
            {"$set": {
                "state": "claimed",
                "processing_started_at": now,
                "updated_at": now
            }},
            return_document=True
        )
        if result:
            logger.info(f"[OUTBOX_CLAIMED_PENDING] tenant={event.restaurant_id} rid={event.reservation_id[:8]}")
            return OutboxEvent(result)

        # Claim failed events only if next_retry_at <= now and retry_count < max
        result = await self.collection.find_one_and_update(
            {
                "restaurant_id": event.restaurant_id,
                "key": event.key,
                "state": "failed",
                "retry_count": {"$lt": MAX_RETRIES},
                "next_retry_at": {"$lte": now}
            },
            {"$set": {
                "state": "claimed",
                "processing_started_at": now,
                "updated_at": now
            }},
            return_document=True
        )
        if result:
            logger.info(f"[OUTBOX_CLAIMED_FAILED] tenant={event.restaurant_id} rid={event.reservation_id[:8]} retry={result.get('retry_count')}")
            return OutboxEvent(result)

        return None

    async def mark_sent(self, event: OutboxEvent) -> None:
        """Mark event sent (ONLY after provider confirms)."""
        now = datetime.now(timezone.utc).isoformat()
        await self.collection.update_one(
            {
                "restaurant_id": event.restaurant_id,
                "key": event.key
            },
            {"$set": {
                "state": "sent",
                "sent_at": now,
                "updated_at": now
            }}
        )
        logger.info(f"[OUTBOX_SENT] tenant={event.restaurant_id} rid={event.reservation_id[:8]}")

    async def mark_failed(self, event: OutboxEvent, error: str) -> OutboxEvent:
        """Mark event failed with exponential backoff (return refreshed event)."""
        now = datetime.now(timezone.utc).isoformat()
        new_count = event.retry_count + 1
        next_retry = None

        if new_count < MAX_RETRIES:
            backoff_seconds = 2 ** new_count
            next_retry = (datetime.now(timezone.utc) + timedelta(seconds=backoff_seconds)).isoformat()

        result = await self.collection.find_one_and_update(
            {
                "restaurant_id": event.restaurant_id,
                "key": event.key
            },
            {"$set": {
                "state": "failed",
                "error": error[:100],
                "retry_count": new_count,
                "next_retry_at": next_retry,
                "updated_at": now
            }},
            return_document=True
        )

        if new_count < MAX_RETRIES:
            logger.warning(f"[OUTBOX_FAILED_RETRYABLE] tenant={event.restaurant_id} rid={event.reservation_id[:8]} retry={new_count} next_at={next_retry}")
        else:
            logger.warning(f"[OUTBOX_FAILED_MAXED] tenant={event.restaurant_id} rid={event.reservation_id[:8]} retry={new_count}")

        return OutboxEvent(result) if result else event

    async def mark_abandoned_as_failed(self, event: OutboxEvent) -> OutboxEvent:
        """Mark abandoned processing event as failed (atomic)."""
        now = datetime.now(timezone.utc).isoformat()

        # Only mark if still in processing state
        result = await self.collection.find_one_and_update(
            {
                "restaurant_id": event.restaurant_id,
                "key": event.key,
                "state": "claimed",
                "processing_started_at": {"$lt": (datetime.now(timezone.utc) - timedelta(seconds=ABANDONED_TIMEOUT_SECONDS)).isoformat()}
            },
            {"$set": {
                "state": "failed",
                "error": "Abandoned delivery (timeout)",
                "retry_count": {"$inc": 1},
                "updated_at": now
            }},
            return_document=True
        )

        if result:
            logger.warning(f"[OUTBOX_ABANDONED_MARKED_FAILED] tenant={event.restaurant_id} rid={event.reservation_id[:8]}")
            return OutboxEvent(result)
        return event

    async def find_abandoned_processing(self, restaurant_id: str) -> list:
        """Find claimed events stuck > 5 minutes (for recovery)."""
        cutoff = (datetime.now(timezone.utc) - timedelta(seconds=ABANDONED_TIMEOUT_SECONDS)).isoformat()
        docs = await self.collection.find({
            "restaurant_id": restaurant_id,
            "state": "claimed",
            "processing_started_at": {"$lt": cutoff}
        }).to_list(None)
        return [OutboxEvent(doc) for doc in docs]

    async def find_failed_retryable(self, restaurant_id: str) -> list:
        """Find failed events ready for retry."""
        now = datetime.now(timezone.utc).isoformat()
        docs = await self.collection.find({
            "restaurant_id": restaurant_id,
            "state": "failed",
            "retry_count": {"$lt": MAX_RETRIES},
            "next_retry_at": {"$lte": now}
        }).to_list(None)
        return [OutboxEvent(doc) for doc in docs]

    async def get_stats(self, restaurant_id: str) -> dict:
        """Get outbox statistics for tenant."""
        pipeline = [
            {"$match": {"restaurant_id": restaurant_id}},
            {"$group": {"_id": "$state", "count": {"$sum": 1}}}
        ]
        results = await self.collection.aggregate(pipeline).to_list(None)
        states = {r["_id"]: r["count"] for r in results}

        total = await self.collection.count_documents({"restaurant_id": restaurant_id})
        retryable = await self.collection.count_documents({
            "restaurant_id": restaurant_id,
            "state": "failed",
            "retry_count": {"$lt": MAX_RETRIES}
        })

        return {
            "total_events": total,
            "states": states,
            "retryable_failed": retryable
        }


_outbox_instance: Optional[WhatsAppOutbox] = None


def get_whatsapp_outbox(db=None) -> WhatsAppOutbox:
    """Get or create singleton outbox instance."""
    global _outbox_instance
    if _outbox_instance is None:
        if db is None:
            raise ValueError("db parameter required on first call")
        _outbox_instance = WhatsAppOutbox(db)
    return _outbox_instance
