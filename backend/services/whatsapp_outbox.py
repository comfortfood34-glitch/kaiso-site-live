"""WhatsApp outbox for deferred customer confirmations from KaisoSystem external plugin.

Persistence model:
- Collection: whatsapp_outbox
- Unique key: {reservation_id}:initial_confirmation:customer
- States: pending, sent, failed
- Retries: On failure, retry without creating duplicate events
"""

import logging
import os
import httpx
from datetime import datetime, timezone
from typing import Optional, Dict, Tuple
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

WHATSAPP_SERVICE_URL = os.environ.get('WHATSAPP_SERVICE_URL', 'http://localhost:8002')


class WhatsAppOutbox:
    """Manages WhatsApp outbox for external plugin reservations."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
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

        Returns (success, error_msg):
        - success=True: message created (returns immediately, processes in background)
        - success=False: error inserting to database

        Unique key ensures no duplicate messages for same reservation.
        """
        outbox_key = f"{reservation_id}:initial_confirmation:customer"

        message = self._build_message(customer_name, date, time, guests, reservation_code, restaurant_name, locale)

        # Clean phone: remove spaces, hyphens, parens, +
        phone_clean = phone.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "").replace("+", "")

        # Add country code if missing (default to Spain: 34)
        if not (phone_clean.startswith("34") or phone_clean.startswith("55") or phone_clean.startswith("351")):
            phone_clean = f"34{phone_clean}"  # Default to Spain

        event = {
            "outbox_key": outbox_key,
            "reservation_id": reservation_id,
            "phone": phone_clean,
            "customer_name": customer_name,
            "message": message,
            "state": "pending",  # pending, sent, failed
            "retry_count": 0,
            "last_error": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        try:
            # Upsert with unique key ensures no duplicates
            result = await self.db.whatsapp_outbox.update_one(
                {"outbox_key": outbox_key},
                {"$setOnInsert": event},
                upsert=True,
            )

            if result.upserted_id or result.modified_count == 0:
                # New document created
                logger.info(f"[OUTBOX_CREATED] key={outbox_key[:30]} phone={phone_clean[-4:]}")
                return True, None
            else:
                # Document already existed (idempotency)
                logger.info(f"[OUTBOX_EXISTS] key={outbox_key[:30]} (idempotent)")
                return True, None

        except Exception as e:
            error = f"Failed to create outbox event: {type(e).__name__}"
            logger.error(f"[OUTBOX_ERROR] {error} key={outbox_key[:30]}")
            return False, error

    async def send_pending_messages(self) -> Dict[str, int]:
        """
        Process all pending outbox messages.

        Called from background task or endpoint.
        Returns stats: {processed, sent, failed, retry}
        """
        stats = {"processed": 0, "sent": 0, "failed": 0, "retry": 0}

        try:
            pending = await self.db.whatsapp_outbox.find({"state": "pending"}).to_list(None)
        except Exception as e:
            logger.error(f"[OUTBOX_SCAN_ERROR] {e}")
            return stats

        for doc in pending:
            stats["processed"] += 1
            outbox_key = doc.get("outbox_key")
            phone = doc.get("phone")
            message = doc.get("message")
            retry_count = doc.get("retry_count", 0)

            try:
                success = await self._send_whatsapp(phone, message)

                if success:
                    await self.db.whatsapp_outbox.update_one(
                        {"outbox_key": outbox_key},
                        {
                            "$set": {
                                "state": "sent",
                                "updated_at": datetime.now(timezone.utc).isoformat(),
                            }
                        },
                    )
                    stats["sent"] += 1
                    logger.info(f"[OUTBOX_SENT] key={outbox_key[:30]} phone={phone[-4:]}")
                else:
                    # Mark failed, allow future retry
                    await self.db.whatsapp_outbox.update_one(
                        {"outbox_key": outbox_key},
                        {
                            "$set": {
                                "state": "failed",
                                "retry_count": retry_count + 1,
                                "updated_at": datetime.now(timezone.utc).isoformat(),
                            }
                        },
                    )
                    stats["failed"] += 1
                    logger.warning(f"[OUTBOX_FAILED] key={outbox_key[:30]} phone={phone[-4:]} attempt={retry_count + 1}")

            except Exception as e:
                error_msg = f"{type(e).__name__}: {str(e)[:100]}"
                await self.db.whatsapp_outbox.update_one(
                    {"outbox_key": outbox_key},
                    {
                        "$set": {
                            "state": "failed",
                            "last_error": error_msg,
                            "retry_count": retry_count + 1,
                            "updated_at": datetime.now(timezone.utc).isoformat(),
                        }
                    },
                )
                stats["failed"] += 1
                logger.error(f"[OUTBOX_ERROR] key={outbox_key[:30]} error={error_msg}")

        return stats

    async def _send_whatsapp(self, phone: str, message: str) -> bool:
        """
        Send message via WhatsApp service.

        Returns: success (True/False)
        """
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


def get_outbox_service(db: AsyncIOMotorDatabase) -> WhatsAppOutbox:
    """Get outbox service instance."""
    return WhatsAppOutbox(db)
