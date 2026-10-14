from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    role: str = Field(default="farmer", pattern="^(farmer|admin|expert)$")
    language_pref: str = Field(default="te", pattern="^(te|en|hi)$")


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    role: Optional[str] = Field(default="farmer", pattern="^(farmer|admin|expert)$")
    language_pref: Optional[str] = Field(default="te", pattern="^(te|en|hi)$")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    language_pref: Optional[str] = Field(None, pattern="^(te|en|hi)$")
    role: Optional[str] = Field(None, pattern="^(farmer|admin|expert)$")


class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
