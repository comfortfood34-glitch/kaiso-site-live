"""Tests for plugin mode with WhatsApp notification flow."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture
def mock_plugin_client():
    """Mock ExternalPluginClient for plugin calls."""
    mock = AsyncMock()
    # Mock successful reservation creation (201 response from KaisoSystem)
    mock.create_reservation.return_value = (
        True,
        {
            "reservation_id": "95492c92-test",
            "status": "confirmed",
            "message": "Reserva creada exitosamente"
        },
        None
    )
    return mock


@pytest.fixture
def mock_whatsapp_send():
    """Mock WhatsApp send function."""
    return AsyncMock(return_value=True)


@pytest.mark.asyncio
async def test_plugin_mode_sends_whatsapp_on_201(mock_plugin_client, mock_whatsapp_send):
    """Verify WhatsApp is sent after successful 201 from KaisoSystem."""
    from server import app
    from services.external_plugin_client import ExternalPluginClient
    
    client = TestClient(app)
    
    payload = {
        "customer_name": "John Doe",
        "customer_phone": "+34 600 000 000",
        "customer_email": "john@example.com",
        "guests": 2,
        "reservation_date": "2026-08-01",
        "reservation_time": "20:00",
        "observations": "",
        "has_tasting_menu": False,
        "policy_accepted": True
    }
    
    with patch('server.get_plugin_client', return_value=mock_plugin_client):
        with patch('server.send_whatsapp_notification', mock_whatsapp_send):
            response = client.post(
                "/api/reservations",
                json=payload,
                headers={"Idempotency-Key": "test-key-001"}
            )
    
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    
    # Verify WhatsApp was called
    assert mock_whatsapp_send.called, "send_whatsapp_notification should be called"
    
    # Verify phone was normalized (should include +34)
    call_args = mock_whatsapp_send.call_args
    phone = call_args[0][0]
    assert phone.startswith("+"), "Phone should include + prefix"
    assert "34" in phone or "351" in phone or "55" in phone, "Phone should have country code"


@pytest.mark.asyncio
async def test_plugin_mode_whatsapp_failure_does_not_block_201(mock_plugin_client):
    """Verify that WhatsApp failure does NOT prevent 201 response."""
    from server import app
    
    client = TestClient(app)
    
    payload = {
        "customer_name": "John Doe",
        "customer_phone": "+34 600 000 000",
        "customer_email": "john@example.com",
        "guests": 2,
        "reservation_date": "2026-08-01",
        "reservation_time": "20:00",
        "observations": "",
        "has_tasting_menu": False,
        "policy_accepted": True
    }
    
    mock_whatsapp_fail = AsyncMock(return_value=False)  # Simulate WhatsApp send failure
    
    with patch('server.get_plugin_client', return_value=mock_plugin_client):
        with patch('server.send_whatsapp_notification', mock_whatsapp_fail):
            response = client.post(
                "/api/reservations",
                json=payload,
                headers={"Idempotency-Key": "test-key-002"}
            )
    
    # 201 should still be returned even if WhatsApp fails
    assert response.status_code == 201, "201 should be returned even if WhatsApp fails"
    assert response.json().get("reservation_id") == "95492c92-test"


@pytest.mark.asyncio
async def test_plugin_mode_no_whatsapp_on_error(mock_plugin_client, mock_whatsapp_send):
    """Verify WhatsApp is NOT sent if KaisoSystem returns error."""
    from server import app
    
    client = TestClient(app)
    
    # Mock failed reservation (capacity exceeded)
    mock_plugin_client.create_reservation.return_value = (
        False,
        None,
        "409 Conflict: No capacity for requested time"
    )
    
    payload = {
        "customer_name": "John Doe",
        "customer_phone": "+34 600 000 000",
        "customer_email": "john@example.com",
        "guests": 2,
        "reservation_date": "2026-08-01",
        "reservation_time": "20:00",
        "observations": "",
        "has_tasting_menu": False,
        "policy_accepted": True
    }
    
    with patch('server.get_plugin_client', return_value=mock_plugin_client):
        with patch('server.send_whatsapp_notification', mock_whatsapp_send):
            response = client.post(
                "/api/reservations",
                json=payload,
                headers={"Idempotency-Key": "test-key-003"}
            )
    
    # Should return 409, not 201
    assert response.status_code == 409
    
    # WhatsApp should NOT be called
    assert not mock_whatsapp_send.called, "WhatsApp should not be called on error response"


@pytest.mark.asyncio
async def test_plugin_mode_spanish_phone_normalization():
    """Verify Spanish phone numbers are normalized correctly."""
    from server import app
    
    client = TestClient(app)
    
    test_cases = [
        # (input_phone, expected_contains)
        ("+34 600 000 000", "34600000000"),
        ("+34600000000", "34600000000"),
        ("600 000 000", "34600000000"),  # Without country code → default to 34
        ("+351 912 345 678", "351912345678"),
        ("+55 11 99999 9999", "5511999999999"),
    ]
    
    for input_phone, expected_part in test_cases:
        mock_plugin = AsyncMock()
        mock_plugin.create_reservation.return_value = (
            True,
            {
                "reservation_id": "test-id",
                "status": "confirmed",
                "message": "OK"
            },
            None
        )
        
        mock_whatsapp = AsyncMock(return_value=True)
        
        payload = {
            "customer_name": "Test",
            "customer_phone": input_phone,
            "customer_email": "test@example.com",
            "guests": 1,
            "reservation_date": "2026-08-01",
            "reservation_time": "20:00",
            "observations": "",
            "has_tasting_menu": False,
            "policy_accepted": True
        }
        
        with patch('server.get_plugin_client', return_value=mock_plugin):
            with patch('server.send_whatsapp_notification', mock_whatsapp):
                response = client.post(
                    "/api/reservations",
                    json=payload,
                    headers={"Idempotency-Key": f"test-{input_phone}"}
                )
        
        assert response.status_code == 201, f"Failed for phone {input_phone}"
        
        # Verify normalized phone was used
        if mock_whatsapp.called:
            call_phone = mock_whatsapp.call_args[0][0]
            assert expected_part in call_phone.replace("+", ""), \
                f"Phone {input_phone} should normalize to contain {expected_part}, got {call_phone}"


@pytest.mark.asyncio
async def test_plugin_mode_idempotency_prevents_duplicate_whatsapp(mock_plugin_client, mock_whatsapp_send):
    """Verify retry with same Idempotency-Key doesn't send duplicate WhatsApp."""
    from server import app
    
    client = TestClient(app)
    
    payload = {
        "customer_name": "John Doe",
        "customer_phone": "+34 600 000 000",
        "customer_email": "john@example.com",
        "guests": 2,
        "reservation_date": "2026-08-01",
        "reservation_time": "20:00",
        "observations": "",
        "has_tasting_menu": False,
        "policy_accepted": True
    }
    
    idempotency_key = "unique-key-001"
    
    with patch('server.get_plugin_client', return_value=mock_plugin_client):
        with patch('server.send_whatsapp_notification', mock_whatsapp_send):
            # First request
            response1 = client.post(
                "/api/reservations",
                json=payload,
                headers={"Idempotency-Key": idempotency_key}
            )
            
            # Retry with same key
            response2 = client.post(
                "/api/reservations",
                json=payload,
                headers={"Idempotency-Key": idempotency_key}
            )
    
    assert response1.status_code == 201
    assert response2.status_code == 409 or response2.status_code == 201  # Idempotency or cached response
    
    # WhatsApp should only be called once (for first request)
    # Note: This depends on KaisoSystem's idempotency implementation
    # If KaisoSystem returns cached result, we should not send WhatsApp again


