"""
Backend Tests for Manual Reservation Feature
Tests POST /api/admin/reservations endpoint for manual bookings
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

# Use the public URL from env
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://manual-reservations.preview.emergentagent.com').rstrip('/')

# Admin credentials from backend/.env
ADMIN_USER = "admin"
ADMIN_PASSWORD = "reservas"

class TestManualReservationEndpoint:
    """Tests for POST /api/admin/reservations (manual reservation creation)"""
    
    @pytest.fixture
    def admin_auth(self):
        """Returns auth tuple for admin endpoints"""
        return (ADMIN_USER, ADMIN_PASSWORD)
    
    @pytest.fixture
    def future_date(self):
        """Returns a future date string in YYYY-MM-DD format"""
        # Use March 17, 2026 (Tuesday - not Monday which is closed)
        return "2026-03-17"
    
    def test_create_manual_reservation_minimal_fields(self, admin_auth, future_date):
        """Test creating manual reservation with only required fields (name, phone, guests, date, time)"""
        payload = {
            "customer_name": "TEST_Manual_Minimal",
            "customer_phone": "612345678",
            "guests": 2,
            "reservation_date": future_date,
            "reservation_time": "20:00"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reservations",
            json=payload,
            auth=admin_auth
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response data
        assert data["customer_name"] == payload["customer_name"]
        assert data["customer_phone"] == payload["customer_phone"]
        assert data["guests"] == payload["guests"]
        assert data["reservation_date"] == payload["reservation_date"]
        assert data["reservation_time"] == payload["reservation_time"]
        assert data["source"] == "manual", "Source should be 'manual' for admin-created reservations"
        assert data["status"] == "confirmada", "Manual reservations should be auto-confirmed"
        assert "id" in data, "Response should include reservation id"
        assert data["customer_email"] is None, "Email should be null when not provided"
        
    def test_create_manual_reservation_with_email(self, admin_auth, future_date):
        """Test creating manual reservation with optional email"""
        payload = {
            "customer_name": "TEST_Manual_Email",
            "customer_phone": "612345679",
            "customer_email": "test@example.com",
            "guests": 4,
            "reservation_date": future_date,
            "reservation_time": "21:00"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reservations",
            json=payload,
            auth=admin_auth
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["customer_email"] == "test@example.com"
        assert data["source"] == "manual"
        
    def test_create_manual_reservation_with_observations(self, admin_auth, future_date):
        """Test creating manual reservation with observations"""
        payload = {
            "customer_name": "TEST_Manual_Obs",
            "customer_phone": "612345680",
            "guests": 3,
            "reservation_date": future_date,
            "reservation_time": "19:30",
            "observations": "Llamada telefónica - mesa cerca de ventana"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reservations",
            json=payload,
            auth=admin_auth
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["observations"] == payload["observations"]
        assert data["source"] == "manual"
        
    def test_manual_reservation_requires_auth(self, future_date):
        """Test that manual reservation endpoint requires authentication"""
        payload = {
            "customer_name": "TEST_NoAuth",
            "customer_phone": "612345681",
            "guests": 2,
            "reservation_date": future_date,
            "reservation_time": "19:00"
        }
        
        # No auth
        response = requests.post(
            f"{BASE_URL}/api/admin/reservations",
            json=payload
        )
        
        assert response.status_code == 401, "Should return 401 without authentication"
        
    def test_manual_reservation_rejects_wrong_credentials(self, future_date):
        """Test that manual reservation endpoint rejects wrong credentials"""
        payload = {
            "customer_name": "TEST_WrongAuth",
            "customer_phone": "612345682",
            "guests": 2,
            "reservation_date": future_date,
            "reservation_time": "19:00"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reservations",
            json=payload,
            auth=("wronguser", "wrongpass")
        )
        
        assert response.status_code == 401, "Should return 401 with wrong credentials"
        
    def test_manual_reservation_requires_name(self, admin_auth, future_date):
        """Test that customer_name is required"""
        payload = {
            "customer_phone": "612345683",
            "guests": 2,
            "reservation_date": future_date,
            "reservation_time": "19:00"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reservations",
            json=payload,
            auth=admin_auth
        )
        
        assert response.status_code == 422, "Should return 422 for missing required field"
        
    def test_manual_reservation_requires_phone(self, admin_auth, future_date):
        """Test that customer_phone is required"""
        payload = {
            "customer_name": "TEST_NoPhone",
            "guests": 2,
            "reservation_date": future_date,
            "reservation_time": "19:00"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reservations",
            json=payload,
            auth=admin_auth
        )
        
        assert response.status_code == 422, "Should return 422 for missing phone"
        
    def test_manual_reservation_bypasses_availability_checks(self, admin_auth):
        """Test that manual reservations bypass capacity/availability checks"""
        # Use a Monday (normally closed) - should work for manual reservations
        payload = {
            "customer_name": "TEST_Monday_Bypass",
            "customer_phone": "612345684",
            "guests": 2,
            "reservation_date": "2026-03-16",  # Monday
            "reservation_time": "20:00"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reservations",
            json=payload,
            auth=admin_auth
        )
        
        # Manual reservations should bypass the "closed on Monday" rule
        assert response.status_code == 200, f"Manual reservation should bypass availability checks: {response.text}"
        data = response.json()
        assert data["source"] == "manual"
        
    def test_manual_reservation_bypasses_time_slot_validation(self, admin_auth, future_date):
        """Test that manual reservations bypass time slot validation"""
        # Use an unusual time that wouldn't be in normal time slots
        payload = {
            "customer_name": "TEST_Unusual_Time",
            "customer_phone": "612345685",
            "guests": 2,
            "reservation_date": future_date,
            "reservation_time": "18:37"  # Unusual time not in 15-min slots
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reservations",
            json=payload,
            auth=admin_auth
        )
        
        assert response.status_code == 200, "Manual reservation should accept any time"
        
        
class TestGetAdminReservationsWithSource:
    """Tests for GET /api/admin/reservations - verify source field"""
    
    @pytest.fixture
    def admin_auth(self):
        return (ADMIN_USER, ADMIN_PASSWORD)
    
    def test_get_reservations_includes_source_field(self, admin_auth):
        """Test that GET /api/admin/reservations returns source field"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reservations?date_from=2026-03-15&date_to=2026-03-20",
            auth=admin_auth
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check that at least some reservations exist
        assert isinstance(data, list)
        
        # Find a manual reservation (from our earlier tests)
        manual_reservations = [r for r in data if r.get("source") == "manual"]
        assert len(manual_reservations) > 0, "Should have at least one manual reservation from tests"
        
        # Verify manual reservation has correct source
        for res in manual_reservations:
            assert res["source"] == "manual"
            
    def test_online_reservation_has_online_source(self, admin_auth):
        """Test that regular public reservations have source='online'"""
        # First create a public reservation via the public endpoint
        public_payload = {
            "customer_name": "TEST_Online_Source",
            "customer_phone": "612345686",
            "customer_email": "online@test.com",
            "guests": 2,
            "reservation_date": "2026-03-17",  # Tuesday
            "reservation_time": "19:00",
            "observations": "",
            "has_tasting_menu": False,
            "tasting_allergies": ""
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/reservations",  # Public endpoint
            json=public_payload
        )
        
        assert create_response.status_code == 200
        created_res = create_response.json()
        assert created_res["source"] == "online", "Public reservation should have source='online'"
        
        # Verify via admin GET
        get_response = requests.get(
            f"{BASE_URL}/api/admin/reservations?date_from=2026-03-17&date_to=2026-03-17",
            auth=admin_auth
        )
        
        data = get_response.json()
        online_res = next((r for r in data if r.get("customer_name") == "TEST_Online_Source"), None)
        assert online_res is not None
        assert online_res["source"] == "online"
        

