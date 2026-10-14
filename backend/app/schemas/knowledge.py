from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class KnowledgeDocumentBase(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    source_org: str = Field(min_length=2, max_length=100)
    source_url: Optional[str] = None
    content: str = Field(min_length=10)
    document_type: str = Field(default="guideline", max_length=50)
    crop_tags: Optional[str] = None
    region_tags: Optional[str] = None
    publication_date: Optional[date] = None
    review_date: Optional[date] = None
    is_verified: bool = True


class KnowledgeDocumentCreate(KnowledgeDocumentBase):
    pass


class KnowledgeDocumentOut(KnowledgeDocumentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class KnowledgeSearchResponse(BaseModel):
    query: str
    count: int
    results: List[KnowledgeDocumentOut]
