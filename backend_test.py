#!/usr/bin/env python3
"""
Backend Testing Script for Kraken Messenger Telegram Integration
Tests all Telegram API endpoints with real data
"""

import requests
import json
import sys
from typing import Dict, Any

# Backend URL from environment
BACKEND_URL = "https://secure-chat-mvp-1.preview.emergentagent.com/api"

# Test data from review request
TEST_ACCOUNT_ID = "acc_8645807364"
TEST_PHONE = "+996709195105"
TEST_CHAT_ID = "5811505184"  # Rainbow Dash chat

class TelegramAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.results = []
        
    def log_result(self, test_name: str, success: bool, details: str, response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        print(f"   Details: {details}")
        if response_data:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
        print()
        
        self.results.append({
            'test': test_name,
            'success': success,
            'details': details,
            'response': response_data
        })
    
    def test_health_endpoint(self):
        """Test GET /api/health"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                expected_keys = ['status', 'telegram_api_configured']
                
                if all(key in data for key in expected_keys):
                    if data['status'] == 'healthy' and data['telegram_api_configured'] is True:
                        self.log_result(
                            "Health Check", 
                            True, 
                            "Health endpoint working correctly",
                            data
                        )
                    else:
                        self.log_result(
                            "Health Check", 
                            False, 
                            f"Unexpected values: status={data.get('status')}, telegram_api_configured={data.get('telegram_api_configured')}",
                            data
                        )
                else:
                    self.log_result(
                        "Health Check", 
                        False, 
                        f"Missing expected keys. Got: {list(data.keys())}",
                        data
                    )
            else:
                self.log_result(
                    "Health Check", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_result("Health Check", False, f"Request failed: {str(e)}")
    
    def test_get_accounts(self):
        """Test GET /api/telegram/accounts"""
        try:
            response = self.session.get(f"{BACKEND_URL}/telegram/accounts", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'accounts' in data:
                    accounts = data['accounts']
                    if TEST_ACCOUNT_ID in accounts:
                        self.log_result(
                            "Get Accounts", 
                            True, 
                            f"Found expected account {TEST_ACCOUNT_ID} in {len(accounts)} total accounts",
                            data
                        )
                    else:
                        self.log_result(
                            "Get Accounts", 
                            False, 
                            f"Expected account {TEST_ACCOUNT_ID} not found. Available: {accounts}",
                            data
                        )
                else:
                    self.log_result(
                        "Get Accounts", 
                        False, 
                        "Response missing 'accounts' key",
                        data
                    )
            else:
                self.log_result(
                    "Get Accounts", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_result("Get Accounts", False, f"Request failed: {str(e)}")
    
    def test_get_chats(self):
        """Test GET /api/telegram/chats"""
        try:
            params = {
                'account_id': TEST_ACCOUNT_ID,
                'limit': 10
            }
            response = self.session.get(f"{BACKEND_URL}/telegram/chats", params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'chats' in data:
                    chats = data['chats']
                    if isinstance(chats, list) and len(chats) > 0:
                        # Check if chats have expected structure
                        first_chat = chats[0]
                        expected_keys = ['id', 'title', 'type', 'unread_count', 'last_message']
                        
                        if all(key in first_chat for key in expected_keys):
                            self.log_result(
                                "Get Chats", 
                                True, 
                                f"Retrieved {len(chats)} chats with correct structure",
                                {'chat_count': len(chats), 'sample_chat': first_chat}
                            )
                        else:
                            self.log_result(
                                "Get Chats", 
                                False, 
                                f"Chat structure missing keys. Expected: {expected_keys}, Got: {list(first_chat.keys())}",
                                data
                            )
                    else:
                        self.log_result(
                            "Get Chats", 
                            False, 
                            "No chats returned or invalid format",
                            data
                        )
                else:
                    self.log_result(
                        "Get Chats", 
                        False, 
                        "Response missing 'chats' key",
                        data
                    )
            else:
                self.log_result(
                    "Get Chats", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_result("Get Chats", False, f"Request failed: {str(e)}")
    
    def test_get_messages(self):
        """Test GET /api/telegram/messages/{chat_id}"""
        try:
            params = {
                'account_id': TEST_ACCOUNT_ID,
                'limit': 5
            }
            response = self.session.get(
                f"{BACKEND_URL}/telegram/messages/{TEST_CHAT_ID}", 
                params=params, 
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if 'messages' in data:
                    messages = data['messages']
                    if isinstance(messages, list) and len(messages) > 0:
                        # Check if messages have expected structure
                        first_message = messages[0]
                        expected_keys = ['id', 'text', 'date', 'is_mine']
                        
                        if all(key in first_message for key in expected_keys):
                            self.log_result(
                                "Get Messages", 
                                True, 
                                f"Retrieved {len(messages)} messages from chat {TEST_CHAT_ID} with correct structure",
                                {'message_count': len(messages), 'sample_message': first_message}
                            )
                        else:
                            self.log_result(
                                "Get Messages", 
                                False, 
                                f"Message structure missing keys. Expected: {expected_keys}, Got: {list(first_message.keys())}",
                                data
                            )
                    else:
                        self.log_result(
                            "Get Messages", 
                            False, 
                            "No messages returned or invalid format",
                            data
                        )
                else:
                    self.log_result(
                        "Get Messages", 
                        False, 
                        "Response missing 'messages' key",
                        data
                    )
            else:
                self.log_result(
                    "Get Messages", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_result("Get Messages", False, f"Request failed: {str(e)}")
    
    def test_send_message(self):
        """Test POST /api/telegram/send-message"""
        try:
            payload = {
                "account_id": TEST_ACCOUNT_ID,
                "chat_id": TEST_CHAT_ID,
                "text": "Test from Kraken API"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/telegram/send-message",
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if 'success' in data and data['success'] is True:
                    expected_keys = ['message_id', 'date']
                    if all(key in data for key in expected_keys):
                        self.log_result(
                            "Send Message", 
                            True, 
                            f"Message sent successfully to chat {TEST_CHAT_ID}",
                            data
                        )
                    else:
                        self.log_result(
                            "Send Message", 
                            False, 
                            f"Success but missing expected keys. Expected: {expected_keys}, Got: {list(data.keys())}",
                            data
                        )
                else:
                    self.log_result(
                        "Send Message", 
                        False, 
                        f"Send failed: {data.get('error', 'Unknown error')}",
                        data
                    )
            else:
                self.log_result(
                    "Send Message", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_result("Send Message", False, f"Request failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("KRAKEN MESSENGER TELEGRAM API TESTING")
        print("=" * 60)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"Test Account: {TEST_ACCOUNT_ID}")
        print(f"Test Phone: {TEST_PHONE}")
        print(f"Test Chat: {TEST_CHAT_ID}")
        print("=" * 60)
        print()
        
        # Run tests in order
        self.test_health_endpoint()
        self.test_get_accounts()
        self.test_get_chats()
        self.test_get_messages()
        self.test_send_message()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r['success'])
        total = len(self.results)
        
        for result in self.results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}")
        
        print()
        print(f"TOTAL: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED!")
            return True
        else:
            print("⚠️  SOME TESTS FAILED")
            return False

if __name__ == "__main__":
    tester = TelegramAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)