from app.schemas.user import UserBase, UserCreate, UserLogin, UserUpdate, UserOut, Token, TokenPayload
from app.schemas.profile import FarmerProfileBase, FarmerProfileCreate, FarmerProfileUpdate, FarmerProfileOut
from app.schemas.crop import CropRecordBase, CropRecordCreate, CropRecordUpdate, CropRecordOut
from app.schemas.weather import WeatherResponse, WeatherAlert, WeatherCurrent, WeatherHourly, WeatherDaily
from app.schemas.advisory import AdvisoryBase, AdvisoryCreate, AdvisoryOut, AdvisoryGenerateRequest, AdvisoryGenerateResponse
from app.schemas.notification import NotificationBase, NotificationCreate, NotificationOut
from app.schemas.feedback import FeedbackBase, FeedbackCreate, FeedbackOut
from app.schemas.knowledge import KnowledgeDocumentBase, KnowledgeDocumentCreate, KnowledgeDocumentOut, KnowledgeSearchResponse
from app.schemas.assistant import ChatMessage, ChatRequest, ChatResponse
from app.schemas.admin import AdminStats, AdminHealth

__all__ = [
    "UserBase", "UserCreate", "UserLogin", "UserUpdate", "UserOut", "Token", "TokenPayload",
    "FarmerProfileBase", "FarmerProfileCreate", "FarmerProfileUpdate", "FarmerProfileOut",
    "CropRecordBase", "CropRecordCreate", "CropRecordUpdate", "CropRecordOut",
    "WeatherResponse", "WeatherAlert", "WeatherCurrent", "WeatherHourly", "WeatherDaily",
    "AdvisoryBase", "AdvisoryCreate", "AdvisoryOut", "AdvisoryGenerateRequest", "AdvisoryGenerateResponse",
    "NotificationBase", "NotificationCreate", "NotificationOut",
    "FeedbackBase", "FeedbackCreate", "FeedbackOut",
    "KnowledgeDocumentBase", "KnowledgeDocumentCreate", "KnowledgeDocumentOut", "KnowledgeSearchResponse",
    "ChatMessage", "ChatRequest", "ChatResponse",
    "AdminStats", "AdminHealth",
]
