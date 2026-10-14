from typing import List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    conversation_history: Optional[List[ChatMessage]] = None
    crop_id: Optional[int] = None
    language: Optional[str] = Field(default="te", pattern="^(te|en|hi)$")


class ChatResponse(BaseModel):
    reply: str
    reply_te: Optional[str] = None
    sources_used: List[str] = []
    weather_context_used: Optional[str] = None
    suggested_actions: List[str] = []
