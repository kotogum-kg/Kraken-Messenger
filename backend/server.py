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
