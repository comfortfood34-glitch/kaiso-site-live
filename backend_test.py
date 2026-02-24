#!/usr/bin/env python3
"""
Backend API Testing for Kaisō Sushi España Reservation System
Tests all API endpoints for functionality and data integrity
Updated to match actual server.py implementation
"""

import requests
import sys
import json
from datetime import datetime, timedelta
import time
import base64

class KaisoAPITester:
    def __init__(self, base_url="https://server-bridge-3.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.reservation_id = None
        self.admin_user = "admin"
        self.admin_pass = "reservas"

    def log(self, message, test_type="INFO"):
        print(f"[{test_type}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        self.log(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - Status: {response.status_code}", "PASS")
                if response.text:
                    try:
                        json_data = response.json()
                        self.log(f"   Response: {json.dumps(json_data, indent=2)[:200]}...")
                        return True, json_data
                    except:
                        return True, response.text
                return True, {}
            else:
                self.log(f"❌ FAILED - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"   Response: {response.text[:200]}")
                return False, {}

        except requests.exceptions.Timeout:
            self.log(f"❌ TIMEOUT - Request timed out after 10 seconds", "FAIL")
            return False, {}
        except Exception as e:
            self.log(f"❌ ERROR - {str(e)}", "FAIL")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test(
            "API Root",
            "GET",
            "",
            200
        )

    def test_get_config(self):
        """Test get restaurant configuration"""
        success, response = self.run_test(
            "Get Restaurant Config",
            "GET",
            "config",
            200
        )
        
        if success:
            # Validate config structure
            required_keys = ['restaurant_name', 'capacity_per_slot', 'lunch_slots', 'dinner_slots', 'time_slots']
            for key in required_keys:
                if key not in response:
                    self.log(f"❌ Missing key in config: {key}", "FAIL")
                    return False
            self.log(f"✅ Config validation passed", "PASS")
        
        return success

    def test_get_availability(self):
        """Test get availability for a future date"""
        # Test for tomorrow
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        success, response = self.run_test(
            f"Get Availability for {tomorrow}",
            "GET",
            f"reservations/availability/{tomorrow}",
            200
        )
        
        if success:
            # Validate availability structure
            required_keys = ['date', 'lunch_slots', 'dinner_slots']
            for key in required_keys:
                if key not in response:
                    self.log(f"❌ Missing key in availability: {key}", "FAIL")
                    return False
            
            # Check if slots have proper structure
            for slot in response['lunch_slots']:
                if not all(k in slot for k in ['time', 'available_capacity', 'is_available', 'period']):
                    self.log(f"❌ Invalid slot structure: {slot}", "FAIL")
                    return False
                    
            self.log(f"✅ Availability validation passed", "PASS")
        
        return success

    def test_invalid_date_availability(self):
        """Test get availability with invalid date format"""
        return self.run_test(
            "Get Availability - Invalid Date",
            "GET",
            "reservations/availability/invalid-date",
            400
        )

    def test_create_reservation_success(self):
        """Test creating a valid reservation"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        reservation_data = {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "+34600000001",
            "guests": 2,
            "reservation_date": tomorrow,
            "reservation_time": "13:00",
            "observations": "Test reservation for API testing"
        }
        
        success, response = self.run_test(
            "Create Valid Reservation",
            "POST",
            "reservations",
            200,
            data=reservation_data
        )
        
        if success:
            # Store reservation details for later tests
            self.reservation_id = response.get('id')
            self.cancel_token = response.get('cancel_token')
            
            # Validate reservation structure
            required_keys = ['id', 'customer_name', 'customer_email', 'status', 'cancel_token']
            for key in required_keys:
                if key not in response:
                    self.log(f"❌ Missing key in reservation: {key}", "FAIL")
                    return False
            
            if response['status'] != 'confirmed':
                self.log(f"❌ Invalid reservation status: {response['status']}", "FAIL")
                return False
                
            self.log(f"✅ Reservation created with ID: {self.reservation_id[:8]}...", "PASS")
        
        return success

    def test_create_reservation_invalid_time(self):
        """Test creating reservation with invalid time slot"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        reservation_data = {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "+34600000001",
            "guests": 2,
            "reservation_date": tomorrow,
            "reservation_time": "15:30",  # Invalid time slot
            "observations": ""
        }
        
        return self.run_test(
            "Create Reservation - Invalid Time",
            "POST",
            "reservations",
            400,
            data=reservation_data
        )

    def test_create_reservation_missing_data(self):
        """Test creating reservation with missing required data"""
        reservation_data = {
            "customer_name": "Test Customer",
            # Missing email, phone, etc.
            "guests": 2,
        }
        
        return self.run_test(
            "Create Reservation - Missing Data",
            "POST",
            "reservations",
            422,  # Validation error
            data=reservation_data
        )

    def test_get_reservations_admin(self):
        """Test getting all reservations (admin endpoint)"""
        return self.run_test(
            "Get All Reservations (Admin)",
            "GET",
            "reservations",
            200
        )

    def test_get_reservations_with_filters(self):
        """Test getting reservations with date filters"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        params = {
            'date_from': tomorrow,
            'date_to': tomorrow,
            'status': 'confirmed'
        }
        
        success, response = self.run_test(
            "Get Reservations with Filters",
            "GET",
            "reservations",
            200,
            params=params
        )
        
        if success and isinstance(response, list):
            # Should include our test reservation
            found_test_reservation = any(r.get('id') == self.reservation_id for r in response)
            if found_test_reservation:
                self.log(f"✅ Found test reservation in filtered results", "PASS")
            else:
                self.log(f"⚠️  Test reservation not found in filtered results", "WARN")
        
        return success

    def test_get_reservation_by_token(self):
        """Test getting reservation by cancel token"""
        if not self.cancel_token:
            self.log(f"⏭️  Skipping - no cancel token available", "SKIP")
            return True
            
        success, response = self.run_test(
            "Get Reservation by Token",
            "GET",
            f"reservations/by-token/{self.cancel_token}",
            200
        )
        
        if success:
            if response.get('id') != self.reservation_id:
                self.log(f"❌ Token returned wrong reservation", "FAIL")
                return False
            self.log(f"✅ Token correctly returned reservation", "PASS")
        
        return success

    def test_get_reservation_invalid_token(self):
        """Test getting reservation with invalid token"""
        return self.run_test(
            "Get Reservation - Invalid Token",
            "GET",
            "reservations/by-token/invalid-token-123",
            404
        )

    def test_get_reservation_stats(self):
        """Test getting reservation statistics"""
        success, response = self.run_test(
            "Get Reservation Stats",
            "GET",
            "reservations/stats",
            200
        )
        
        if success:
            # Validate stats structure
            required_keys = ['total_confirmed', 'today_reservations', 'today_guests', 'week_reservations']
            for key in required_keys:
                if key not in response:
                    self.log(f"❌ Missing key in stats: {key}", "FAIL")
                    return False
                    
            # Validate that values are numbers
            for key in required_keys:
                if not isinstance(response[key], int):
                    self.log(f"❌ Stats value should be integer: {key}={response[key]}", "FAIL")
                    return False
            
            self.log(f"✅ Stats validation passed", "PASS")
        
        return success

    def test_cancel_reservation_by_token(self):
        """Test cancelling reservation using token"""
        if not self.cancel_token:
            self.log(f"⏭️  Skipping - no cancel token available", "SKIP")
            return True
            
        success, response = self.run_test(
            "Cancel Reservation by Token",
            "POST",
            f"reservations/cancel/{self.cancel_token}",
            200
        )
        
        if success:
            if 'message' not in response:
                self.log(f"❌ Missing confirmation message", "FAIL")
                return False
            self.log(f"✅ Reservation cancelled successfully", "PASS")
        
        return success

    def test_cancel_already_cancelled(self):
        """Test cancelling an already cancelled reservation"""
        if not self.cancel_token:
            self.log(f"⏭️  Skipping - no cancel token available", "SKIP")
            return True
            
        return self.run_test(
            "Cancel Already Cancelled Reservation",
            "POST",
            f"reservations/cancel/{self.cancel_token}",
            400
        )

    def test_admin_cancel_reservation(self):
        """Test admin cancelling reservation by ID"""
        if not self.reservation_id:
            self.log(f"⏭️  Skipping - no reservation ID available", "SKIP")
            return True
            
        return self.run_test(
            "Admin Cancel Reservation",
            "DELETE",
            f"reservations/{self.reservation_id}",
            200
        )

    def run_all_tests(self):
        """Run all tests in logical order"""
        self.log("🚀 Starting Kaisō Sushi Reservation System API Tests", "START")
        self.log(f"🔗 Base URL: {self.base_url}", "INFO")
        
        # Basic connectivity tests
        self.test_api_root()
        self.test_get_config()
        
        # Availability tests
        self.test_get_availability()
        self.test_invalid_date_availability()
        
        # Reservation creation tests
        self.test_create_reservation_success()
        self.test_create_reservation_invalid_time()
        self.test_create_reservation_missing_data()
        
        # Admin endpoints
        self.test_get_reservations_admin()
        self.test_get_reservations_with_filters()
        self.test_get_reservation_stats()
        
        # Token-based operations
        self.test_get_reservation_by_token()
        self.test_get_reservation_invalid_token()
        
        # Cancellation tests
        self.test_cancel_reservation_by_token()
        self.test_cancel_already_cancelled()
        
        # Print summary
        self.log("", "")
        self.log("=" * 50, "")
        self.log("📊 TEST SUMMARY", "SUMMARY")
        self.log(f"Tests run: {self.tests_run}", "SUMMARY")
        self.log(f"Tests passed: {self.tests_passed}", "SUMMARY")
        self.log(f"Tests failed: {self.tests_run - self.tests_passed}", "SUMMARY")
        self.log(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%", "SUMMARY")
        
        if self.tests_passed == self.tests_run:
            self.log("🎉 ALL TESTS PASSED! Backend API is working correctly.", "SUCCESS")
            return True
        else:
            failed_count = self.tests_run - self.tests_passed
            self.log(f"❌ {failed_count} test(s) failed. Please check the backend implementation.", "ERROR")
            return False

def main():
    """Main test execution"""
    print("Kaisō Sushi España - Backend API Test Suite")
    print("=" * 50)
    
    tester = ReservationAPITester()
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)