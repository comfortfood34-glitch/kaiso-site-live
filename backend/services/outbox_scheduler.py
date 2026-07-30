"""Background scheduler for WhatsApp outbox processing.

Handles:
- Periodic message processing (every 30 seconds)
- Recovery of abandoned claims (every 5 minutes)
- Graceful shutdown with task cancellation
- Per-restaurant isolation (multi-tenant safe)
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Set
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


class OutboxScheduler:
    """Manages background outbox processing tasks."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.processing_task: Optional[asyncio.Task] = None
        self.recovery_task: Optional[asyncio.Task] = None
        self.active_restaurants: Set[str] = set()
        self.is_running = False

    async def start(self):
        """Start scheduler tasks."""
        if self.is_running:
            logger.warning("[OUTBOX_SCHEDULER] Already running, skipping start")
            return

        self.is_running = True
        logger.info("[OUTBOX_SCHEDULER] Starting...")

        # Start processing loop (every 30 seconds)
        self.processing_task = asyncio.create_task(self._process_loop())

        # Start recovery loop (every 5 minutes)
        self.recovery_task = asyncio.create_task(self._recovery_loop())

        logger.info("[OUTBOX_SCHEDULER] Started (process: 30s, recovery: 5min)")

    async def stop(self):
        """Stop scheduler tasks gracefully."""
        if not self.is_running:
            return

        self.is_running = False
        logger.info("[OUTBOX_SCHEDULER] Stopping...")

        # Cancel tasks
        if self.processing_task:
            self.processing_task.cancel()
        if self.recovery_task:
            self.recovery_task.cancel()

        # Wait for cancellation
        try:
            if self.processing_task:
                await self.processing_task
        except asyncio.CancelledError:
            pass

        try:
            if self.recovery_task:
                await self.recovery_task
        except asyncio.CancelledError:
            pass

        logger.info("[OUTBOX_SCHEDULER] Stopped")

    async def _process_loop(self):
        """Process pending messages continuously (every 30 seconds)."""
        from services.whatsapp_outbox import get_outbox_service

        while self.is_running:
            try:
                await asyncio.sleep(30)

                # Get all restaurants with pending messages
                try:
                    restaurants = await self.db.whatsapp_outbox.distinct(
                        "restaurant_id",
                        {"state": {"$in": ["pending", "failed"]}},
                    )
                except Exception as e:
                    logger.error(f"[OUTBOX_PROCESS_SCAN_ERROR] {e}")
                    continue

                # Process each restaurant's queue independently
                for restaurant_id in restaurants:
                    if not self.is_running:
                        break

                    try:
                        outbox = get_outbox_service(self.db, restaurant_id)
                        stats = await outbox.claim_and_process_pending()

                        if stats["processed"] > 0:
                            logger.info(
                                f"[OUTBOX_PROCESS_BATCH] restaurant={restaurant_id[:8]} "
                                f"processed={stats['processed']} sent={stats['sent']} failed={stats['failed']}"
                            )

                    except Exception as e:
                        logger.error(
                            f"[OUTBOX_PROCESS_ERROR] restaurant={restaurant_id[:8]} error={type(e).__name__}"
                        )

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[OUTBOX_PROCESS_LOOP_ERROR] {type(e).__name__}: {e}")

        logger.info("[OUTBOX_PROCESS_LOOP] Exited")

    async def _recovery_loop(self):
        """Recover abandoned claims continuously (every 5 minutes)."""
        from services.whatsapp_outbox import get_outbox_service

        while self.is_running:
            try:
                await asyncio.sleep(300)  # 5 minutes

                # Get all restaurants with processing messages
                try:
                    restaurants = await self.db.whatsapp_outbox.distinct(
                        "restaurant_id",
                        {"state": "processing"},
                    )
                except Exception as e:
                    logger.error(f"[OUTBOX_RECOVERY_SCAN_ERROR] {e}")
                    continue

                # Recover each restaurant independently
                for restaurant_id in restaurants:
                    if not self.is_running:
                        break

                    try:
                        outbox = get_outbox_service(self.db, restaurant_id)
                        stats = await outbox.recover_abandoned_claims()

                        if stats["recovered"] > 0:
                            logger.info(
                                f"[OUTBOX_RECOVERY_BATCH] restaurant={restaurant_id[:8]} "
                                f"recovered={stats['recovered']}"
                            )

                    except Exception as e:
                        logger.error(
                            f"[OUTBOX_RECOVERY_ERROR] restaurant={restaurant_id[:8]} error={type(e).__name__}"
                        )

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[OUTBOX_RECOVERY_LOOP_ERROR] {type(e).__name__}: {e}")

        logger.info("[OUTBOX_RECOVERY_LOOP] Exited")


# Global scheduler instance
_scheduler: Optional[OutboxScheduler] = None


def get_scheduler(db: AsyncIOMotorDatabase) -> OutboxScheduler:
    """Get or create global scheduler instance."""
    global _scheduler
    if _scheduler is None:
        _scheduler = OutboxScheduler(db)
    return _scheduler
