"""Integration between WhatsApp outbox and local send_whatsapp_notification."""

import logging
import asyncio
from typing import Callable, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


async def create_outbox_event_for_reservation(
    db: AsyncIOMotorDatabase,
    reservation_id: str,
    phone: str,
    customer_name: str,
    date: str,
    time: str,
    guests: int,
) -> bool:
    """Create WhatsApp outbox event for reservation confirmation."""
    from services.whatsapp_outbox import get_outbox_service

    try:
        outbox = get_outbox_service(db)
        success, error = await outbox.create_pending_message(
            reservation_id=reservation_id,
            phone=phone,
            customer_name=customer_name,
            date=date,
            time=time,
            guests=guests,
        )

        if not success:
            logger.error(f"[OUTBOX_CREATION_FAILED] reservation={reservation_id[:8]} error={error}")
            return False

        logger.info(f"[OUTBOX_EVENT_CREATED] reservation={reservation_id[:8]} status=pending")
        return True

    except Exception as e:
        logger.error(f"[OUTBOX_INTEGRATION_ERROR] reservation={reservation_id[:8]} error={type(e).__name__}: {e}")
        return False


def trigger_immediate_processing(db: AsyncIOMotorDatabase, send_fn: Callable):
    """Trigger immediate background processing of pending messages (fire and forget)."""
    async def process_background():
        from services.whatsapp_outbox import get_outbox_service

        try:
            outbox = get_outbox_service(db)
            stats = await outbox.claim_and_process_pending(send_fn)

            if stats["processed"] > 0:
                logger.info(
                    f"[OUTBOX_BACKGROUND_PROCESS] "
                    f"processed={stats['processed']} sent={stats['sent']} failed={stats['failed']}"
                )
        except Exception as e:
            logger.error(f"[OUTBOX_BACKGROUND_PROCESS_ERROR] error={type(e).__name__}: {e}")

    asyncio.create_task(process_background())
