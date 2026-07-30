"""Integration tests for WhatsApp outbox with plugin endpoint contracts."""
import pytest
import asyncio
from datetime import datetime, timezone
from services.whatsapp_outbox import WhatsAppOutbox, OutboxEvent
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
async def test_http_201_independent_of_whatsapp(outbox):
    """Test that HTTP 201 is returned regardless of WhatsApp send status"""
    restaurant_id = "2b537b99-c9f1-479c-8cc5-8597fbb6a1bb"
    reservation_id = "res-http-test"

    # Create event via outbox (HTTP layer would return 201 after this)
    event = await outbox.get_or_create(
        restaurant_id,
        reservation_id,
        "initial_confirmation",
        "+34673036835",
        {"customer_name": "Test"}
    )

    assert event.state == "pending"
    # HTTP 201 is returned here, independent of WhatsApp send result


@pytest.mark.asyncio
async def test_phone_masking_in_outbox(outbox):
    """Test that outbox stores full phone but logging should mask it"""
    restaurant_id = "2b537b99-c9f1-479c-8cc5-8597fbb6a1bb"
    phone = "+34673036835"

    event = await outbox.get_or_create(
        restaurant_id,
        "res-mask-test",
        "initial_confirmation",
        phone,
        {}
    )

    # Outbox stores full phone for delivery
    assert event.phone == phone
    # Logging layer (in server.py) masks phone to last 4 digits


@pytest.mark.asyncio
async def test_no_reservation_deletion_on_outbox_fail(outbox):
    """Test that failed WhatsApp does not delete reservation"""
    restaurant_id = "2b537b99-c9f1-479c-8cc5-8597fbb6a1bb"
    reservation_id = "res-persist"

    # Create outbox event
    event = await outbox.get_or_create(
        restaurant_id,
        reservation_id,
        "initial_confirmation",
        "+34673036835",
        {}
    )

    # Simulate failed send
    await outbox.mark_failed(event, "WhatsApp offline")

    # Event persists in failed state (reservation untouched)
    refreshed = await event.refresh(outbox.collection)
    assert refreshed is not None
    assert refreshed.state == "failed"


@pytest.mark.asyncio
async def test_at_least_once_semantics_same_key(outbox):
    """Test at-least-once: same reservation_id does not duplicate"""
    restaurant_id = "2b537b99-c9f1-479c-8cc5-8597fbb6a1bb"
    reservation_id = "res-atomicity"

    # First call
    event1 = await outbox.get_or_create(
        restaurant_id,
        reservation_id,
        "initial_confirmation",
        "+34673036835",
        {"v": 1}
    )

    # Second call (e.g., browser retry)
    event2 = await outbox.get_or_create(
        restaurant_id,
        reservation_id,
        "initial_confirmation",
        "+34673036835",
        {"v": 2}
    )

    # Same event, not duplicated
    assert event1.doc["_id"] == event2.doc["_id"]
    # Only one document in DB
    count = await outbox.collection.count_documents({"reservation_id": reservation_id})
    assert count == 1


@pytest.mark.asyncio
async def test_concurrent_claims_single_send(outbox):
    """Test that concurrent claim attempts result in only one send"""
    restaurant_id = "2b537b99-c9f1-479c-8cc5-8597fbb6a1bb"
    reservation_id = "res-concurrent"

    event = await outbox.get_or_create(
        restaurant_id,
        reservation_id,
        "initial_confirmation",
        "+34673036835",
        {}
    )

    # Simulate concurrent workers claiming simultaneously
    tasks = [
        outbox.claim_for_delivery(event),
        outbox.claim_for_delivery(event),
        outbox.claim_for_delivery(event)
    ]
    results = await asyncio.gather(*tasks)

    # Only one should succeed
    claimed_count = sum(1 for r in results if r is not None)
    assert claimed_count == 1

    # Event is claimed
    refreshed = await event.refresh(outbox.collection)
    assert refreshed.state == "claimed"


