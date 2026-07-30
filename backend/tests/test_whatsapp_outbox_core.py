"""Functional tests for WhatsApp outbox state machine, atomicity, and recovery."""
import pytest
import asyncio
from datetime import datetime, timedelta, timezone
from services.whatsapp_outbox import WhatsAppOutbox, OutboxEvent, MAX_RETRIES
from motor.motor_asyncio import AsyncIOMotorClient


@pytest.fixture
async def db():
    """Connect to test MongoDB"""
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["kaiso_test"]
    yield db
    # Cleanup
    await db.whatsapp_outbox_events.drop()
    client.close()


@pytest.fixture
async def outbox(db):
    """Create outbox service"""
    outbox = WhatsAppOutbox(db)
    await outbox.ensure_indexes()
    await db.whatsapp_outbox_events.delete_many({})
    return outbox


@pytest.mark.asyncio
async def test_get_or_create_idempotent(outbox):
    """Test that get_or_create returns existing event without re-creating"""
    restaurant_id = "test-tenant-1"
    reservation_id = "res-123"
    event_type = "initial_confirmation"
    phone = "+34673036835"
    payload = {"test": "data"}

    # First call creates
    event1 = await outbox.get_or_create(restaurant_id, reservation_id, event_type, phone, payload)
    assert event1.state == "pending"
    assert event1.phone == phone
    id1 = event1.doc.get("_id")

    # Second call returns existing
    event2 = await outbox.get_or_create(restaurant_id, reservation_id, event_type, phone, payload)
    assert event2.state == "pending"
    id2 = event2.doc.get("_id")
    assert id1 == id2


@pytest.mark.asyncio
async def test_state_machine_pending_to_sent(outbox):
    """Test state machine: pending → claimed → sent"""
    restaurant_id = "test-tenant-2"
    reservation_id = "res-456"
    event = await outbox.get_or_create(restaurant_id, reservation_id, "initial_confirmation", "+34673036835", {})

    # Claim for delivery (pending → claimed)
    claimed = await outbox.claim_for_delivery(event)
    assert claimed is not None
    assert claimed.state == "claimed"
    assert claimed.processing_started_at is not None

    # Mark sent
    await outbox.mark_sent(claimed)
    refreshed = await claimed.refresh(outbox.collection)
    assert refreshed.state == "sent"
    assert refreshed.sent_at is not None


@pytest.mark.asyncio
async def test_claim_prevents_duplicates(outbox):
    """Test that atomic claim prevents concurrent sends"""
    restaurant_id = "test-tenant-3"
    reservation_id = "res-789"
    event = await outbox.get_or_create(restaurant_id, reservation_id, "initial_confirmation", "+34673036835", {})

    # First claim succeeds
    claim1 = await outbox.claim_for_delivery(event)
    assert claim1 is not None

    # Second claim fails (event already claimed)
    claim2 = await outbox.claim_for_delivery(event)
    assert claim2 is None


@pytest.mark.asyncio
async def test_retry_backoff(outbox):
    """Test exponential backoff: 2^retry_count seconds"""
    restaurant_id = "test-tenant-4"
    reservation_id = "res-999"
    event = await outbox.get_or_create(restaurant_id, reservation_id, "initial_confirmation", "+34673036835", {})

    # Fail event (retry_count=0, next_retry_at = now + 2s)
    failed1 = await outbox.mark_failed(event, "First error")
    assert failed1.retry_count == 1
    assert failed1.next_retry_at is not None

    # Parse next_retry_at and verify it's approximately 2 seconds away
    next_retry = datetime.fromisoformat(failed1.next_retry_at)
    now = datetime.now(timezone.utc)
    diff = (next_retry - now).total_seconds()
    assert 1 < diff < 3  # Allow 1-3 seconds


