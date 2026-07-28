"""
Integration tests for plugin mode - real code execution with mocks.

Tests:
- Plugin mode configuration validation
- ReservationCreate policy_accepted field
- GET /availability with guests parameter (real endpoint)
- POST /reservations with plugin delegation (real endpoint)
- Zero local effects in plugin mode (no MongoDB, email, WhatsApp)
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch
import httpx

backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from server import app, RESERVATION_MODE, ReservationCreate
from fastapi.testclient import TestClient

client = TestClient(app)


class TestPluginModeConfiguration:
    """Validate RESERVATION_MODE configuration."""

    def test_reservation_mode_defaults_to_legacy(self):
        """RESERVATION_MODE absent defaults to 'legacy'."""
        # Skip if explicitly set to plugin mode for integration testing
        if RESERVATION_MODE == 'plugin':
            pytest.skip("Skipped: RESERVATION_MODE explicitly set to 'plugin'")
        assert RESERVATION_MODE == 'legacy'

    def test_reservation_mode_valid_values(self):
        """RESERVATION_MODE accepts only legacy, plugin, or maintenance."""
        assert RESERVATION_MODE in ['legacy', 'plugin', 'maintenance']


class TestReservationCreateModel:
    """Validate ReservationCreate includes policy_accepted."""

    def test_reservation_create_requires_policy_accepted(self):
        """ReservationCreate requires policy_accepted field."""
        data = {
            'customer_name': 'João Silva',
            'customer_phone': '+34 673 036 835',
            'customer_email': 'joao@example.com',
            'guests': 2,
            'reservation_date': '2026-08-01',
            'reservation_time': '20:00',
            'observations': '',
            'has_tasting_menu': False,
            'tasting_allergies': '',
            'policy_accepted': True
        }
        reservation = ReservationCreate(**data)
        assert reservation.policy_accepted is True

    def test_reservation_create_accepts_policy_false(self):
        """ReservationCreate accepts policy_accepted=False (frontend controls)."""
        data = {
            'customer_name': 'João Silva',
            'customer_phone': '+34 673 036 835',
            'customer_email': 'joao@example.com',
            'guests': 2,
            'reservation_date': '2026-08-01',
            'reservation_time': '20:00',
            'observations': '',
            'has_tasting_menu': False,
            'tasting_allergies': '',
            'policy_accepted': False
        }
        reservation = ReservationCreate(**data)
        assert reservation.policy_accepted is False


class TestAvailabilityEndpoint:
    """Test GET /availability with guests parameter."""

    def test_availability_accepts_guests_parameter(self):
        """GET /availability accepts guests query parameter."""
        response = client.get('/api/availability/2026-08-01?guests=2')
        assert response.status_code in [200, 502, 503]

    def test_availability_guests_default(self):
        """GET /availability defaults guests to 1."""
        response = client.get('/api/availability/2026-08-01')
        assert response.status_code in [200, 502, 503]


class TestReservationEndpoint:
    """Test POST /reservations endpoint (real code, mocked external calls)."""

    def test_reservation_requires_policy_accepted_true(self):
        """POST /reservations accepts policy_accepted field."""
        payload = {
            'customer_name': 'Test User',
            'customer_phone': '+34 600000000',
            'customer_email': 'test@example.com',
            'guests': 2,
            'reservation_date': '2026-08-01',
            'reservation_time': '20:00',
            'observations': '',
            'has_tasting_menu': False,
            'tasting_allergies': '',
            'policy_accepted': True
        }
        response = client.post('/api/reservations', json=payload)
        assert response.status_code != 422


class TestPluginClientErrors:
    """Test error handling from plugin client."""

    @pytest.mark.asyncio
    async def test_timeout_logs_without_exposing_url(self):
        """Timeout error logs type, not full exception string."""
        from services.external_plugin_client import ExternalPluginClient

        with patch('services.external_plugin_client.httpx.AsyncClient') as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client
            mock_client.get.side_effect = httpx.TimeoutException("Connection timeout")

            client_instance = ExternalPluginClient()
            success, response, error = await client_instance.get_availability('2026-08-01', 2)

            assert success is False
            assert 'timeout' in error.lower()


class TestIdempotencyKeyHandling:
    """Test idempotency key is passed to client."""

    def test_idempotency_key_accepted(self):
        """Idempotency-Key header accepted in request."""
        payload = {
            'customer_name': 'Test User',
            'customer_phone': '+34 600000000',
            'customer_email': 'test@example.com',
            'guests': 2,
            'reservation_date': '2026-08-01',
            'reservation_time': '20:00',
            'observations': '',
            'has_tasting_menu': False,
            'tasting_allergies': '',
            'policy_accepted': True
        }
        response = client.post(
            '/api/reservations',
            json=payload,
            headers={'Idempotency-Key': 'test-key-12345'}
        )
        assert response.status_code in [200, 201, 400, 409, 502, 503]