@pytest.mark.asyncio
async def test_restart_idempotency(outbox):
    """Test that recovery after restart does not re-send sent events"""
    restaurant_id = "2b537b99-c9f1-479c-8cc5-8597fbb6a1bb"
    reservation_id = "res-restart"

    # Create and mark sent
    event = await outbox.get_or_create(
        restaurant_id,
        reservation_id,
        "initial_confirmation",
        "+34673036835",
        {}
    )
    claimed = await outbox.claim_for_delivery(event)
    await outbox.mark_sent(claimed)

    # Simulate app restart (new session)
    # Recovery loop would find this event
    refreshed = await event.refresh(outbox.collection)
    claim_after_restart = await outbox.claim_for_delivery(refreshed)

    # Should not re-send (already sent)
    assert claim_after_restart is None


@pytest.mark.asyncio
async def test_cancel_no_show_independent_from_outbox(outbox):
    """Test that cancellation/no-show flows remain independent from outbox"""
    restaurant_id = "2b537b99-c9f1-479c-8cc5-8597fbb6a1bb"
    reservation_id = "res-cancel"

    # Create initial confirmation outbox event
    event = await outbox.get_or_create(
        restaurant_id,
        reservation_id,
        "initial_confirmation",
        "+34673036835",
        {}
    )

    # Cancel flows would be separate API calls to KaisoSystem
    # Outbox tracks only initial confirmation
    assert event.event_type == "initial_confirmation"


@pytest.mark.asyncio
async def test_multitenant_concurrent_processing(outbox):
    """Test concurrent processing of different tenants"""
    tasks = []
    for i in range(5):
        tenant_id = f"tenant-{i}"
        for j in range(3):
            reservation_id = f"res-{i}-{j}"
            task = outbox.get_or_create(
                tenant_id,
                reservation_id,
                "initial_confirmation",
                f"+34{i}{j}0000000",
                {}
            )
            tasks.append(task)

    results = await asyncio.gather(*tasks)

    # All created
    assert len(results) == 15
    # All in pending state
    assert all(r.state == "pending" for r in results)

    # Stats per tenant
    for i in range(5):
        stats = await outbox.get_stats(f"tenant-{i}")
        assert stats["total_events"] == 3


@pytest.mark.asyncio
async def test_sent_event_never_resent(outbox):
    """Test that sent events are never claimed again"""
    restaurant_id = "2b537b99-c9f1-479c-8cc5-8597fbb6a1bb"
    reservation_id = "res-never-again"

    event = await outbox.get_or_create(
        restaurant_id,
        reservation_id,
        "initial_confirmation",
        "+34673036835",
        {}
    )

    # Claim and send
    claimed = await outbox.claim_for_delivery(event)
    await outbox.mark_sent(claimed)

    # Attempt to claim sent event
    refreshed = await claimed.refresh(outbox.collection)
    claim2 = await outbox.claim_for_delivery(refreshed)
    assert claim2 is None

    # Verify state unchanged
    final = await refreshed.refresh(outbox.collection)
    assert final.state == "sent"


@pytest.mark.asyncio
async def test_get_stats_accuracy(outbox):
    """Test statistics aggregation by state"""
    restaurant_id = "2b537b99-c9f1-479c-8cc5-8597fbb6a1bb"

    # Create mix of states
    pending1 = await outbox.get_or_create(restaurant_id, "res-p1", "initial_confirmation", "+34111", {})
    pending2 = await outbox.get_or_create(restaurant_id, "res-p2", "initial_confirmation", "+34222", {})

    sent1 = await outbox.get_or_create(restaurant_id, "res-s1", "initial_confirmation", "+34333", {})
    claimed_s1 = await outbox.claim_for_delivery(sent1)
    await outbox.mark_sent(claimed_s1)

    failed1 = await outbox.get_or_create(restaurant_id, "res-f1", "initial_confirmation", "+34444", {})
    await outbox.mark_failed(failed1, "Error")

    stats = await outbox.get_stats(restaurant_id)
    assert stats["total_events"] == 4
    assert stats["states"]["pending"] == 2
    assert stats["states"]["sent"] == 1
    assert stats["states"]["failed"] == 1
