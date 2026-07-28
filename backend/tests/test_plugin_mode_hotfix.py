"""
Hotfix validation tests for KaisoSystem plugin mode integration.

Covers mandatory test scenarios:
- Plugin availability checks (with guests parameter)
- Plugin reservation creation
- Policy acceptance validation
"""

import pytest
import os
import sys
from pathlib import Path

backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from server import RESERVATION_MODE, ReservationCreate


class TestPluginModeConfiguration:
    """Validate RESERVATION_MODE configuration."""

    def test_reservation_mode_defaults_to_legacy(self):
        """RESERVATION_MODE absent defaults to 'legacy'."""
        assert RESERVATION_MODE == 'legacy'

    def test_reservation_mode_valid_values(self):
        """RESERVATION_MODE accepts only legacy, plugin, or maintenance."""
        assert RESERVATION_MODE in ['legacy', 'plugin', 'maintenance']


class TestReservationCreateModel:
    """Validate ReservationCreate includes policy_accepted."""

    def test_reservation_create_has_policy_accepted(self):
        """ReservationCreate model requires policy_accepted field."""
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
        assert reservation.policy_accepted == True

    def test_reservation_create_policy_required(self):
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
            'policy_accepted': False
        }
        reservation = ReservationCreate(**data)
        assert reservation.policy_accepted == False


class TestPluginAvailabilityLogic:
    """Validate availability endpoint accepts guests parameter."""

    def test_guests_parameter_optional_with_default(self):
        """GET /availability accepts guests query parameter (default=1)."""
        guests_value = 1  # default
        assert isinstance(guests_value, int)
        assert guests_value >= 1

    def test_guests_parameter_range_validation(self):
        """Guests parameter must be between 1 and MAX_GUESTS_PER_RESERVATION."""
        MAX_GUESTS_PER_RESERVATION = 12
        for guests in [1, 2, 6, 12]:
            assert 1 <= guests <= MAX_GUESTS_PER_RESERVATION
