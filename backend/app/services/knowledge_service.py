"""Knowledge base service for agricultural guidelines, research bulletins, and package of practices."""
from typing import List, Optional
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.knowledge import KnowledgeDocument
from app.schemas.knowledge import KnowledgeDocumentCreate


class KnowledgeService:
    """Manages agricultural knowledge documents and search."""

    @staticmethod
    async def search_documents(
        db: AsyncSession,
        query: Optional[str] = None,
        crop: Optional[str] = None,
        document_type: Optional[str] = None,
        limit: int = 20
    ) -> List[KnowledgeDocument]:
        """Search knowledge documents by free text query, crop tag, or document type."""
        stmt = select(KnowledgeDocument).where(KnowledgeDocument.is_verified.is_(True))

        conditions = []
        if query:
            clean_q = f"%{query.strip()}%"
            conditions.append(
                or_(
                    KnowledgeDocument.title.ilike(clean_q),
                    KnowledgeDocument.content.ilike(clean_q),
                    KnowledgeDocument.crop_tags.ilike(clean_q),
                    KnowledgeDocument.source_org.ilike(clean_q)
                )
            )

        if crop:
            conditions.append(KnowledgeDocument.crop_tags.ilike(f"%{crop.strip()}%"))

        if document_type:
            conditions.append(KnowledgeDocument.document_type == document_type)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        stmt = stmt.order_by(KnowledgeDocument.created_at.desc()).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_document_by_id(
        db: AsyncSession,
        doc_id: int
    ) -> Optional[KnowledgeDocument]:
        """Retrieve single knowledge document by ID."""
        stmt = select(KnowledgeDocument).where(KnowledgeDocument.id == doc_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def create_document(
        db: AsyncSession,
        doc_in: KnowledgeDocumentCreate
    ) -> KnowledgeDocument:
        """Create a new verified knowledge document."""
        doc = KnowledgeDocument(**doc_in.model_dump())
        db.add(doc)
        await db.commit()
        await db.refresh(doc)
        return doc
