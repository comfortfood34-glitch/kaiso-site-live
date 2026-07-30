"""MongoDB index creation for kaiso-site-live collections."""

import asyncio
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_indexes():
    """Create all required MongoDB indexes."""
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "kaisosystem_sushi")

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    try:
        # WhatsApp Outbox Indexes
        logger.info("Creating outbox indexes...")

        # Unique index: (restaurant_id, key)
        await db.whatsapp_outbox.create_index(
            [("restaurant_id", 1), ("key", 1)],
            unique=True,
            name="unique_outbox_per_restaurant_key",
        )
        logger.info("✓ Created unique index on (restaurant_id, key)")

        # Recovery index: (restaurant_id, state, processing_started_at)
        await db.whatsapp_outbox.create_index(
            [("restaurant_id", 1), ("state", 1), ("processing_started_at", 1)],
            name="idx_outbox_recovery_by_restaurant_state_time",
        )
        logger.info("✓ Created recovery index on (restaurant_id, state, processing_started_at)")

        # Retry index: (restaurant_id, state, next_retry_at)
        await db.whatsapp_outbox.create_index(
            [("restaurant_id", 1), ("state", 1), ("next_retry_at", 1)],
            name="idx_outbox_retry_by_restaurant_state_nextretry",
        )
        logger.info("✓ Created retry index on (restaurant_id, state, next_retry_at)")

        logger.info("All indexes created successfully")

    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        raise

    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(create_indexes())
