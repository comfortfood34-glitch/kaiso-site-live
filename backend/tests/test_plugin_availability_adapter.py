"""
Tests for plugin availability response adapter.

Validates that plugin responses are correctly transformed to frontend contract:
- lunch_slots (time < 17:00)
- dinner_slots (time >= 17:00)
- remaining_capacity (max remaining_people)
- original slots preserved
"""

import sys
from pathlib import Path
import pytest

backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from server import adapt_plugin_availability_response


class TestPluginAvailabilityAdapter:
    """Test response adaptation for plugin availability endpoint."""

    def test_valid_response_with_lunch_and_dinner(self):
        """Valid plugin response with lunch (13:30) and dinner (20:00) slots."""
        plugin_response = {
            "available": True,
            "slots": [
                {"time": "13:30", "remaining_people": 10},
                {"time": "20:00", "remaining_people": 30}
            ]
        }

        result = adapt_plugin_availability_response(plugin_response, "2026-08-01")

        assert result["available"] is True
        assert result["date"] == "2026-08-01"
        assert "13:30" in result["lunch_slots"]
        assert "20:00" in result["dinner_slots"]
        assert result["remaining_capacity"] == 30  # max of 10 and 30
        assert len(result["slots"]) == 2

    def test_lunch_only_slots(self):
        """Lunch-only slots (all times < 17:00)."""
        plugin_response = {
            "available": True,
            "slots": [
                {"time": "12:00", "remaining_people": 5},
                {"time": "12:30", "remaining_people": 8},
                {"time": "13:00", "remaining_people": 3}
            ]
        }

        result = adapt_plugin_availability_response(plugin_response, "2026-08-02")

        assert result["available"] is True
        assert len(result["lunch_slots"]) == 3
        assert len(result["dinner_slots"]) == 0
        assert result["remaining_capacity"] == 8

    def test_dinner_only_slots(self):
        """Dinner-only slots (all times >= 17:00)."""
        plugin_response = {
            "available": True,
            "slots": [
                {"time": "19:00", "remaining_people": 15},
                {"time": "20:00", "remaining_people": 20},
                {"time": "21:00", "remaining_people": 10}
            ]
        }

        result = adapt_plugin_availability_response(plugin_response, "2026-08-03")

        assert result["available"] is True
        assert len(result["lunch_slots"]) == 0
        assert len(result["dinner_slots"]) == 3
        assert result["remaining_capacity"] == 20

    def test_boundary_time_17_00_is_dinner(self):
        """Time 17:00 exactly should be classified as dinner."""
        plugin_response = {
            "available": True,
            "slots": [
                {"time": "16:59", "remaining_people": 5},
                {"time": "17:00", "remaining_people": 10}
            ]
        }

        result = adapt_plugin_availability_response(plugin_response, "2026-08-04")

        assert "16:59" in result["lunch_slots"]
        assert "17:00" in result["dinner_slots"]

    def test_unavailable_response(self):
        """Unavailable (available=False) returns empty slot arrays."""
        plugin_response = {
            "available": False,
            "reason": "Capacidade esgotada",
            "slots": []
        }

        result = adapt_plugin_availability_response(plugin_response, "2026-08-05")

        assert result["available"] is False
        assert result["remaining_capacity"] == 0
        assert result["lunch_slots"] == []
        assert result["dinner_slots"] == []
        assert result["reason"] == "Capacidade esgotada"

    def test_available_but_no_slots(self):
        """Available=True but empty slots array."""
        plugin_response = {
            "available": True,
            "slots": []
        }

        result = adapt_plugin_availability_response(plugin_response, "2026-08-06")

        assert result["available"] is True
        assert result["remaining_capacity"] == 0
        assert result["lunch_slots"] == []
        assert result["dinner_slots"] == []

    def test_invalid_response_not_dict(self):
        """Invalid: response is not a dictionary."""
        with pytest.raises(ValueError, match="dictionary"):
            adapt_plugin_availability_response("not a dict", "2026-08-07")

    def test_invalid_response_missing_available(self):
        """Invalid: response missing 'available' field."""
        plugin_response = {"slots": []}
        with pytest.raises(ValueError, match="available"):
            adapt_plugin_availability_response(plugin_response, "2026-08-08")

    def test_invalid_slots_not_list(self):
        """Invalid: 'slots' field is not a list."""
        plugin_response = {
            "available": True,
            "slots": "not a list"
        }
        with pytest.raises(ValueError, match="list"):
            adapt_plugin_availability_response(plugin_response, "2026-08-09")

    def test_slots_with_invalid_time_format(self):
        """Slots with invalid time format are skipped."""
        plugin_response = {
            "available": True,
            "slots": [
                {"time": "13:30", "remaining_people": 10},
                {"time": "invalid", "remaining_people": 5},
                {"time": "20:00", "remaining_people": 8}
            ]
        }

        result = adapt_plugin_availability_response(plugin_response, "2026-08-10")

        assert len(result["lunch_slots"]) == 1
        assert len(result["dinner_slots"]) == 1
        assert "13:30" in result["lunch_slots"]
        assert "20:00" in result["dinner_slots"]

    def test_response_preserves_original_slots(self):
        """Original slots array is preserved in response."""
        plugin_response = {
            "available": True,
            "slots": [
                {"time": "13:30", "remaining_people": 10},
                {"time": "20:00", "remaining_people": 20}
            ]
        }

        result = adapt_plugin_availability_response(plugin_response, "2026-08-11")

        assert result["slots"] == plugin_response["slots"]
        assert result["slots"][0]["time"] == "13:30"
        assert result["slots"][1]["remaining_people"] == 20

    def test_slots_are_sorted(self):
        """Lunch and dinner slots are sorted."""
        plugin_response = {
            "available": True,
            "slots": [
                {"time": "20:00", "remaining_people": 10},
                {"time": "13:00", "remaining_people": 5},
                {"time": "19:00", "remaining_people": 8},
                {"time": "12:00", "remaining_people": 3}
            ]
        }

        result = adapt_plugin_availability_response(plugin_response, "2026-08-12")

        assert result["lunch_slots"] == ["12:00", "13:00"]
        assert result["dinner_slots"] == ["19:00", "20:00"]

    def test_complex_mixed_response(self):
        """Complex response with multiple slots, various capacities."""
        plugin_response = {
            "available": True,
            "slots": [
                {"time": "12:30", "remaining_people": 4},
                {"time": "13:00", "remaining_people": 6},
                {"time": "13:30", "remaining_people": 5},
                {"time": "19:00", "remaining_people": 12},
                {"time": "19:30", "remaining_people": 15},
                {"time": "20:00", "remaining_people": 18},
                {"time": "20:30", "remaining_people": 10}
            ]
        }

        result = adapt_plugin_availability_response(plugin_response, "2026-08-13")

        assert result["available"] is True
        assert result["remaining_capacity"] == 18  # max
        assert len(result["lunch_slots"]) == 3
        assert len(result["dinner_slots"]) == 4
        assert result["lunch_slots"] == ["12:30", "13:00", "13:30"]
        assert result["dinner_slots"] == ["19:00", "19:30", "20:00", "20:30"]
