"""WhatsApp outbox recovery: automated detection and retry of abandoned/failed events.

Background loop runs per-tenant during app lifecycle:
- Detects abandoned claims (state=claimed, processing_started_at > 5 min old)
- Schedules retry of failed events (state=failed, next_retry_at <= now, retry_count < 3)
- Atomic recovery: no duplicate claims or concurrent workers
- Graceful lifecycle: starts on app startup, stops on shutdown
"""
import asyncio
import logging
from typing import Optional, Dict
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

RECOVERY_LOOP_INTERVAL_SECONDS = 30
RECOVERY_BATCH_SIZE = 100


class OutboxRecoveryScheduler:
    """Manages per-tenant recovery loops for outbox events."""

    def __init__(self, outbox):
        """
        Args:
            outbox: WhatsAppOutbox instance (contains db and collection)
        """
        self.outbox = outbox
        self._tasks: Dict[str, asyncio.Task] = {}
        self._running = False

    async def start(self):
        """Start recovery scheduler (idempotent)."""
        if self._running:
            logger.warning("[RECOVERY_SCHEDULER] Already running, ignoring start()")
            return

        self._running = True
        logger.info("[RECOVERY_SCHEDULER] Started")

    async def stop(self):
        """Stop all recovery tasks gracefully (idempotent)."""
        if not self._running:
            logger.warning("[RECOVERY_SCHEDULER] Not running, ignoring stop()")
            return

        self._running = False
        logger.info(f"[RECOVERY_SCHEDULER] Stopping {len(self._tasks)} task(s)")

        for restaurant_id, task in self._tasks.items():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                logger.info(f"[RECOVERY_LOOP] Cancelled for tenant={restaurant_id}")

        self._tasks.clear()
        logger.info("[RECOVERY_SCHEDULER] Stopped")

    async def register_tenant(self, restaurant_id: str) -> None:
        """Register a tenant for recovery monitoring (idempotent)."""
        if not self._running:
            logger.warning(f"[RECOVERY_SCHEDULER] Not running, cannot register tenant={restaurant_id}")
            return

        if restaurant_id in self._tasks:
            logger.debug(f"[RECOVERY_LOOP] Already registered tenant={restaurant_id}")
            return

        task = asyncio.create_task(self._recovery_loop(restaurant_id))
        self._tasks[restaurant_id] = task
        logger.info(f"[RECOVERY_LOOP] Registered tenant={restaurant_id}")

    async def _recovery_loop(self, restaurant_id: str) -> None:
        """Continuous recovery loop for a single tenant."""
        logger.info(f"[RECOVERY_LOOP] Starting loop for tenant={restaurant_id}")

        try:
            while self._running:
                try:
                    await self._recover_abandoned_and_retry(restaurant_id)
                except Exception as e:
                    logger.error(f"[RECOVERY_LOOP_ERROR] tenant={restaurant_id} error={str(e)[:100]}")

                await asyncio.sleep(RECOVERY_LOOP_INTERVAL_SECONDS)

        except asyncio.CancelledError:
            logger.info(f"[RECOVERY_LOOP] Cancelled for tenant={restaurant_id}")
        finally:
            if restaurant_id in self._tasks:
                del self._tasks[restaurant_id]
            logger.info(f"[RECOVERY_LOOP] Ended for tenant={restaurant_id}")

    async def _recover_abandoned_and_retry(self, restaurant_id: str) -> None:
        """Single recovery pass: mark abandoned as failed, claim and retry."""
        # Find abandoned claimed events (stuck > 5 minutes)
        abandoned = await self.outbox.find_abandoned_processing(restaurant_id)
        for event in abandoned:
            try:
                await self.outbox.mark_abandoned_as_failed(event)
                logger.info(f"[RECOVERY_ABANDONED] tenant={restaurant_id} rid={event.reservation_id[:8]}")
            except Exception as e:
                logger.error(f"[RECOVERY_ABANDONED_ERROR] tenant={restaurant_id} rid={event.reservation_id[:8]} error={str(e)[:100]}")

        # Find failed events eligible for retry
        retryable = await self.outbox.find_failed_retryable(restaurant_id)
        for event in retryable[:RECOVERY_BATCH_SIZE]:
            try:
                claimed = await self.outbox.claim_for_delivery(event)
                if claimed:
                    logger.info(f"[RECOVERY_RETRIED] tenant={restaurant_id} rid={claimed.reservation_id[:8]} retry={claimed.retry_count}")
                else:
                    logger.debug(f"[RECOVERY_NOT_CLAIMABLE] tenant={restaurant_id} rid={event.reservation_id[:8]}")
            except Exception as e:
                logger.error(f"[RECOVERY_RETRY_ERROR] tenant={restaurant_id} rid={event.reservation_id[:8]} error={str(e)[:100]}")


_recovery_scheduler: Optional[OutboxRecoveryScheduler] = None


def get_recovery_scheduler(outbox=None) -> OutboxRecoveryScheduler:
    """Get or create singleton recovery scheduler instance."""
    global _recovery_scheduler
    if _recovery_scheduler is None:
        if outbox is None:
            raise ValueError("outbox parameter required on first call")
        _recovery_scheduler = OutboxRecoveryScheduler(outbox)
    return _recovery_scheduler


async def start_recovery_scheduler():
    """Start the global recovery scheduler."""
    scheduler = get_recovery_scheduler()
    await scheduler.start()


async def stop_recovery_scheduler():
    """Stop the global recovery scheduler gracefully."""
    if _recovery_scheduler is None:
        return
    await _recovery_scheduler.stop()


@asynccontextmanager
async def recovery_scheduler_lifecycle():
    """Context manager for recovery scheduler lifecycle (startup/shutdown)."""
    try:
        await start_recovery_scheduler()
        yield
    finally:
        await stop_recovery_scheduler()
