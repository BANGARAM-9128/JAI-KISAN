"""Authentication endpoints for user registration, login and profile inspection."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new farmer, admin, or expert account."""
    # Check if email is already taken
    stmt = select(User).where(User.email == user_in.email)
    res = await db.execute(stmt)
    existing = res.scalars().first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )

    # Create user
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role or "farmer",
        language_pref=user_in.language_pref or "te"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate token
    token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "role": user.role}
    )
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate with email and password to receive a JWT access token."""
    stmt = select(User).where(User.email == login_data.email)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "role": user.role}
    )
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Return the currently authenticated user's account details."""
    return current_user
