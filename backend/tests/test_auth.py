"""Authentication endpoints testing (registration, login, token verification)."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_new_user(client: AsyncClient):
    """Test successful user registration."""
    payload = {
        "email": "new_farmer@jaikisan.in",
        "password": "SecurePassword123",
        "role": "farmer",
        "language_pref": "te"
    }
    response = await client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "new_farmer@jaikisan.in"
    assert data["user"]["role"] == "farmer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, test_farmer_user):
    """Test registration fails when email is already registered."""
    payload = {
        "email": test_farmer_user.email,
        "password": "AnotherPassword123",
        "role": "farmer"
    }
    response = await client.post("/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_farmer_user):
    """Test login with valid credentials."""
    payload = {
        "email": "test_farmer@jaikisan.in",
        "password": "Secret@123"
    }
    response = await client.post("/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test_farmer@jaikisan.in"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, test_farmer_user):
    """Test login fails with incorrect password."""
    payload = {
        "email": "test_farmer@jaikisan.in",
        "password": "WrongPassword999"
    }
    response = await client.post("/auth/login", json=payload)
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    """Test login fails with unregistered email."""
    payload = {
        "email": "ghost@jaikisan.in",
        "password": "Password123"
    }
    response = await client.post("/auth/login", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient, farmer_auth_headers):
    """Test GET /auth/me returns current user profile."""
    response = await client.get("/auth/me", headers=farmer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test_farmer@jaikisan.in"
    assert data["role"] == "farmer"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    """Test GET /auth/me without token returns 401."""
    response = await client.get("/auth/me")
    assert response.status_code == 401
