#!/usr/bin/env python3
"""
Backend Testing Script for Kraken Messenger Telegram API Integration
Tests the Telegram API endpoints for functionality and integration
"""

import requests
import json
import sys
import time
from typing import Dict, Any

# Backend URL from frontend .env
BACKEND_URL = "https://secure-chat-mvp-1.preview.emergentagent.com/api"

# Test phone number from review request
TEST_PHONE = "+996709195105"

class TelegramAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.results = {}
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages"""
        print(f"[{level}] {message}")
        
    def test_health_endpoint(self) -> bool:
        """Test GET /api/health endpoint"""
        self.log("Testing Health Check endpoint...")
        
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=10)
            
            self.log(f"Health endpoint status: {response.status_code}")
            self.log(f"Health endpoint response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                if "status" in data and "telegram_api_configured" in data:
                    if data["status"] == "healthy" and data["telegram_api_configured"] is True:
                        self.log("✅ Health check passed - Telegram API configured", "SUCCESS")
                        self.results["health_check"] = {"status": "passed", "data": data}
                        return True
                    else:
                        self.log(f"❌ Health check failed - Status: {data.get('status')}, Telegram configured: {data.get('telegram_api_configured')}", "ERROR")
                        self.results["health_check"] = {"status": "failed", "error": "Invalid health status or Telegram not configured", "data": data}
                        return False
                else:
                    self.log("❌ Health check failed - Missing required fields", "ERROR")
                    self.results["health_check"] = {"status": "failed", "error": "Missing required fields in response", "data": data}
                    return False
            else:
                self.log(f"❌ Health check failed - HTTP {response.status_code}", "ERROR")
                self.results["health_check"] = {"status": "failed", "error": f"HTTP {response.status_code}", "response": response.text}
                return False
                
        except requests.exceptions.RequestException as e:
            self.log(f"❌ Health check failed - Connection error: {str(e)}", "ERROR")
            self.results["health_check"] = {"status": "failed", "error": f"Connection error: {str(e)}"}
            return False
        except json.JSONDecodeError as e:
            self.log(f"❌ Health check failed - Invalid JSON response: {str(e)}", "ERROR")
            self.results["health_check"] = {"status": "failed", "error": f"Invalid JSON: {str(e)}", "response": response.text}
            return False
            
    def test_send_code_endpoint(self) -> bool:
        """Test POST /api/telegram/auth/send-code endpoint"""
        self.log("Testing Send Code endpoint...")
        
        try:
            payload = {"phone": TEST_PHONE}
            response = self.session.post(
                f"{BACKEND_URL}/telegram/auth/send-code", 
                json=payload,
                timeout=30  # Longer timeout for Telegram API calls
            )
            
            self.log(f"Send code endpoint status: {response.status_code}")
            self.log(f"Send code endpoint response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ["success", "phone", "phone_code_hash"]
                if all(field in data for field in required_fields):
                    if data["success"] is True and data["phone"] == TEST_PHONE and data["phone_code_hash"]:
                        self.log("✅ Send code passed - Code sent successfully", "SUCCESS")
                        self.results["send_code"] = {"status": "passed", "data": data}
                        return True
                    else:
                        self.log(f"❌ Send code failed - Invalid response data: {data}", "ERROR")
                        self.results["send_code"] = {"status": "failed", "error": "Invalid response data", "data": data}
                        return False
                else:
                    self.log(f"❌ Send code failed - Missing required fields. Got: {list(data.keys())}", "ERROR")
                    self.results["send_code"] = {"status": "failed", "error": "Missing required fields", "data": data}
                    return False
            else:
                self.log(f"❌ Send code failed - HTTP {response.status_code}", "ERROR")
                try:
                    error_data = response.json()
                    self.results["send_code"] = {"status": "failed", "error": f"HTTP {response.status_code}", "data": error_data}
                except:
                    self.results["send_code"] = {"status": "failed", "error": f"HTTP {response.status_code}", "response": response.text}
                return False
                
        except requests.exceptions.Timeout:
            self.log("❌ Send code failed - Request timeout (30s)", "ERROR")
            self.results["send_code"] = {"status": "failed", "error": "Request timeout"}
            return False
        except requests.exceptions.RequestException as e:
            self.log(f"❌ Send code failed - Connection error: {str(e)}", "ERROR")
            self.results["send_code"] = {"status": "failed", "error": f"Connection error: {str(e)}"}
            return False
        except json.JSONDecodeError as e:
            self.log(f"❌ Send code failed - Invalid JSON response: {str(e)}", "ERROR")
            self.results["send_code"] = {"status": "failed", "error": f"Invalid JSON: {str(e)}", "response": response.text}
            return False
            
    def test_basic_endpoints(self) -> bool:
        """Test basic API endpoints for connectivity"""
        self.log("Testing basic API connectivity...")
        
        try:
            # Test root endpoint
            response = self.session.get(f"{BACKEND_URL}/", timeout=10)
            self.log(f"Root endpoint status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                self.log(f"Root endpoint response: {data}")
                self.results["basic_connectivity"] = {"status": "passed", "data": data}
                return True
            else:
                self.log(f"❌ Basic connectivity failed - HTTP {response.status_code}", "ERROR")
                self.results["basic_connectivity"] = {"status": "failed", "error": f"HTTP {response.status_code}"}
                return False
                
        except Exception as e:
            self.log(f"❌ Basic connectivity failed - {str(e)}", "ERROR")
            self.results["basic_connectivity"] = {"status": "failed", "error": str(e)}
            return False
            
    def test_telegram_accounts_endpoint(self) -> bool:
        """Test GET /api/telegram/accounts endpoint"""
        self.log("Testing Telegram Accounts endpoint...")
        
        try:
            response = self.session.get(f"{BACKEND_URL}/telegram/accounts", timeout=10)
            
            self.log(f"Accounts endpoint status: {response.status_code}")
            self.log(f"Accounts endpoint response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if "accounts" in data and isinstance(data["accounts"], list):
                    self.log("✅ Accounts endpoint passed", "SUCCESS")
                    self.results["accounts"] = {"status": "passed", "data": data}
                    return True
                else:
                    self.log("❌ Accounts endpoint failed - Invalid response format", "ERROR")
                    self.results["accounts"] = {"status": "failed", "error": "Invalid response format", "data": data}
                    return False
            else:
                self.log(f"❌ Accounts endpoint failed - HTTP {response.status_code}", "ERROR")
                self.results["accounts"] = {"status": "failed", "error": f"HTTP {response.status_code}", "response": response.text}
                return False
                
        except Exception as e:
            self.log(f"❌ Accounts endpoint failed - {str(e)}", "ERROR")
            self.results["accounts"] = {"status": "failed", "error": str(e)}
            return False
            
    def run_all_tests(self):
        """Run all backend tests"""
        self.log("=" * 60)
        self.log("STARTING KRAKEN MESSENGER TELEGRAM API BACKEND TESTS")
        self.log("=" * 60)
        
        # Test basic connectivity first
        basic_ok = self.test_basic_endpoints()
        
        # Test health endpoint
        health_ok = self.test_health_endpoint()
        
        # Test accounts endpoint
        accounts_ok = self.test_telegram_accounts_endpoint()
        
        # Test send code endpoint (main focus)
        send_code_ok = self.test_send_code_endpoint()
        
        # Summary
        self.log("=" * 60)
        self.log("TEST RESULTS SUMMARY")
        self.log("=" * 60)
        
        total_tests = 4
        passed_tests = sum([basic_ok, health_ok, accounts_ok, send_code_ok])
        
        self.log(f"Basic Connectivity: {'✅ PASSED' if basic_ok else '❌ FAILED'}")
        self.log(f"Health Check: {'✅ PASSED' if health_ok else '❌ FAILED'}")
        self.log(f"Accounts Endpoint: {'✅ PASSED' if accounts_ok else '❌ FAILED'}")
        self.log(f"Send Code Endpoint: {'✅ PASSED' if send_code_ok else '❌ FAILED'}")
        
        self.log(f"\nOverall: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            self.log("🎉 ALL TESTS PASSED!", "SUCCESS")
            return True
        else:
            self.log("⚠️  SOME TESTS FAILED", "ERROR")
            return False
            
    def get_detailed_results(self) -> Dict[str, Any]:
        """Get detailed test results"""
        return self.results

if __name__ == "__main__":
    tester = TelegramAPITester()
    success = tester.run_all_tests()
    
    # Print detailed results
    print("\n" + "=" * 60)
    print("DETAILED RESULTS")
    print("=" * 60)
    results = tester.get_detailed_results()
    print(json.dumps(results, indent=2))
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)