"""Integration tests for WhatsApp outbox with plugin mode reservations."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

from services.whatsapp_outbox import get_outbox_service
from services.outbox_integration import create_outbox_event_for_reservation, trigger_immediate_processing


@pytest.fixture
def mock_db():
    """Mock MongoDB database."""
    db = MagicMock(spec=AsyncIOMotorDatabase)
    db.whatsapp_outbox = MagicMock()
    db.whatsapp_outbox.insert_one = AsyncMock()
    db.whatsapp_outbox.find = MagicMock()
    db.whatsapp_outbox.find_one_and_update = AsyncMock()
    db.whatsapp_outbox.update_one = AsyncMock()
    return db


@pytest.mark.asyncio
async def test_plugin_reservation_creates_outbox_event(mock_db):
    """Plugin reservation creates exactly one outbox event."""
    mock_db.whatsapp_outbox.insert_one = AsyncMock()

    result = await create_outbox_event_for_reservation(
        db=mock_db,
        reservation_id="res-plugin-001",
        phone="+34612345678",
        customer_name="João Silva",
        date="2026-08-20",
        time="20:00",
        guests=4,
    )

    assert result is True
    assert mock_db.whatsapp_outbox.insert_one.call_count == 1


@pytest.mark.asyncio
async def test_outbox_idempotency_duplicate_key(mock_db):
    """Duplicate reservation IDs don't create duplicate outbox events."""
    from pymongo.errors import DuplicateKeyError

    mock_db.whatsapp_outbox.insert_one = AsyncMock()

    # First creation succeeds
    result1 = await create_outbox_event_for_reservation(
        db=mock_db,
        reservation_id="res-dup-001",
        phone="+34687654321",
        customer_name="Maria Garcia",
        date="2026-08-21",
        time="19:30",
        guests=2,
    )
    assert result1 is True

    # Second creation with same reservation_id triggers DuplicateKeyError
    mock_db.whatsapp_outbox.insert_one.side_effect = DuplicateKeyError("duplicate key")
    result2 = await create_outbox_event_for_reservation(
        db=mock_db,
        reservation_id="res-dup-001",  # Same ID
        phone="+34687654321",
        customer_name="Maria Garcia",
        date="2026-08-21",
        time="19:30",
        guests=2,
    )

    # Idempotent: still returns True
    assert result2 is True


@pytest.mark.asyncio
async def test_outbox_graceful_failure(mock_db):
    """Outbox errors don't crash reservation process."""
    mock_db.whatsapp_outbox.insert_one = AsyncMock(
        side_effect=Exception("Database error")
    )

    result = await create_outbox_event_for_reservation(
        db=mock_db,
        reservation_id="res-error-001",
        phone="+34612345678",
        customer_name="Pedro Costa",
        date="2026-08-22",
        time="21:00",
        guests=3,
    )

    # Graceful failure: returns False
    assert result is False


@pytest.mark.asyncio
async def test_scheduler_processes_and_marks_sent(mock_db):
    """Scheduler processes pending messages and marks successful sends as sent."""
    pending_msg = {
        "_id": "msg-001",
        "phone": "+34612345678",
        "customer_name": "João Silva",
        "date": "2026-08-20",
        "time": "20:00",
        "guests": 4,
        "state": "pending",
        "retry_count": 0,
        "max_retries": 3,
        "processing_started_at": None,
        "claim_token": None,
        "next_retry_at": datetime.now(timezone.utc),
        "reservation_id": "res-plugin-001",
    }

    mock_db.whatsapp_outbox.find = MagicMock()
    mock_db.whatsapp_outbox.find().to_list = AsyncMock(return_value=[pending_msg])
    mock_db.whatsapp_outbox.find_one_and_update = AsyncMock(return_value={
        **pending_msg,
        "state": "processing",
        "claim_token": "claim-token-001",
    })
    mock_db.whatsapp_outbox.update_one = AsyncMock()

    async def mock_send(phone, data):
        return True

    outbox = get_outbox_service(mock_db)
    stats = await outbox.claim_and_process_pending(mock_send)

    assert mock_db.whatsapp_outbox.find_one_and_update.call_count > 0
    assert stats["sent"] >= 1


@pytest.mark.asyncio
async def test_scheduler_marks_failed_with_retry(mock_db):
    """Scheduler marks failed sends for retry with backoff."""
    pending_msg = {
        "_id": "msg-002",
        "phone": "+34687654321",
        "customer_name": "Maria Garcia",
        "date": "2026-08-21",
        "time": "19:30",
        "guests": 2,
        "state": "pending",
        "retry_count": 0,
        "max_retries": 3,
        "processing_started_at": None,
        "claim_token": None,
        "next_retry_at": datetime.now(timezone.utc),
        "reservation_id": "res-fail-001",
    }

    mock_db.whatsapp_outbox.find = MagicMock()
    mock_db.whatsapp_outbox.find().to_list = AsyncMock(return_value=[pending_msg])
    mock_db.whatsapp_outbox.find_one_and_update = AsyncMock(return_value={
        **pending_msg,
        "state": "processing",
        "claim_token": "claim-token-002",
    })
    mock_db.whatsapp_outbox.update_one = AsyncMock()

    async def mock_send_fail(phone, data):
        return False

    outbox = get_outbox_service(mock_db)
    stats = await outbox.claim_and_process_pending(mock_send_fail)

    assert stats["failed"] >= 1
    assert mock_db.whatsapp_outbox.update_one.call_count >= 1


@pytest.mark.asyncio
async def test_recovery_abandoned_claims(mock_db):
    """Recovery detects abandoned claims and marks for retry."""
    abandoned_msg = {
        "_id": "msg-003",
        "state": "processing",
        "processing_started_at": datetime.now(timezone.utc) - __import__('datetime').timedelta(minutes=10),
        "reservation_id": "res-abandoned-001",
    }

    mock_db.whatsapp_outbox.find = MagicMock()
    mock_db.whatsapp_outbox.find().to_list = AsyncMock(return_value=[abandoned_msg])
    mock_db.whatsapp_outbox.update_one = AsyncMock()

    outbox = get_outbox_service(mock_db)
    stats = await outbox.recover_abandoned_claims()

    assert stats["recovered"] >= 1
    assert mock_db.whatsapp_outbox.update_one.call_count >= 1
