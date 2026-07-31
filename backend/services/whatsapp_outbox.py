"""WhatsApp outbox service for kaiso-site-live.

Handles deferred message processing with atomic claims, backoff retry,
and recovery of abandoned claims.
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Tuple, Optional, Dict
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

logger = logging.getLogger(__name__)

MAX_RETRIES = 3
RETRY_BACKOFF_MINUTES = [1, 5, 15]
PROCESSING_TIMEOUT_MINUTES = 5


class WhatsAppOutbox:
    """WhatsApp outbox service with atomic claims and retry logic."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.whatsapp_outbox

    async def create_pending_message(
        self,
        reservation_id: str,
        phone: str,
        customer_name: str,
        date: str,
        time: str,
        guests: int,
    ) -> Tuple[bool, Optional[str]]:
        """Create pending WhatsApp outbox event for reservation."""
        key = f"{reservation_id}:whatsapp_confirmation"

        doc = {
            "key": key,
            "reservation_id": reservation_id,
            "phone": phone,
            "customer_name": customer_name,
            "date": date,
            "time": time,
            "guests": guests,
            "state": "pending",
            "retry_count": 0,
            "max_retries": MAX_RETRIES,
            "processing_started_at": None,
            "claim_token": None,
            "next_retry_at": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

        try:
            await self.collection.insert_one(doc)
            logger.info(f"[OUTBOX_MESSAGE_CREATED] reservation={reservation_id[:8]}")
            return True, None
        except DuplicateKeyError:
            logger.info(f"[OUTBOX_MESSAGE_IDEMPOTENT] key={key[:16]}")
            return True, None
        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            logger.error(f"[OUTBOX_MESSAGE_CREATE_ERROR] error={error_msg}")
            return False, error_msg

    async def claim_and_process_pending(self, send_fn) -> Dict[str, int]:
        """Atomically claim and process pending messages."""
        stats = {"processed": 0, "sent": 0, "failed": 0, "skipped": 0}
        now = datetime.now(timezone.utc)

        pending = await self.collection.find({
            "state": {"$in": ["pending", "failed"]},
            "next_retry_at": {"$lte": now},
        }).to_list(length=None)

        for msg in pending:
            claim_token = f"{msg['_id']}:{now.isoformat()}"

            updated = await self.collection.find_one_and_update(
                {
                    "_id": msg["_id"],
                    "state": {"$in": ["pending", "failed"]},
                    "claim_token": None,
                },
                {
                    "$set": {
                        "state": "processing",
                        "claim_token": claim_token,
                        "processing_started_at": now,
                        "updated_at": now,
                    }
                },
                return_document=True,
            )

            if not updated:
                stats["skipped"] += 1
                continue

            stats["processed"] += 1

            try:
                sent = await send_fn(
                    msg["phone"],
                    {
                        "customer_name": msg["customer_name"],
                        "reservation_date": msg["date"],
                        "reservation_time": msg["time"],
                        "guests": msg["guests"],
                    },
                )

                if sent:
                    await self.collection.update_one(
                        {"_id": msg["_id"]},
                        {"$set": {"state": "sent", "claim_token": None, "updated_at": now}},
                    )
                    stats["sent"] += 1
                    logger.info(f"[OUTBOX_MESSAGE_SENT] reservation={msg['reservation_id'][:8]}")
                else:
                    await self._mark_for_retry(msg)
                    stats["failed"] += 1
                    logger.warning(f"[OUTBOX_MESSAGE_FAILED] reservation={msg['reservation_id'][:8]}")
            except Exception as e:
                await self._mark_for_retry(msg)
                stats["failed"] += 1
                logger.error(f"[OUTBOX_SEND_ERROR] error={type(e).__name__}: {e}")

        return stats

    async def recover_abandoned_claims(self) -> Dict[str, int]:
        """Recover messages stuck in processing state for too long."""
        stats = {"recovered": 0, "marked_failed": 0}
        now = datetime.now(timezone.utc)
        timeout_threshold = now - timedelta(minutes=PROCESSING_TIMEOUT_MINUTES)

        abandoned = await self.collection.find({
            "state": "processing",
            "processing_started_at": {"$lt": timeout_threshold},
        }).to_list(length=None)

        for msg in abandoned:
            await self.collection.update_one(
                {"_id": msg["_id"]},
                {
                    "$set": {
                        "state": "failed",
                        "claim_token": None,
                        "next_retry_at": now,
                        "updated_at": now,
                    }
                },
            )
            stats["recovered"] += 1
            stats["marked_failed"] += 1
            logger.info(f"[OUTBOX_RECOVERED_ABANDONED] reservation={msg['reservation_id'][:8]}")

        return stats

    async def _mark_for_retry(self, msg: dict):
        """Mark message for retry with backoff calculation."""
        now = datetime.now(timezone.utc)
        retry_count = msg.get("retry_count", 0)
        max_retries = msg.get("max_retries", MAX_RETRIES)

        if retry_count >= max_retries:
            await self.collection.update_one(
                {"_id": msg["_id"]},
                {"$set": {"state": "failed", "claim_token": None, "updated_at": now}},
            )
            logger.warning(f"[OUTBOX_MAX_RETRIES_EXCEEDED] reservation={msg['reservation_id'][:8]}")
        else:
            backoff_minutes = RETRY_BACKOFF_MINUTES[retry_count]
            next_retry = now + timedelta(minutes=backoff_minutes)
            await self.collection.update_one(
                {"_id": msg["_id"]},
                {
                    "$set": {
                        "state": "failed",
                        "claim_token": None,
                        "retry_count": retry_count + 1,
                        "next_retry_at": next_retry,
                        "updated_at": now,
                    }
                },
            )
            logger.info(f"[OUTBOX_RETRY_SCHEDULED] retry_in_minutes={backoff_minutes}")


def get_outbox_service(db: AsyncIOMotorDatabase) -> WhatsAppOutbox:
    """Get outbox service instance."""
    return WhatsAppOutbox(db)
