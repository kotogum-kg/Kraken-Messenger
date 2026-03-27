from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

# Import Telegram service
from telegram_service import TelegramService


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Kraken Messenger API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class SendCodeRequest(BaseModel):
    phone: str

class SignInRequest(BaseModel):
    phone: str
    code: str
    password: Optional[str] = None

class SendMessageRequest(BaseModel):
    account_id: str
    chat_id: str
    text: str

class SendVoiceRequest(BaseModel):
    account_id: str
    chat_id: str
    voice_data: str  # base64 encoded
    duration: int = 0

class SendMediaRequest(BaseModel):
    account_id: str
    chat_id: str
    media_data: str  # base64 encoded
    filename: str
    caption: str = ''
    ttl_seconds: Optional[int] = None  # For self-destructing media

class SendStickerRequest(BaseModel):
    account_id: str
    chat_id: str
    sticker_id: str
    access_hash: str

class SendReactionRequest(BaseModel):
    account_id: str
    chat_id: str
    message_id: int
    emoji: str  # Empty string to remove reaction


# ============= Original Routes =============

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {
        "app": "Kraken Messenger API",
        "version": "1.0.0",
        "telegram_integration": "active"
    }

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# ============= Telegram API Routes =============

@api_router.post("/telegram/auth/send-code")
async def send_code(request: SendCodeRequest):
    """Send authorization code to phone number"""
    try:
        result = await TelegramService.send_code(request.phone)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/telegram/auth/sign-in")
async def sign_in(request: SignInRequest):
    """Sign in with code"""
    try:
        result = await TelegramService.sign_in(
            request.phone,
            request.code,
            request.password
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/telegram/chats")
async def get_chats(account_id: str, limit: int = 50):
    """Get list of chats for account"""
    try:
        chats = await TelegramService.get_chats(account_id, limit)
        return {"chats": chats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/telegram/messages/{chat_id}")
async def get_messages(account_id: str, chat_id: str, limit: int = 50):
    """Get messages from chat"""
    try:
        messages = await TelegramService.get_messages(account_id, chat_id, limit)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/telegram/send-message")
async def send_message(request: SendMessageRequest):
    """Send message to chat"""
    try:
        result = await TelegramService.send_message(
            request.account_id,
            request.chat_id,
            request.text
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/telegram/logout")
async def logout(account_id: str):
    """Logout from account"""
    try:
        result = await TelegramService.logout(account_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/telegram/accounts")
async def get_accounts():
    """Get list of active accounts"""
    accounts = TelegramService.get_active_accounts()
    return {"accounts": accounts}

@api_router.post("/telegram/restore-sessions")
async def restore_sessions():
    """Restore all existing Telegram sessions"""
    try:
        results = await TelegramService.restore_all_sessions()
        return {"success": True, "sessions": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/telegram/restore-session")
async def restore_session(phone: str):
    """Restore a specific Telegram session"""
    try:
        result = await TelegramService.restore_session(phone)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "telegram_api_configured": bool(os.getenv('TELEGRAM_API_ID')) and bool(os.getenv('TELEGRAM_API_HASH'))
    }


# ============= Voice & Media Endpoints =============

@api_router.post("/telegram/send-voice")
async def send_voice(request: SendVoiceRequest):
    """Send voice message to chat"""
    import base64
    try:
        voice_bytes = base64.b64decode(request.voice_data)
        result = await TelegramService.send_voice(
            request.account_id,
            request.chat_id,
            voice_bytes,
            request.duration
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/telegram/send-media")
async def send_media(request: SendMediaRequest):
    """Send media (photo/video/file) to chat"""
    import base64
    try:
        media_bytes = base64.b64decode(request.media_data)
        result = await TelegramService.send_media(
            request.account_id,
            request.chat_id,
            media_bytes,
            request.filename,
            request.caption,
            request.ttl_seconds
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/telegram/messages-extended/{chat_id}")
async def get_messages_extended(account_id: str, chat_id: str, limit: int = 50):
    """Get messages with extended media info"""
    try:
        messages = await TelegramService.get_messages_extended(account_id, chat_id, limit)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/telegram/download-media/{chat_id}/{message_id}")
async def download_media(account_id: str, chat_id: str, message_id: int):
    """Download media from message (returns base64)"""
    try:
        result = await TelegramService.download_media(account_id, chat_id, message_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============= Stickers & Reactions Endpoints =============

@api_router.get("/telegram/sticker-sets")
async def get_sticker_sets(account_id: str):
    """Get user's saved sticker sets"""
    try:
        sets = await TelegramService.get_sticker_sets(account_id)
        return {"sticker_sets": sets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/telegram/stickers/{short_name}")
async def get_stickers(account_id: str, short_name: str):
    """Get stickers from a specific set"""
    try:
        stickers = await TelegramService.get_stickers_from_set(account_id, short_name)
        return {"stickers": stickers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/telegram/send-sticker")
async def send_sticker(request: SendStickerRequest):
    """Send a sticker to chat"""
    try:
        result = await TelegramService.send_sticker(
            request.account_id,
            request.chat_id,
            request.sticker_id,
            request.access_hash
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/telegram/send-reaction")
async def send_reaction(request: SendReactionRequest):
    """Send reaction to a message"""
    try:
        result = await TelegramService.send_reaction(
            request.account_id,
            request.chat_id,
            request.message_id,
            request.emoji
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/telegram/premium-status")
async def get_premium_status(account_id: str):
    """Check if user has Telegram Premium"""
    try:
        result = await TelegramService.get_premium_status(account_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/telegram/chat-info/{chat_id}")
async def get_chat_info(account_id: str, chat_id: str):
    """Get detailed chat info including permissions"""
    try:
        result = await TelegramService.get_chat_info(account_id, chat_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/telegram/stories")
async def get_stories(account_id: str):
    """Get stories from contacts and channels"""
    try:
        stories = await TelegramService.get_stories(account_id)
        return {"stories": stories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/telegram/story/{peer_id}/{story_id}")
async def view_story(account_id: str, peer_id: str, story_id: int):
    """View a story and get its media"""
    try:
        result = await TelegramService.view_story(account_id, peer_id, story_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