class TestManualReservationValidation:
    """Tests for input validation on manual reservations"""
    
    @pytest.fixture
    def admin_auth(self):
        return (ADMIN_USER, ADMIN_PASSWORD)
    
    def test_name_min_length_validation(self, admin_auth):
        """Test that name must be at least 2 characters"""
        payload = {
            "customer_name": "A",  # Too short
            "customer_phone": "612345687",
            "guests": 2,
            "reservation_date": "2026-03-17",
            "reservation_time": "19:00"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reservations",
            json=payload,
            auth=admin_auth
        )
        
        assert response.status_code == 422, "Should reject name with less than 2 characters"
        
    def test_phone_min_length_validation(self, admin_auth):
        """Test that phone must be at least 9 characters"""
        payload = {
            "customer_name": "TEST_Short_Phone",
            "customer_phone": "12345",  # Too short
            "guests": 2,
            "reservation_date": "2026-03-17",
            "reservation_time": "19:00"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reservations",
            json=payload,
            auth=admin_auth
        )
        
        assert response.status_code == 422, "Should reject phone with less than 9 characters"
        
    def test_guests_max_validation(self, admin_auth):
        """Test that guests cannot exceed MAX_GUESTS_PER_RESERVATION (12)"""
        payload = {
            "customer_name": "TEST_Too_Many_Guests",
            "customer_phone": "612345688",
            "guests": 15,  # Exceeds max of 12
            "reservation_date": "2026-03-17",
            "reservation_time": "19:00"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/reservations",
            json=payload,
            auth=admin_auth
        )
        
        assert response.status_code == 422, "Should reject guests exceeding max limit"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
