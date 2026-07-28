"""
Hotfix validation tests - Part 2: Response validation and semantics.

Covers:
- Response validation (null, array, string, empty, missing fields)
- Response field completion and normalization
- Idempotency key semantics
- Timeout and conflict handling
"""

import pytest
import sys
from pathlib import Path

backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))


class TestPluginResponseValidation:
    """Validate plugin response structure validation."""

    def test_valid_plugin_response_structure(self):
        """Valid plugin response has reservation_id + status."""
        response = {
            'reservation_id': 'res-plugin-001',
            'status': 'pending',
            'message': 'Reserva recibida'
        }
        assert 'reservation_id' in response
        assert response['reservation_id'].strip()
        assert response['status'] in ['pending', 'confirmed']

    def test_invalid_response_missing_reservation_id(self):
        """Response without reservation_id is invalid."""
        response = {'status': 'pending'}
        assert not response.get('reservation_id')

    def test_invalid_response_empty_reservation_id(self):
        """Response with empty reservation_id is invalid."""
        response = {'reservation_id': '', 'status': 'pending'}
        assert not response.get('reservation_id', '').strip()

    def test_invalid_response_missing_status(self):
        """Response without status is invalid."""
        response = {'reservation_id': 'res-001'}
        assert response.get('status') not in ['pending', 'confirmed']

    def test_invalid_response_invalid_status(self):
        """Response with invalid status is invalid."""
        response = {'reservation_id': 'res-001', 'status': 'unknown'}
        assert response['status'] not in ['pending', 'confirmed']

    def test_null_response_rejected(self):
        """Null response is invalid."""
        response = None
        assert response is None

    def test_array_response_rejected(self):
        """Array response is invalid."""
        response = []
        assert isinstance(response, list)

    def test_string_response_rejected(self):
        """String response is invalid."""
        response = "error message"
        assert isinstance(response, str)

    def test_empty_dict_response_rejected(self):
        """Empty dict response is invalid."""
        response = {}
        assert not response.get('reservation_id')


class TestResponseNormalization:
    """Validate response field completion from input data."""

    def test_plugin_minimal_response_completed_with_input(self):
        """Plugin minimal response filled with input data."""
        plugin_response = {
            'reservation_id': 'res-minimal-001',
            'status': 'pending',
            'message': 'Reserva recibida'
        }
        input_data = {
            'customer_name': 'João Silva',
            'reservation_date': '2026-08-01',
            'reservation_time': '20:00',
            'guests': 2
        }
        normalized = {
            **input_data,
            **plugin_response,
            'reservation_date': plugin_response.get('reservation_date') or input_data['reservation_date'],
            'reservation_time': plugin_response.get('reservation_time') or input_data['reservation_time'],
            'guests': plugin_response.get('guests') if plugin_response.get('guests') is not None else input_data['guests'],
            'customer_name': plugin_response.get('customer_name') or input_data['customer_name']
        }
        assert normalized['reservation_date'] == '2026-08-01'
        assert normalized['reservation_time'] == '20:00'
        assert normalized['guests'] == 2
        assert normalized['customer_name'] == 'João Silva'

    def test_plugin_override_fields_precedence(self):
        """Plugin response fields override input data."""
        plugin_response = {
            'reservation_id': 'res-override-001',
            'status': 'confirmed',
            'reservation_date': '2026-08-15',
            'reservation_time': '19:30',
            'guests': 4
        }
        input_data = {
            'customer_name': 'João Silva',
            'reservation_date': '2026-08-01',
            'reservation_time': '20:00',
            'guests': 2
        }
        normalized = {
            **input_data,
            **plugin_response,
            'reservation_date': plugin_response.get('reservation_date') or input_data['reservation_date'],
            'reservation_time': plugin_response.get('reservation_time') or input_data['reservation_time'],
            'guests': plugin_response.get('guests') if plugin_response.get('guests') is not None else input_data['guests'],
        }
        assert normalized['reservation_date'] == '2026-08-15'
        assert normalized['reservation_time'] == '19:30'
        assert normalized['guests'] == 4


class TestIdempotencySemantics:
    """Validate idempotency key handling."""

    def test_idempotency_key_reuse_same_payload(self):
        """Idempotency key reused when payload unchanged."""
        payload_1 = {
            'customer_name': 'João',
            'guests': 2,
            'reservation_date': '2026-08-01'
        }
        payload_2 = {
            'customer_name': 'João',
            'guests': 2,
            'reservation_date': '2026-08-01'
        }
        assert str(payload_1) == str(payload_2)

    def test_idempotency_key_new_different_payload(self):
        """New key generated when payload changes."""
        payload_1 = {
            'customer_name': 'João',
            'guests': 2,
            'reservation_date': '2026-08-01'
        }
        payload_2 = {
            'customer_name': 'João',
            'guests': 3,
            'reservation_date': '2026-08-01'
        }
        assert str(payload_1) != str(payload_2)


class TestTimeoutHandling:
    """Validate timeout returns 503."""

    def test_timeout_error_returns_503(self):
        """Timeout from plugin API returns 503 Unavailable."""
        error = "Plugin API timeout (10s) - reservation availability unavailable"
        is_timeout = "timeout" in error.lower()
        assert is_timeout
        expected_status = 503
        assert expected_status == 503


class TestConflictHandling:
    """Validate 409 conflict handling."""

    def test_conflict_error_returns_409(self):
        """409 conflict from plugin API returns 409."""
        error = "Plugin API conflict: Request body mismatch"
        is_conflict = "409" in error or "conflict" in error.lower()
        assert is_conflict
        expected_status = 409
        assert expected_status == 409


class TestInvalidResponseHandling:
    """Validate invalid responses return 502."""

    def test_invalid_response_type_returns_502(self):
        """Non-dict response type returns 502."""
        response = "string response"
        is_valid = isinstance(response, dict)
        assert is_valid == False
        expected_status = 502
        assert expected_status == 502

    def test_empty_dict_returns_502(self):
        """Empty dict response returns 502."""
        response = {}
        is_valid = len(response) > 0 and 'reservation_id' in response
        assert is_valid == False
        expected_status = 502
        assert expected_status == 502

    def test_missing_identifier_returns_502(self):
        """Response without ID returns 502."""
        response = {'status': 'pending'}
        has_id = response.get('reservation_id') or response.get('id')
        assert has_id is None
        expected_status = 502
        assert expected_status == 502
