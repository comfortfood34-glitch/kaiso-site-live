"""MongoDB index creation for WhatsApp outbox collection."""

import logging
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


async def create_outbox_indexes(db: AsyncIOMotorDatabase):
    """Create indexes for whatsapp_outbox collection (idempotent)."""
    try:
        # Unique index on (key) - prevents duplicate messages per reservation
        await db.whatsapp_outbox.create_index(
            [("key", 1)],
            unique=True,
            name="unique_outbox_key",
        )

        # Index for recovery queries (state + processing_started_at)
        await db.whatsapp_outbox.create_index(
            [("state", 1), ("processing_started_at", 1)],
            name="idx_outbox_recovery_by_state_time",
        )

        # Index for retry scheduling (state + next_retry_at)
        await db.whatsapp_outbox.create_index(
            [("state", 1), ("next_retry_at", 1)],
            name="idx_outbox_retry_by_state_nextretry",
        )

        logger.info("[OUTBOX_INDEXES] created successfully")
    except Exception as e:
        logger.error(f"[OUTBOX_INDEXES_ERROR] {type(e).__name__}: {e}")
        raise
