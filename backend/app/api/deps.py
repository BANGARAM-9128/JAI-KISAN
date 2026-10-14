"""API dependencies for authentication, authorization and database session injection."""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.farmer_profile import FarmerProfile

http_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Validate JWT token and return authenticated user."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing user identifier",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed user identifier",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from sqlalchemy.orm import selectinload
    stmt = select(User).options(selectinload(User.profile)).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Retrieve user if token provided, else return None without raising error."""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials=credentials, db=db)
    except HTTPException:
        return None


async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Ensure user has admin privileges."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return current_user


async def get_current_farmer_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> FarmerProfile:
    """Retrieve the farmer profile for the authenticated user."""
    stmt = select(FarmerProfile).where(FarmerProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    profile = res.scalars().first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found. Please complete profile setup.",
        )
    return profile