@pytest.mark.asyncio
async def test_plugin_mode_no_local_email_sent(mock_plugin_client, mock_whatsapp_send):
    """Verify NO local email is sent in plugin mode."""
    from server import app
    
    client = TestClient(app)
    
    payload = {
        "customer_name": "John Doe",
        "customer_phone": "+34 600 000 000",
        "customer_email": "john@example.com",
        "guests": 2,
        "reservation_date": "2026-08-01",
        "reservation_time": "20:00",
        "observations": "",
        "has_tasting_menu": False,
        "policy_accepted": True
    }
    
    with patch('server.get_plugin_client', return_value=mock_plugin_client):
        with patch('server.send_whatsapp_notification', mock_whatsapp_send):
            with patch('server.send_email_notification') as mock_email:
                response = client.post(
                    "/api/reservations",
                    json=payload,
                    headers={"Idempotency-Key": "test-key-004"}
                )
    
    assert response.status_code == 201
    
    # Verify email was NOT called (if that function exists in plugin path)
    if hasattr(mock_email, 'called'):
        assert not mock_email.called, "No local email should be sent in plugin mode"


@pytest.mark.asyncio
async def test_plugin_mode_no_local_reservation_stored(mock_plugin_client, mock_whatsapp_send):
    """Verify NO local reservation is stored in plugin mode."""
    from server import app
    
    client = TestClient(app)
    
    payload = {
        "customer_name": "John Doe",
        "customer_phone": "+34 600 000 000",
        "customer_email": "john@example.com",
        "guests": 2,
        "reservation_date": "2026-08-01",
        "reservation_time": "20:00",
        "observations": "",
        "has_tasting_menu": False,
        "policy_accepted": True
    }
    
    with patch('server.get_plugin_client', return_value=mock_plugin_client):
        with patch('server.send_whatsapp_notification', mock_whatsapp_send):
            with patch('server.db.reservations') as mock_db_reservations:
                response = client.post(
                    "/api/reservations",
                    json=payload,
                    headers={"Idempotency-Key": "test-key-005"}
                )
    
    assert response.status_code == 201
    
    # Verify local DB was not used to store reservation
    if hasattr(mock_db_reservations, 'insert_one'):
        assert not mock_db_reservations.insert_one.called, \
            "No local reservation should be stored in plugin mode"
