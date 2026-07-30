"""Create MongoDB indexes for WhatsApp outbox (idempotent).

Usage:
  python scripts/create_indexes.py

Or call from Python:
  from scripts.create_indexes import ensure_whatsapp_outbox_indexes
  await ensure_whatsapp_outbox_indexes(db)
"""
import asyncio
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from database import get_db
from scripts.index_definitions import WHATSAPP_OUTBOX_INDEXES

logger = logging.getLogger(__name__)


async def ensure_whatsapp_outbox_indexes(db):
    """Create all WhatsApp outbox indexes (idempotent, safe to call on startup).

    Args:
        db: AsyncIO MongoDB database instance

    Returns:
        True if all indexes created/verified successfully, False if any failed

    Raises:
        RuntimeError if unique index constraint already exists with different spec
    """
    collection = db.whatsapp_outbox_events
    success = True

    for collection_name, indexes in WHATSAPP_OUTBOX_INDEXES.items():
        if collection_name != "whatsapp_outbox_events":
            continue

        for index_spec in indexes:
            try:
                fields = index_spec["fields"]
                name = index_spec["name"]
                unique = index_spec.get("unique", False)
                expire_after = index_spec.get("expireAfterSeconds")

                kwargs = {"name": name}
                if unique:
                    kwargs["unique"] = True
                if expire_after:
                    kwargs["expireAfterSeconds"] = expire_after

                await collection.create_index(fields, **kwargs)
                logger.info(f"[INDEX_OK] collection={collection_name} index={name}")

            except Exception as e:
                logger.error(f"[INDEX_ERROR] collection={collection_name} index={index_spec.get('name')} error={str(e)[:200]}")
                success = False

    return success


async def main():
    """CLI entrypoint: create all indexes."""
    db = await get_db()
    try:
        success = await ensure_whatsapp_outbox_indexes(db)
        if success:
            logger.info("[INDEXES_CREATED] All indexes created/verified successfully")
            sys.exit(0)
        else:
            logger.error("[INDEXES_FAILED] One or more indexes failed")
            sys.exit(1)
    finally:
        db.client.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
