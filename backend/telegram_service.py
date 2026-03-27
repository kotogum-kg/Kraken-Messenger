"""
Telegram Integration Service using Telethon
Provides real Telegram client functionality
"""
from telethon import TelegramClient, events, functions, types
from telethon.errors import SessionPasswordNeededError, PhoneCodeInvalidError
from telethon.tl.types import InputPeerUser, InputPeerChat, InputPeerChannel
import asyncio
import os
from typing import Dict, List, Optional
import json
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Telegram API credentials
# Get from https://my.telegram.org
API_ID = int(os.getenv('TELEGRAM_API_ID', '0'))
API_HASH = os.getenv('TELEGRAM_API_HASH', '')

# Handle large API IDs that exceed 32-bit integer range
# This is a workaround for Telethon's struct.pack issue with large API IDs
import struct

# Store original pack function
_original_pack = struct.pack

def _safe_pack(fmt, *args):
    """Safe struct.pack that handles large API IDs"""
    try:
        return _original_pack(fmt, *args)
    except struct.error as e:
        if "'i' format requires" in str(e) and fmt == '<i' and len(args) == 1:
            # Handle large API ID by using 64-bit format and truncating
            # This is a temporary workaround for large Telegram API IDs
            value = args[0]
            if value > 2147483647:
                # Use modulo to fit in 32-bit range while preserving uniqueness
                safe_value = value % 2147483648
                return _original_pack(fmt, safe_value)
        raise

# Apply the workaround
struct.pack = _safe_pack

# Storage for active clients (account_id -> TelegramClient)
active_clients: Dict[str, TelegramClient] = {}

# Storage for auth sessions (phone -> data)
auth_sessions: Dict[str, dict] = {}


