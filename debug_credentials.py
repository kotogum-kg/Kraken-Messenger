#!/usr/bin/env python3
"""
Debug script to check Telegram API credentials
"""
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

# Get credentials
api_id_str = os.getenv('TELEGRAM_API_ID', '')
api_hash = os.getenv('TELEGRAM_API_HASH', '')

print(f"API_ID (string): '{api_id_str}'")
print(f"API_HASH: '{api_hash}'")

# Try to convert API_ID to int
try:
    api_id = int(api_id_str)
    print(f"API_ID (int): {api_id}")
    print(f"API_ID in range: {-2147483648 <= api_id <= 2147483647}")
    print(f"API_ID is 32-bit safe: {api_id <= 2147483647}")
except ValueError as e:
    print(f"Error converting API_ID to int: {e}")

# Check if credentials look valid
if api_id_str and api_hash:
    print("✅ Both credentials are present")
else:
    print("❌ Missing credentials")
    
# Check API_ID format
if api_id_str.isdigit():
    print("✅ API_ID is numeric")
else:
    print("❌ API_ID is not numeric")

# Check API_HASH format (should be hex)
if len(api_hash) == 32 and all(c in '0123456789abcdef' for c in api_hash.lower()):
    print("✅ API_HASH looks like valid hex (32 chars)")
else:
    print(f"❌ API_HASH doesn't look like valid hex (length: {len(api_hash)})")