@pytest.mark.asyncio
async def test_max_retries_stops_retry(outbox):
    """Test that max retries prevents further scheduling"""
    restaurant_id = "test-tenant-5"
    reservation_id = "res-max"
    event = await outbox.get_or_create(restaurant_id, reservation_id, "initial_confirmation", "+34673036835", {})

    # Fail 3 times (MAX_RETRIES)
    for i in range(MAX_RETRIES):
        event = await outbox.mark_failed(event, f"Error {i+1}")
        assert event.retry_count == i + 1

    # Fourth failure should not schedule retry
    final = await outbox.mark_failed(event, "Final error")
    assert final.retry_count == MAX_RETRIES + 1
    assert final.next_retry_at is None


@pytest.mark.asyncio
async def test_claim_respects_retry_schedule(outbox):
    """Test that claim only succeeds if next_retry_at <= now"""
    restaurant_id = "test-tenant-6"
    reservation_id = "res-schedule"
    event = await outbox.get_or_create(restaurant_id, reservation_id, "initial_confirmation", "+34673036835", {})

    # Mark failed (next_retry_at = now + 2s)
    failed = await outbox.mark_failed(event, "Transient error")
    assert failed.next_retry_at is not None

    # Claim should fail (not yet time to retry)
    claim = await outbox.claim_for_delivery(failed)
    assert claim is None

    # Simulate time passing: update next_retry_at to past
    past_time = (datetime.now(timezone.utc) - timedelta(seconds=1)).isoformat()
    await outbox.collection.update_one(
        {"restaurant_id": restaurant_id, "key": failed.key},
        {"$set": {"next_retry_at": past_time}}
    )

    # Refresh and claim should succeed
    refreshed = await failed.refresh(outbox.collection)
    claim = await outbox.claim_for_delivery(refreshed)
    assert claim is not None
    assert claim.state == "claimed"


@pytest.mark.asyncio
async def test_abandoned_detection(outbox):
    """Test detection of abandoned claims (stuck > 5 minutes)"""
    restaurant_id = "test-tenant-7"
    reservation_id = "res-abandoned"
    event = await outbox.get_or_create(restaurant_id, reservation_id, "initial_confirmation", "+34673036835", {})

    # Claim event
    claimed = await outbox.claim_for_delivery(event)
    assert claimed is not None

    # Manually set processing_started_at to > 5 minutes ago
    old_time = (datetime.now(timezone.utc) - timedelta(seconds=301)).isoformat()
    await outbox.collection.update_one(
        {"restaurant_id": restaurant_id, "key": claimed.key},
        {"$set": {"processing_started_at": old_time}}
    )

    # Find abandoned
    abandoned = await outbox.find_abandoned_processing(restaurant_id)
    assert len(abandoned) == 1
    assert abandoned[0].state == "claimed"


@pytest.mark.asyncio
async def test_multitenant_isolation(outbox):
    """Test that events are isolated per restaurant_id"""
    event1 = await outbox.get_or_create("tenant-1", "res-1", "initial_confirmation", "+34111", {})
    event2 = await outbox.get_or_create("tenant-2", "res-2", "initial_confirmation", "+34222", {})

    # Same key but different tenants should not conflict
    event3 = await outbox.get_or_create("tenant-1", "res-1", "initial_confirmation", "+34111", {})
    assert event1.doc["_id"] == event3.doc["_id"]

    # Stats for tenant-1 should only show tenant-1 events
    stats = await outbox.get_stats("tenant-1")
    assert stats["total_events"] == 1
    assert stats["states"]["pending"] == 1


@pytest.mark.asyncio
async def test_unique_index_enforced(outbox):
    """Test that unique index on (restaurant_id, key) prevents duplicates at DB level"""
    from pymongo.errors import DuplicateKeyError

    restaurant_id = "test-tenant-8"
    reservation_id = "res-unique"

    event1 = await outbox.get_or_create(restaurant_id, reservation_id, "initial_confirmation", "+34111", {})

    # Try to insert same key directly
    with pytest.raises(DuplicateKeyError):
        await outbox.collection.insert_one({
            "restaurant_id": restaurant_id,
            "key": f"{restaurant_id}:{reservation_id}:initial_confirmation:customer",
            "state": "pending",
            "processing_started_at": None,
            "sent_at": None,
            "retry_count": 0,
            "next_retry_at": None,
        })
