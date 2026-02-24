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

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None, auth=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Add basic auth if provided
        kwargs = {'headers': headers, 'timeout': 10}
        if auth:
            kwargs['auth'] = auth
        if params:
            kwargs['params'] = params
        if data and method in ['POST', 'PATCH']:
            kwargs['json'] = data

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        self.log(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, **kwargs)
            elif method == 'POST':
                response = requests.post(url, **kwargs)
            elif method == 'PATCH':
                response = requests.patch(url, **kwargs)
            elif method == 'DELETE':
                response = requests.delete(url, **kwargs)

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
        """Test get restaurant public configuration"""
        success, response = self.run_test(
            "Get Restaurant Config",
            "GET",
            "config",
            200
        )
        
        if success:
            # Validate config structure based on server.py
            required_keys = ['restaurant_name', 'phone', 'address', 'max_guests_per_reservation', 
                           'tasting_menu_price', 'discount_percentage', 'discount_days', 'tasting_days']
            for key in required_keys:
                if key not in response:
                    self.log(f"❌ Missing key in config: {key}", "FAIL")
                    return False
            
            # Validate specific values
            if response.get('restaurant_name') != 'Kaisō Sushi':
                self.log(f"❌ Invalid restaurant name: {response.get('restaurant_name')}", "FAIL")
                return False
            if response.get('discount_percentage') != 10:
                self.log(f"❌ Invalid discount percentage: {response.get('discount_percentage')}", "FAIL")
                return False
                
            self.log(f"✅ Config validation passed", "PASS")
        
        return success

    def test_get_availability_tuesday(self):
        """Test get availability for Tuesday (discount day, lunch+dinner)"""
        # Find next Tuesday
        days_ahead = (1 - datetime.now().weekday()) % 7  # Tuesday = 1
        if days_ahead == 0:  # Today is Tuesday
            days_ahead = 7
        tuesday = (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
        
        success, response = self.run_test(
            f"Get Availability for Tuesday {tuesday}",
            "GET",
            f"availability/{tuesday}",
            200
        )
        
        if success:
            # Validate Tuesday schedule: lunch 12:30-14:30, dinner 19:30-22:00
            required_keys = ['available', 'date', 'weekday', 'has_discount', 'lunch_slots', 'dinner_slots', 'tasting_available']
            for key in required_keys:
                if key not in response:
                    self.log(f"❌ Missing key in availability: {key}", "FAIL")
                    return False
            
            if not response.get('has_discount'):
                self.log(f"❌ Tuesday should have discount", "FAIL")
                return False
                
            if response.get('weekday') != 1:  # Tuesday = 1
                self.log(f"❌ Wrong weekday for Tuesday: {response.get('weekday')}", "FAIL")
                return False
                
            # Check lunch slots (12:30-14:30)
            lunch_slots = response.get('lunch_slots', [])
            if not lunch_slots:
                self.log(f"❌ Tuesday should have lunch slots", "FAIL")
                return False
                
            if '12:30' not in lunch_slots or '14:30' not in lunch_slots:
                self.log(f"❌ Tuesday lunch times incorrect: {lunch_slots}", "FAIL")
                return False
                
            # Check dinner slots (19:30-22:00)
            dinner_slots = response.get('dinner_slots', [])
            if not dinner_slots:
                self.log(f"❌ Tuesday should have dinner slots", "FAIL")
                return False
                
            if '19:30' not in dinner_slots or '22:00' not in dinner_slots:
                self.log(f"❌ Tuesday dinner times incorrect: {dinner_slots}", "FAIL")
                return False
                
            # Check tasting menu availability (Tue-Thu, 19:00-21:00)
            if not response.get('tasting_available'):
                self.log(f"❌ Tuesday should have tasting menu available", "FAIL")
                return False
                
            tasting_slots = response.get('tasting_slots', [])
            if '19:00' not in tasting_slots or '21:00' not in tasting_slots:
                self.log(f"❌ Tuesday tasting times incorrect: {tasting_slots}", "FAIL")
                return False
            
            # Check 15-minute intervals
            first_slots = lunch_slots[:5]  # Check first 5 slots
            for i in range(len(first_slots) - 1):
                t1 = datetime.strptime(first_slots[i], '%H:%M')
                t2 = datetime.strptime(first_slots[i+1], '%H:%M')
                diff = (t2 - t1).total_seconds() / 60
                if diff != 15:
                    self.log(f"❌ Time slots not 15 minutes apart: {first_slots[i]} -> {first_slots[i+1]}", "FAIL")
                    return False
                    
            self.log(f"✅ Tuesday availability validation passed", "PASS")
        
        return success

    def test_get_availability_monday(self):
        """Test get availability for Monday (closed)"""
        # Find next Monday
        days_ahead = (0 - datetime.now().weekday()) % 7  # Monday = 0  
        if days_ahead == 0:  # Today is Monday
            days_ahead = 7
        monday = (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
        
        success, response = self.run_test(
            f"Get Availability for Monday {monday} (closed)",
            "GET", 
            f"availability/{monday}",
            200
        )
        
        if success:
            if response.get('available'):
                self.log(f"❌ Monday should not be available (restaurant closed)", "FAIL")
                return False
            if "Restaurante fechado" not in response.get('reason', ''):
                self.log(f"❌ Wrong reason for Monday closure: {response.get('reason')}", "FAIL")
                return False
            self.log(f"✅ Monday correctly blocked", "PASS")
        
        return success

    def test_get_availability_friday(self):
        """Test get availability for Friday (extended lunch hours)"""
        # Find next Friday
        days_ahead = (4 - datetime.now().weekday()) % 7  # Friday = 4
        if days_ahead == 0:  # Today is Friday
            days_ahead = 7
        friday = (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
        
        success, response = self.run_test(
            f"Get Availability for Friday {friday}",
            "GET",
            f"availability/{friday}",
            200
        )
        
        if success:
            if response.get('has_discount'):
                self.log(f"❌ Friday should not have discount", "FAIL")
                return False
                
            # Check lunch slots (12:30-15:00 on Friday)
            lunch_slots = response.get('lunch_slots', [])
            if '15:00' not in lunch_slots:
                self.log(f"❌ Friday lunch should go until 15:00: {lunch_slots}", "FAIL")
                return False
                
            self.log(f"✅ Friday availability validation passed", "PASS")
        
        return success

    def test_invalid_date_availability(self):
        """Test get availability with invalid date format"""
        return self.run_test(
            "Get Availability - Invalid Date",
            "GET",
            "availability/invalid-date",
            400
        )

    def test_create_reservation_success(self):
        """Test creating a valid reservation"""
        # Find next Tuesday for discount and tasting menu
        days_ahead = (1 - datetime.now().weekday()) % 7
        if days_ahead == 0:
            days_ahead = 7
        tuesday = (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
        
        reservation_data = {
            "customer_name": "María González",
            "customer_email": "maria.test@example.com",
            "customer_phone": "+34673036835",
            "guests": 2,
            "reservation_date": tuesday,
            "reservation_time": "19:30",  # Valid dinner time
            "observations": "Mesa cerca de la ventana por favor",
            "has_tasting_menu": True,
            "tasting_allergies": "Sin mariscos"
        }
        
        success, response = self.run_test(
            "Create Valid Reservation",
            "POST",
            "reservations",
            200,
            data=reservation_data
        )
        
        if success:
            # Store reservation ID for admin tests
            self.reservation_id = response.get('id')
            
            # Validate reservation structure
            required_keys = ['id', 'customer_name', 'customer_email', 'status', 'has_discount', 'estimated_value']
            for key in required_keys:
                if key not in response:
                    self.log(f"❌ Missing key in reservation: {key}", "FAIL")
                    return False
            
            if response['status'] != 'pendente':
                self.log(f"❌ Invalid reservation status: {response['status']}", "FAIL")
                return False
                
            # Validate Tuesday discount
            if not response.get('has_discount'):
                self.log(f"❌ Tuesday reservation should have discount", "FAIL")
                return False
                
            # Validate estimated value (2 guests * €65.90 * 0.9 discount)
            expected_value = round(2 * 65.90 * 0.9, 2)
            if abs(response.get('estimated_value', 0) - expected_value) > 0.01:
                self.log(f"❌ Incorrect estimated value: {response.get('estimated_value')} vs {expected_value}", "FAIL")
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

    def test_create_reservation_monday(self):
        """Test creating reservation on Monday (closed)"""
        # Find next Monday
        days_ahead = (0 - datetime.now().weekday()) % 7
        if days_ahead == 0:
            days_ahead = 7
        monday = (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
        
        reservation_data = {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "+34600000001", 
            "guests": 2,
            "reservation_date": monday,
            "reservation_time": "13:00",
            "observations": ""
        }
        
        return self.run_test(
            "Create Reservation - Monday (Closed)",
            "POST", 
            "reservations",
            400,
            data=reservation_data
        )

    def test_create_reservation_tasting_invalid_day(self):
        """Test creating tasting menu reservation on Friday (not allowed)"""
        # Find next Friday
        days_ahead = (4 - datetime.now().weekday()) % 7
        if days_ahead == 0:
            days_ahead = 7
        friday = (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
        
        reservation_data = {
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "+34600000001",
            "guests": 2, 
            "reservation_date": friday,
            "reservation_time": "19:30",
            "has_tasting_menu": True,
            "observations": ""
        }
        
        return self.run_test(
            "Create Reservation - Tasting Menu on Friday (Invalid)",
            "POST",
            "reservations", 
            400,
            data=reservation_data
        )

    def test_whatsapp_message(self):
        """Test WhatsApp message generation"""
        params = {
            'name': 'María González',
            'guests': 2,
            'date': '2024-12-17',
            'time': '19:30',
            'tasting': True,
            'observations': 'Mesa cerca de la ventana'
        }
        
        success, response = self.run_test(
            "Generate WhatsApp Message",
            "GET",
            "whatsapp-message",
            200,
            params=params
        )
        
        if success:
            if 'whatsapp_url' not in response:
                self.log(f"❌ Missing whatsapp_url in response", "FAIL")
                return False
            if 'wa.me/34673036835' not in response['whatsapp_url']:
                self.log(f"❌ Wrong WhatsApp number in URL", "FAIL") 
                return False
            self.log(f"✅ WhatsApp URL generated correctly", "PASS")
        
        return success

    def test_admin_login_valid(self):
        """Test admin login with valid credentials"""
        auth = (self.admin_user, self.admin_pass)
        
        success, response = self.run_test(
            "Admin Login - Valid Credentials",
            "GET",
            "admin/stats", 
            200,
            auth=auth
        )
        
        if success:
            # Validate stats structure
            required_keys = ['today_date', 'today_reservations', 'today_guests', 'today_capacity', 'total_confirmed']
            for key in required_keys:
                if key not in response:
                    self.log(f"❌ Missing key in admin stats: {key}", "FAIL")
                    return False
            self.log(f"✅ Admin login successful", "PASS")
        
        return success

    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        auth = ('wrong', 'credentials')
        
        return self.run_test(
            "Admin Login - Invalid Credentials", 
            "GET",
            "admin/stats",
            401,
            auth=auth
        )

    def test_admin_get_reservations(self):
        """Test admin getting reservations list"""
        auth = (self.admin_user, self.admin_pass)
        
        success, response = self.run_test(
            "Admin Get Reservations",
            "GET", 
            "admin/reservations",
            200,
            auth=auth
        )
        
        if success and isinstance(response, list):
            # Should include our test reservation if it exists
            if self.reservation_id:
                found_test_reservation = any(r.get('id') == self.reservation_id for r in response)
                if found_test_reservation:
                    self.log(f"✅ Found test reservation in admin list", "PASS")
                else:
                    self.log(f"⚠️  Test reservation not found in admin list", "WARN")
        
        return success

    def test_admin_update_reservation(self):
        """Test admin updating reservation status"""
        if not self.reservation_id:
            self.log(f"⏭️  Skipping - no reservation ID available", "SKIP")
            return True
            
        auth = (self.admin_user, self.admin_pass)
        update_data = {
            "status": "confirmada",
            "admin_notes": "Confirmada por API test"
        }
        
        return self.run_test(
            "Admin Update Reservation Status",
            "PATCH",
            f"admin/reservations/{self.reservation_id}",
            200,
            data=update_data,
            auth=auth
        )

    def test_admin_blackout_dates(self):
        """Test admin blackout date management"""
        auth = (self.admin_user, self.admin_pass)
        test_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        
        # Add blackout date
        blackout_data = {
            "date": test_date,
            "reason": "Maintenance - API Test"
        }
        
        success1 = self.run_test(
            "Admin Add Blackout Date",
            "POST",
            "admin/blackout",
            200,
            data=blackout_data,
            auth=auth
        )[0]
        
        if not success1:
            return False
        
        # Get blackout dates
        success2 = self.run_test(
            "Admin Get Blackout Dates", 
            "GET",
            "admin/blackout",
            200,
            auth=auth
        )[0]
        
        if not success2:
            return False
        
        # Remove blackout date
        success3 = self.run_test(
            "Admin Remove Blackout Date",
            "DELETE", 
            f"admin/blackout/{test_date}",
            200,
            auth=auth
        )[0]
        
        return success3

    def run_all_tests(self):
        """Run all tests in logical order"""
        self.log("🚀 Starting Kaisō Sushi Reservation System API Tests", "START")
        self.log(f"🔗 Base URL: {self.base_url}", "INFO")
        
        # Basic connectivity tests
        self.test_api_root()
        self.test_get_config()
        
        # Availability tests
        self.test_get_availability_tuesday()
        self.test_get_availability_monday()
        self.test_get_availability_friday()
        self.test_invalid_date_availability()
        
        # Reservation creation tests
        self.test_create_reservation_success()
        self.test_create_reservation_invalid_time()
        self.test_create_reservation_monday()
        self.test_create_reservation_tasting_invalid_day()
        
        # WhatsApp integration
        self.test_whatsapp_message()
        
        # Admin authentication
        self.test_admin_login_valid()
        self.test_admin_login_invalid()
        
        # Admin operations
        self.test_admin_get_reservations()
        self.test_admin_update_reservation()
        self.test_admin_blackout_dates()
        
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
    
    tester = KaisoAPITester()
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)