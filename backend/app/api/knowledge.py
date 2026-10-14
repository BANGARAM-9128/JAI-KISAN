"""Knowledge base search and document inspection endpoints."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.knowledge import KnowledgeDocumentOut, KnowledgeSearchResponse
from app.services.knowledge_service import KnowledgeService

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])


@router.get("/search", response_model=KnowledgeSearchResponse)
async def search_knowledge(
    q: Optional[str] = Query(None, description="Free-text search query"),
    crop: Optional[str] = Query(None, description="Filter by crop name"),
    doc_type: Optional[str] = Query(None, description="Filter by document type"),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Search agricultural package of practices, pest advisories, and scientific bulletins."""
    docs = await KnowledgeService.search_documents(
        db=db,
        query=q,
        crop=crop,
        document_type=doc_type,
        limit=limit
    )
    return KnowledgeSearchResponse(
        query=q or "",
        count=len(docs),
        results=[KnowledgeDocumentOut.model_validate(d) for d in docs]
    )


@router.get("/{doc_id}", response_model=KnowledgeDocumentOut)
async def get_knowledge_document(
    doc_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full text and metadata for a specific agricultural knowledge document."""
    doc = await KnowledgeService.get_document_by_id(db=db, doc_id=doc_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge document not found"
        )
    return doc
