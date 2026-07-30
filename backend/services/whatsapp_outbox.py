"""WhatsApp outbox for deferred customer confirmations from KaisoSystem external plugin.

Multi-tenant outbox with atomic claims, backoff retry, and recovery scheduling.

Database model (whatsapp_outbox):
- Unique index: (restaurant_id, key)
- Recovery index: (restaurant_id, state, processing_started_at)
- States: pending, processing, sent, failed
- Claim atomicity via find_one_and_update with claim_token
"""

import logging
import os
import httpx
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Tuple
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

logger = logging.getLogger(__name__)

WHATSAPP_SERVICE_URL = os.environ.get('WHATSAPP_SERVICE_URL', 'http://localhost:8002')
MAX_RETRIES = 3
RETRY_BACKOFF_MINUTES = [1, 5, 15]  # Backoff: 1min, 5min, 15min
PROCESSING_TIMEOUT_MINUTES = 5


class WhatsAppOutbox:
    """Manages WhatsApp outbox for external plugin reservations (multi-tenant safe)."""

    def __init__(self, db: AsyncIOMotorDatabase, restaurant_id: str):
        """
        Initialize outbox service for specific restaurant.

        Args:
            db: MongoDB async client
            restaurant_id: Canonical restaurant UUID (from configuration, never from request)
        """
        self.db = db
        self.restaurant_id = restaurant_id
        self.whatsapp_url = WHATSAPP_SERVICE_URL
        self.timeout = 15

    async def create_pending_message(
        self,
        reservation_id: str,
        phone: str,
        customer_name: str,
        date: str,
        time: str,
        guests: int,
        reservation_code: str,
        restaurant_name: str = "Kaisō Sushi",
        locale: str = "pt",
    ) -> Tuple[bool, Optional[str]]:
        """
        Create pending outbox message for customer confirmation.

        Atomically creates message with unique key per restaurant.
        Returns immediately; processing happens in background.

        Args:
            reservation_id: KaisoSystem reservation ID
            phone: Customer phone (will be normalized)
            customer_name: Customer full name
            date: Reservation date (YYYY-MM-DD)
            time: Reservation time (HH:MM)
            guests: Number of guests
            reservation_code: Code for reference in message
            restaurant_name: Restaurant name for message
            locale: Message locale (pt/es)

        Returns:
            (success, error_msg) tuple
        """
        # Outbox key is unique per restaurant
        outbox_key = f"{reservation_id}:initial_confirmation:customer"

        # Build message
        message = self._build_message(
            customer_name, date, time, guests, reservation_code, restaurant_name, locale
        )

        # Normalize phone with country code (default Spain: 34)
        phone_clean = self._normalize_phone(phone)

        event = {
            "restaurant_id": self.restaurant_id,  # CRITICAL: from config, not request
            "key": outbox_key,  # Part of unique index
            "reservation_id": reservation_id,
            "phone": phone_clean,
            "customer_name": customer_name,
            "message": message,
            "locale": locale,
            "state": "pending",  # pending → processing → sent/failed
            "retry_count": 0,
            "max_retries": MAX_RETRIES,
            "last_error": None,
            "processing_started_at": None,  # Set when claiming
            "claim_token": None,  # Set when claiming
            "next_retry_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        try:
            # Insert with unique constraint on (restaurant_id, key)
            result = await self.db.whatsapp_outbox.insert_one(event)
            logger.info(
                f"[OUTBOX_CREATED] restaurant={self.restaurant_id[:8]} key={outbox_key[:30]} phone={phone_clean[-4:]}"
            )
            return True, None

        except DuplicateKeyError:
            # Key already exists for this restaurant - idempotent success
            logger.info(
                f"[OUTBOX_IDEMPOTENT] restaurant={self.restaurant_id[:8]} key={outbox_key[:30]}"
            )
            return True, None

        except Exception as e:
            error = f"Failed to create outbox event: {type(e).__name__}"
            logger.error(f"[OUTBOX_CREATE_ERROR] restaurant={self.restaurant_id[:8]} error={error}")
            return False, error

    async def claim_and_process_pending(self) -> Dict[str, int]:
        """
        Claim pending messages and send them.

        Uses atomic find_one_and_update to prevent concurrent processing.
        Respects next_retry_at and max_retries.

        Returns:
            stats dict: {processed, claimed, sent, failed, skipped}
        """
        stats = {"processed": 0, "claimed": 0, "sent": 0, "failed": 0, "skipped": 0}

        # Find pending messages for this restaurant (ordered by next_retry_at)
        pending_cursor = self.db.whatsapp_outbox.find(
            {
                "restaurant_id": self.restaurant_id,
                "state": {"$in": ["pending", "failed"]},
                "next_retry_at": {"$lte": datetime.now(timezone.utc).isoformat()},
            }
        ).sort("next_retry_at", 1)

        try:
            pending = await pending_cursor.to_list(100)  # Process max 100 at a time
        except Exception as e:
            logger.error(f"[OUTBOX_SCAN_ERROR] restaurant={self.restaurant_id[:8]} error={e}")
            return stats

        for doc in pending:
            stats["processed"] += 1
            key = doc.get("key")
            phone = doc.get("phone")
            message = doc.get("message")
            retry_count = doc.get("retry_count", 0)
            max_retries = doc.get("max_retries", MAX_RETRIES)

            # Check if retry limit exceeded
            if retry_count >= max_retries:
                logger.warning(
                    f"[OUTBOX_MAX_RETRIES] restaurant={self.restaurant_id[:8]} key={key[:30]} attempts={retry_count}"
                )
                await self.db.whatsapp_outbox.update_one(
                    {"restaurant_id": self.restaurant_id, "key": key},
                    {"$set": {"state": "failed", "updated_at": datetime.now(timezone.utc).isoformat()}},
                )
                stats["failed"] += 1
                continue

            # Atomically claim this message
            claim_token = str(uuid.uuid4())
            claimed = await self.db.whatsapp_outbox.find_one_and_update(
                {
                    "restaurant_id": self.restaurant_id,
                    "key": key,
                    "state": {"$in": ["pending", "failed"]},  # Only claim if not processing
                    "claim_token": None,  # Not already claimed
                },
                {
                    "$set": {
                        "state": "processing",
                        "claim_token": claim_token,
                        "processing_started_at": datetime.now(timezone.utc).isoformat(),
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }
                },
                return_document=True,
            )

            if not claimed:
                # Already being processed by another worker
                logger.debug(f"[OUTBOX_ALREADY_PROCESSING] restaurant={self.restaurant_id[:8]} key={key[:30]}")
                stats["skipped"] += 1
                continue

            stats["claimed"] += 1

            # Send WhatsApp
            try:
                success = await self._send_whatsapp(phone, message)

                if success:
                    await self.db.whatsapp_outbox.update_one(
                        {"restaurant_id": self.restaurant_id, "key": key},
                        {
                            "$set": {
                                "state": "sent",
                                "claim_token": None,
                                "processing_started_at": None,
                                "updated_at": datetime.now(timezone.utc).isoformat(),
                            }
                        },
                    )
                    stats["sent"] += 1
                    logger.info(
                        f"[OUTBOX_SENT] restaurant={self.restaurant_id[:8]} key={key[:30]} phone={phone[-4:]}"
                    )
                else:
                    # Failed - schedule retry
                    next_retry_minutes = (
                        RETRY_BACKOFF_MINUTES[retry_count] if retry_count < len(RETRY_BACKOFF_MINUTES) else 30
                    )
                    next_retry_at = (
                        datetime.now(timezone.utc) + timedelta(minutes=next_retry_minutes)
                    ).isoformat()

                    await self.db.whatsapp_outbox.update_one(
                        {"restaurant_id": self.restaurant_id, "key": key},
                        {
                            "$set": {
                                "state": "failed",
                                "claim_token": None,
                                "processing_started_at": None,
                                "retry_count": retry_count + 1,
                                "next_retry_at": next_retry_at,
                                "updated_at": datetime.now(timezone.utc).isoformat(),
                            }
                        },
                    )
                    stats["failed"] += 1
                    logger.warning(
                        f"[OUTBOX_WILL_RETRY] restaurant={self.restaurant_id[:8]} key={key[:30]} "
                        f"attempt={retry_count + 1} next_in={next_retry_minutes}min"
                    )

            except Exception as e:
                # Critical error - release claim, mark failed
                error_msg = f"{type(e).__name__}: {str(e)[:100]}"
                logger.error(f"[OUTBOX_SEND_ERROR] restaurant={self.restaurant_id[:8]} key={key[:30]} error={error_msg}")

                next_retry_at = (
                    datetime.now(timezone.utc) + timedelta(minutes=RETRY_BACKOFF_MINUTES[0])
                ).isoformat()

                await self.db.whatsapp_outbox.update_one(
                    {"restaurant_id": self.restaurant_id, "key": key},
                    {
                        "$set": {
                            "state": "failed",
                            "claim_token": None,
                            "processing_started_at": None,
                            "retry_count": retry_count + 1,
                            "last_error": error_msg,
                            "next_retry_at": next_retry_at,
                            "updated_at": datetime.now(timezone.utc).isoformat(),
                        }
                    },
                )
                stats["failed"] += 1

        return stats

    async def recover_abandoned_claims(self) -> Dict[str, int]:
        """
        Recover messages stuck in 'processing' state.

        If processing_started_at + TIMEOUT has passed, release the claim.
        Called periodically by scheduler.

        Returns:
            stats dict: {recovered}
        """
        stats = {"recovered": 0}

        timeout_threshold = (
            datetime.now(timezone.utc) - timedelta(minutes=PROCESSING_TIMEOUT_MINUTES)
        ).isoformat()

        try:
            result = await self.db.whatsapp_outbox.update_many(
                {
                    "restaurant_id": self.restaurant_id,
                    "state": "processing",
                    "processing_started_at": {"$lt": timeout_threshold},
                },
                {
                    "$set": {
                        "state": "failed",
                        "claim_token": None,
                        "processing_started_at": None,
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }
                },
            )

            stats["recovered"] = result.modified_count
            if result.modified_count > 0:
                logger.info(
                    f"[OUTBOX_RECOVERED] restaurant={self.restaurant_id[:8]} "
                    f"abandoned_claims={result.modified_count}"
                )

        except Exception as e:
            logger.error(f"[OUTBOX_RECOVERY_ERROR] restaurant={self.restaurant_id[:8]} error={e}")

        return stats

    async def get_status(self) -> Dict[str, int]:
        """Get outbox status for this restaurant."""
        try:
            pending = await self.db.whatsapp_outbox.count_documents(
                {"restaurant_id": self.restaurant_id, "state": "pending"}
            )
            processing = await self.db.whatsapp_outbox.count_documents(
                {"restaurant_id": self.restaurant_id, "state": "processing"}
            )
            sent = await self.db.whatsapp_outbox.count_documents(
                {"restaurant_id": self.restaurant_id, "state": "sent"}
            )
            failed = await self.db.whatsapp_outbox.count_documents(
                {"restaurant_id": self.restaurant_id, "state": "failed"}
            )

            return {"pending": pending, "processing": processing, "sent": sent, "failed": failed}

        except Exception as e:
            logger.error(f"[OUTBOX_STATUS_ERROR] restaurant={self.restaurant_id[:8]} error={e}")
            return {}

    async def _send_whatsapp(self, phone: str, message: str) -> bool:
        """Send message via WhatsApp service. Returns: success (True/False)"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.whatsapp_url}/send",
                    json={"phone": phone, "message": message},
                )
                return response.status_code == 200

        except httpx.TimeoutException:
            logger.warning(f"[WA_TIMEOUT] phone={phone[-4:]}")
            return False
        except Exception as e:
            logger.error(f"[WA_ERROR] phone={phone[-4:]} error={type(e).__name__}")
            return False

    def _normalize_phone(self, phone: str) -> str:
        """Normalize phone number: remove spaces/hyphens, add country code if missing."""
        phone_clean = phone.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "").replace("+", "")

        # Add country code if missing (default Spain: 34)
        if not (phone_clean.startswith("34") or phone_clean.startswith("55") or phone_clean.startswith("351")):
            phone_clean = f"34{phone_clean}"

        return phone_clean

    def _build_message(self, name: str, date: str, time: str, guests: int, code: str, restaurant: str, locale: str) -> str:
        """Build reservation confirmation message."""
        if locale.startswith("es"):
            return (
                f"¡Hola {name}! 🎉\n\n"
                f"¡Tu reserva en {restaurant} ha sido confirmada!\n\n"
                f"📅 Fecha: {date}\n"
                f"⏰ Hora: {time}\n"
                f"👥 Personas: {guests}\n"
                f"🎟️ Código: {code}\n\n"
                f"Si necesitas cancelar o modificar, contáctanos.\n"
                f"¡Gracias por elegir {restaurant}!"
            )
        else:  # Portuguese default
            return (
                f"Olá {name}! 🎉\n\n"
                f"Sua reserva em {restaurant} foi confirmada!\n\n"
                f"📅 Data: {date}\n"
                f"⏰ Horário: {time}\n"
                f"👥 Pessoas: {guests}\n"
                f"🎟️ Código: {code}\n\n"
                f"Caso precise cancelar ou modificar, entre em contato conosco.\n"
                f"Obrigado por escolher {restaurant}!"
            )


def get_outbox_service(db: AsyncIOMotorDatabase, restaurant_id: str) -> WhatsAppOutbox:
    """Get outbox service instance for specific restaurant."""
    return WhatsAppOutbox(db, restaurant_id)