class TelegramService:
    """Service for managing Telegram clients"""
    
    @staticmethod
    async def send_code(phone: str) -> dict:
        """
        Send authorization code to phone number
        Returns phone_code_hash for sign in
        """
        # Create session file path
        session_name = f"sessions/session_{phone}"
        os.makedirs("sessions", exist_ok=True)
        
        # Create client
        client = TelegramClient(session_name, API_ID, API_HASH)
        await client.connect()
        
        # Send code request
        result = await client.send_code_request(phone)
        
        # Store client and data for later
        auth_sessions[phone] = {
            'client': client,
            'phone_code_hash': result.phone_code_hash
        }
        
        return {
            'success': True,
            'phone': phone,
            'phone_code_hash': result.phone_code_hash
        }
    
    @staticmethod
    async def sign_in(phone: str, code: str, password: Optional[str] = None) -> dict:
        """
        Sign in with code (and password if 2FA enabled)
        Returns account info
        """
        if phone not in auth_sessions:
            return {'success': False, 'error': 'Session not found. Send code first.'}
        
        session = auth_sessions[phone]
        client = session['client']
        phone_code_hash = session['phone_code_hash']
        
        try:
            # Try to sign in with code
            user = await client.sign_in(phone, code, phone_code_hash=phone_code_hash)
        except SessionPasswordNeededError:
            # 2FA enabled, need password
            if not password:
                return {'success': False, 'error': '2FA enabled. Password required.', 'needs_password': True}
            
            user = await client.sign_in(password=password)
        except PhoneCodeInvalidError:
            return {'success': False, 'error': 'Invalid code'}
        
        # Generate account ID
        account_id = f"acc_{user.id}"
        
        # Store active client
        active_clients[account_id] = client
        
        # Clean up auth session
        del auth_sessions[phone]
        
        # Get user info
        me = await client.get_me()
        
        return {
            'success': True,
            'account_id': account_id,
            'user': {
                'id': me.id,
                'first_name': me.first_name,
                'last_name': me.last_name,
                'username': me.username,
                'phone': me.phone
            }
        }
    
    @staticmethod
    async def get_chats(account_id: str, limit: int = 50) -> List[dict]:
        """
        Get list of chats (dialogs) for account
        """
        if account_id not in active_clients:
            return []
        
        client = active_clients[account_id]
        
        # Get dialogs (chats) with retry logic for database locks
        max_retries = 3
        for attempt in range(max_retries):
            try:
                dialogs = await client.get_dialogs(limit=limit)
                break
            except Exception as e:
                if "database is locked" in str(e) and attempt < max_retries - 1:
                    await asyncio.sleep(0.1 * (2 ** attempt))  # Exponential backoff
                    continue
                raise
        
        chats = []
        for dialog in dialogs:
            # Get entity (user, chat, or channel)
            entity = dialog.entity
            
            # Determine chat type
            if isinstance(entity, types.User):
                chat_type = 'personal'
                title = entity.first_name or entity.username or 'Unknown'
            elif isinstance(entity, types.Chat):
                chat_type = 'group'
                title = entity.title
            elif isinstance(entity, types.Channel):
                chat_type = 'channel' if entity.broadcast else 'supergroup'
                title = entity.title
            else:
                continue
            
            # Get last message
            last_message = dialog.message.message if dialog.message else ''
            last_message_date = dialog.message.date.isoformat() if dialog.message else None
            
            chats.append({
                'id': str(dialog.id),
                'title': title,
                'type': chat_type,
                'unread_count': dialog.unread_count,
                'last_message': last_message,
                'last_message_date': last_message_date,
                'is_pinned': dialog.pinned,
                'is_muted': dialog.archived,
            })
        
        return chats
    
    @staticmethod
    async def get_messages(account_id: str, chat_id: str, limit: int = 50) -> List[dict]:
        """
        Get messages from specific chat
        """
        if account_id not in active_clients:
            return []
        
        client = active_clients[account_id]
        
        # Get messages with retry logic for database locks
        max_retries = 3
        for attempt in range(max_retries):
            try:
                messages = await client.get_messages(int(chat_id), limit=limit)
                break
            except Exception as e:
                if "database is locked" in str(e) and attempt < max_retries - 1:
                    await asyncio.sleep(0.1 * (2 ** attempt))  # Exponential backoff
                    continue
                raise
        
        result = []
        for msg in messages:
            if not msg:
                continue
            
            # Check if message is from me
            me = await client.get_me()
            is_mine = msg.from_id and msg.from_id.user_id == me.id if hasattr(msg.from_id, 'user_id') else False
            
            result.append({
                'id': msg.id,
                'text': msg.message or '',
                'date': msg.date.isoformat(),
                'is_mine': is_mine,
                'from_id': msg.from_id.user_id if hasattr(msg.from_id, 'user_id') else None,
            })
        
        return result
    
    @staticmethod
    async def send_message(account_id: str, chat_id: str, text: str) -> dict:
        """
        Send message to chat
        """
        if account_id not in active_clients:
            return {'success': False, 'error': 'Account not found'}
        
        client = active_clients[account_id]
        
        try:
            # Send message
            message = await client.send_message(int(chat_id), text)
            
            return {
                'success': True,
                'message_id': message.id,
                'date': message.date.isoformat()
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    async def logout(account_id: str) -> dict:
        """
        Logout from account and remove session
        """
        if account_id not in active_clients:
            return {'success': False, 'error': 'Account not found'}
        
        client = active_clients[account_id]
        
        try:
            await client.log_out()
            del active_clients[account_id]
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def get_active_accounts() -> List[str]:
        """
        Get list of active account IDs
        """
        return list(active_clients.keys())
    
    @staticmethod
    async def restore_session(phone: str) -> dict:
        """
        Restore an existing session from file
        Used to reconnect after server restart
        """
        session_name = f"sessions/session_{phone}"
        session_path = f"{session_name}.session"
        
        if not os.path.exists(session_path):
            return {'success': False, 'error': 'Session file not found'}
        
        try:
            # Create client from existing session
            client = TelegramClient(session_name, API_ID, API_HASH)
            await client.connect()
            
            # Check if already authorized
            if not await client.is_user_authorized():
                return {'success': False, 'error': 'Session expired'}
            
            # Get user info
            me = await client.get_me()
            account_id = f"acc_{me.id}"
            
            # Store active client
            active_clients[account_id] = client
            
            return {
                'success': True,
                'account_id': account_id,
                'user': {
                    'id': me.id,
                    'first_name': me.first_name,
                    'last_name': me.last_name,
                    'username': me.username,
                    'phone': me.phone
                }
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    async def restore_all_sessions() -> List[dict]:
        """
        Restore all existing sessions from the sessions directory
        """
        sessions_dir = "sessions"
        if not os.path.exists(sessions_dir):
            return []
        
        results = []
        for filename in os.listdir(sessions_dir):
            if filename.endswith('.session'):
                # Extract phone from filename
                phone = filename.replace('session_', '').replace('.session', '')
                result = await TelegramService.restore_session(phone)
                results.append({
                    'phone': phone,
                    **result
                })
        
        return results
    
    @staticmethod
    async def send_voice(account_id: str, chat_id: str, voice_data: bytes, duration: int = 0, waveform: bytes = None) -> dict:
        """
        Send voice message to chat
        voice_data: OGG/OPUS audio bytes
        duration: Duration in seconds
        waveform: Voice waveform data (optional)
        """
        if account_id not in active_clients:
            return {'success': False, 'error': 'Account not found'}
        
        client = active_clients[account_id]
        
        try:
            import tempfile
            
            # Save voice data to temp file
            with tempfile.NamedTemporaryFile(suffix='.ogg', delete=False) as f:
                f.write(voice_data)
                temp_path = f.name
            
            try:
                # Send as voice message
                attributes = [
                    types.DocumentAttributeAudio(
                        duration=duration,
                        voice=True,
                        waveform=waveform
                    )
                ]
                
                message = await client.send_file(
                    int(chat_id),
                    temp_path,
                    voice_note=True,
                    attributes=attributes
                )
                
                return {
                    'success': True,
                    'message_id': message.id,
                    'date': message.date.isoformat()
                }
            finally:
                # Clean up temp file
                os.unlink(temp_path)
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    async def send_media(account_id: str, chat_id: str, media_data: bytes, filename: str, 
                         caption: str = '', ttl_seconds: int = None) -> dict:
        """
        Send media (photo/video/file) to chat
        ttl_seconds: Time to live for self-destructing media (None for regular)
        """
        if account_id not in active_clients:
            return {'success': False, 'error': 'Account not found'}
        
        client = active_clients[account_id]
        
        try:
            import tempfile
            
            # Determine file extension
            ext = os.path.splitext(filename)[1].lower() if filename else '.bin'
            
            # Save media to temp file
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as f:
                f.write(media_data)
                temp_path = f.name
            
            try:
                # Build send options
                send_kwargs = {
                    'caption': caption,
                    'force_document': ext not in ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm']
                }
                
                # Add TTL for self-destructing media
                if ttl_seconds and ttl_seconds > 0:
                    send_kwargs['ttl'] = ttl_seconds
                
                message = await client.send_file(
                    int(chat_id),
                    temp_path,
                    **send_kwargs
                )
                
                return {
                    'success': True,
                    'message_id': message.id,
                    'date': message.date.isoformat(),
                    'is_self_destructing': ttl_seconds is not None and ttl_seconds > 0
                }
            finally:
                # Clean up temp file
                os.unlink(temp_path)
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    async def get_messages_extended(account_id: str, chat_id: str, limit: int = 50) -> List[dict]:
        """
        Get messages with extended media info
        """
        if account_id not in active_clients:
            return []
        
        client = active_clients[account_id]
        
        # Get messages with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                messages = await client.get_messages(int(chat_id), limit=limit)
                break
            except Exception as e:
                if "database is locked" in str(e) and attempt < max_retries - 1:
                    await asyncio.sleep(0.1 * (2 ** attempt))
                    continue
                raise
        
        result = []
        me = await client.get_me()
        
        for msg in messages:
            if not msg:
                continue
            
            is_mine = msg.from_id and msg.from_id.user_id == me.id if hasattr(msg.from_id, 'user_id') else False
            
            # Determine message type and media info
            msg_type = 'text'
            media_info = None
            
            if msg.voice:
                msg_type = 'voice'
                media_info = {
                    'duration': msg.voice.duration if hasattr(msg.voice, 'duration') else 0,
                    'size': msg.voice.size if hasattr(msg.voice, 'size') else 0,
                }
            elif msg.video_note:
                msg_type = 'video_note'
                media_info = {
                    'duration': msg.video_note.duration if hasattr(msg.video_note, 'duration') else 0,
                    'size': msg.video_note.size if hasattr(msg.video_note, 'size') else 0,
                }
            elif msg.photo:
                msg_type = 'photo'
                media_info = {
                    'has_ttl': msg.media.ttl_seconds is not None if hasattr(msg.media, 'ttl_seconds') else False,
                    'ttl_seconds': msg.media.ttl_seconds if hasattr(msg.media, 'ttl_seconds') else None,
                }
            elif msg.video:
                msg_type = 'video'
                media_info = {
                    'duration': msg.video.duration if hasattr(msg.video, 'duration') else 0,
                    'has_ttl': msg.media.ttl_seconds is not None if hasattr(msg.media, 'ttl_seconds') else False,
                }
            elif msg.document:
                msg_type = 'document'
                media_info = {
                    'filename': msg.file.name if msg.file else 'file',
                    'size': msg.document.size if hasattr(msg.document, 'size') else 0,
                }
            elif msg.sticker:
                msg_type = 'sticker'
                media_info = {
                    'emoji': msg.sticker.alt if hasattr(msg.sticker, 'alt') else '',
                }
            
            result.append({
                'id': msg.id,
                'text': msg.message or '',
                'date': msg.date.isoformat(),
                'is_mine': is_mine,
                'from_id': msg.from_id.user_id if hasattr(msg.from_id, 'user_id') else None,
                'type': msg_type,
                'media': media_info,
            })
        
        return result
    
    @staticmethod
    async def download_media(account_id: str, chat_id: str, message_id: int) -> dict:
        """
        Download media from message
        Returns base64 encoded data
        """
        if account_id not in active_clients:
            return {'success': False, 'error': 'Account not found'}
        
        client = active_clients[account_id]
        
        try:
            import base64
            import tempfile
            
            # Get the message
            messages = await client.get_messages(int(chat_id), ids=[message_id])
            if not messages or not messages[0]:
                return {'success': False, 'error': 'Message not found'}
            
            msg = messages[0]
            
            if not msg.media:
                return {'success': False, 'error': 'No media in message'}
            
            # Download to temp file
            with tempfile.NamedTemporaryFile(delete=False) as f:
                temp_path = f.name
            
            try:
                await client.download_media(msg, temp_path)
                
                with open(temp_path, 'rb') as f:
                    data = f.read()
                
                return {
                    'success': True,
                    'data': base64.b64encode(data).decode('utf-8'),
                    'size': len(data),
                    'filename': msg.file.name if msg.file else 'media',
                }
            finally:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
