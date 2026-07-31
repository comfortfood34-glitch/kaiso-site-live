"""Background scheduler for WhatsApp outbox message processing."""

import logging
import asyncio
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Callable

logger = logging.getLogger(__name__)

_scheduler_instance = None


class OutboxScheduler:
    """Background scheduler for outbox processing and recovery."""

    def __init__(self, db: AsyncIOMotorDatabase, send_fn: Callable):
        self.db = db
        self.send_fn = send_fn
        self.process_task = None
        self.recovery_task = None
        self.running = False

    async def start(self):
        """Start the scheduler loops."""
        if self.running:
            logger.warning("[OUTBOX_SCHEDULER] already running")
            return

        self.running = True
        self.process_task = asyncio.create_task(self._process_loop())
        self.recovery_task = asyncio.create_task(self._recovery_loop())
        logger.info("[OUTBOX_SCHEDULER] started (process_loop + recovery_loop)")

    async def stop(self):
        """Stop the scheduler loops gracefully."""
        if not self.running:
            return

        self.running = False

        if self.process_task:
            self.process_task.cancel()
            try:
                await self.process_task
            except asyncio.CancelledError:
                pass

        if self.recovery_task:
            self.recovery_task.cancel()
            try:
                await self.recovery_task
            except asyncio.CancelledError:
                pass

        logger.info("[OUTBOX_SCHEDULER] stopped")

    async def _process_loop(self):
        """Process pending messages every 30 seconds."""
        from services.whatsapp_outbox import get_outbox_service

        while self.running:
            try:
                await asyncio.sleep(30)

                if not self.running:
                    break

                outbox = get_outbox_service(self.db)
                stats = await outbox.claim_and_process_pending(self.send_fn)
                if stats["processed"] > 0:
                    logger.info(
                        f"[OUTBOX_PROCESS_LOOP] processed={stats['processed']} "
                        f"sent={stats['sent']} failed={stats['failed']} skipped={stats['skipped']}"
                    )

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[OUTBOX_PROCESS_LOOP_EXCEPTION] error={type(e).__name__}: {e}")

    async def _recovery_loop(self):
        """Recover abandoned claims every 5 minutes."""
        from services.whatsapp_outbox import get_outbox_service

        while self.running:
            try:
                await asyncio.sleep(300)  # 5 minutes

                if not self.running:
                    break

                outbox = get_outbox_service(self.db)
                stats = await outbox.recover_abandoned_claims()
                if stats["recovered"] > 0:
                    logger.info(f"[OUTBOX_RECOVERY_LOOP] recovered={stats['recovered']}")

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[OUTBOX_RECOVERY_LOOP_EXCEPTION] error={type(e).__name__}: {e}")


def get_scheduler(db: AsyncIOMotorDatabase, send_fn: Callable) -> OutboxScheduler:
    """Get or create the global scheduler instance."""
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = OutboxScheduler(db, send_fn)
    return _scheduler_instance
