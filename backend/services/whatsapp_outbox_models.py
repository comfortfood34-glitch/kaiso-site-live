"""WhatsApp outbox event model."""
import logging

logger = logging.getLogger(__name__)

MAX_RETRIES = 3


class OutboxEvent:
    """Immutable snapshot of outbox event state."""
    def __init__(self, doc: dict):
        self._doc = doc
        self.key = doc.get("key")
        self.restaurant_id = doc.get("restaurant_id")
        self.reservation_id = doc.get("reservation_id")
        self.event_type = doc.get("event_type")
        self.phone = doc.get("phone")
        self.state = doc.get("state")
        self.processing_started_at = doc.get("processing_started_at")
        self.sent_at = doc.get("sent_at")
        self.error = doc.get("error")
        self.retry_count = doc.get("retry_count", 0)
        self.next_retry_at = doc.get("next_retry_at")
        self.max_retries = MAX_RETRIES

    @property
    def doc(self):
        return self._doc

    async def refresh(self, collection):
        """Reload state from MongoDB (use after transitions)."""
        doc = await collection.find_one({
            "restaurant_id": self.restaurant_id,
            "key": self.key
        })
        if doc:
            return OutboxEvent(doc)
        return None
