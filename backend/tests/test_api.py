"""Integration tests for all main API endpoints."""
import pytest
from unittest.mock import patch
from httpx import AsyncClient
from datetime import date


@pytest.mark.asyncio
async def test_health_and_root_endpoints(client: AsyncClient):
    """Test public health and welcome endpoints."""
    res_root = await client.get("/")
    assert res_root.status_code == 200
    assert "Jai Kisan" in res_root.json()["message"]

    res_health = await client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_profile_endpoints(client: AsyncClient, farmer_auth_headers):
    """Test retrieving and updating farmer profile."""
    # GET profile
    res_get = await client.get("/profile", headers=farmer_auth_headers)
    assert res_get.status_code == 200
    profile_data = res_get.json()
    assert profile_data["display_name"] == "Test Farmer"
    assert profile_data["district"] == "Kurnool"

    # PUT profile
    update_payload = {"village": "Updated Village", "farm_size_acres": 6.5}
    res_put = await client.put("/profile", json=update_payload, headers=farmer_auth_headers)
    assert res_put.status_code == 200
    assert res_put.json()["village"] == "Updated Village"
    assert res_put.json()["farm_size_acres"] == 6.5


@pytest.mark.asyncio
async def test_crop_crud_endpoints(client: AsyncClient, farmer_auth_headers):
    """Test complete CRUD cycle for crops."""
    # 1. List crops
    res_list = await client.get("/crops", headers=farmer_auth_headers)
    assert res_list.status_code == 200
    initial_crops = res_list.json()
    assert len(initial_crops) >= 1

    # 2. Add crop
    new_crop = {
        "crop_name": "chilli",
        "variety": "Teja",
        "sowing_date": str(date.today()),
        "growth_stage": "vegetative",
        "field_area_acres": 2.0,
        "is_active": True
    }
    res_add = await client.post("/crops", json=new_crop, headers=farmer_auth_headers)
    assert res_add.status_code == 201
    crop_id = res_add.json()["id"]
    assert res_add.json()["crop_name"] == "chilli"

    # 3. Get single crop
    res_get = await client.get(f"/crops/{crop_id}", headers=farmer_auth_headers)
    assert res_get.status_code == 200
    assert res_get.json()["id"] == crop_id

    # 4. Update crop
    res_update = await client.put(
        f"/crops/{crop_id}",
        json={"growth_stage": "flowering"},
        headers=farmer_auth_headers
    )
    assert res_update.status_code == 200
    assert res_update.json()["growth_stage"] == "flowering"

    # 5. Delete crop
    res_del = await client.delete(f"/crops/{crop_id}", headers=farmer_auth_headers)
    assert res_del.status_code == 204


@pytest.mark.asyncio
async def test_weather_endpoints(client: AsyncClient, mock_open_meteo_payload):
    """Test GET /weather and GET /weather/alerts endpoints with mocked provider."""
    with patch("app.services.weather_service.OpenMeteoClient.fetch_forecast") as mock_fetch:
        mock_fetch.return_value = mock_open_meteo_payload

        # GET /weather
        res_weather = await client.get("/weather?lat=15.82&lon=78.03")
        assert res_weather.status_code == 200
        w_data = res_weather.json()
        assert w_data["latitude"] == 15.82
        assert "Open-Meteo" in w_data["attribution"]
        assert "current" in w_data
        assert "daily" in w_data

        # GET /weather/alerts
        res_alerts = await client.get("/weather/alerts?lat=15.82&lon=78.03")
        assert res_alerts.status_code == 200
        assert isinstance(res_alerts.json(), list)


@pytest.mark.asyncio
async def test_advisory_generate_and_list(client: AsyncClient, farmer_auth_headers, mock_open_meteo_payload):
    """Test generating advisories and listing them."""
    with patch("app.services.weather_service.OpenMeteoClient.fetch_forecast") as mock_fetch:
        mock_fetch.return_value = mock_open_meteo_payload

        # POST /advisories/generate
        res_gen = await client.post("/advisories/generate", json={}, headers=farmer_auth_headers)
        assert res_gen.status_code == 200
        gen_data = res_gen.json()
        assert "count" in gen_data
        assert "advisories" in gen_data

        # GET /advisories
        res_list = await client.get("/advisories", headers=farmer_auth_headers)
        assert res_list.status_code == 200
        advisories = res_list.json()
        assert isinstance(advisories, list)

        if advisories:
            adv_id = advisories[0]["id"]
            res_single = await client.get(f"/advisories/{adv_id}", headers=farmer_auth_headers)
            assert res_single.status_code == 200
            assert res_single.json()["id"] == adv_id


@pytest.mark.asyncio
async def test_notification_endpoints(client: AsyncClient, farmer_auth_headers, db_session, test_farmer_user):
    """Test notification retrieval and marking read."""
    from app.services.notification_service import NotificationService

    # Create a test notification
    await NotificationService.create_notification(
        db=db_session,
        user_id=test_farmer_user.id,
        title="Test Alert",
        message="Rain approaching",
        severity="high"
    )

    # GET /notifications
    res = await client.get("/notifications", headers=farmer_auth_headers)
    assert res.status_code == 200
    notes = res.json()
    assert len(notes) >= 1
    notif_id = notes[0]["id"]

    # PUT /notifications/{id}/read
    res_read = await client.put(f"/notifications/{notif_id}/read", headers=farmer_auth_headers)
    assert res_read.status_code == 200
    assert res_read.json()["is_read"] is True

    # PUT /notifications/read-all
    res_all = await client.put("/notifications/read-all", headers=farmer_auth_headers)
    assert res_all.status_code == 200
    assert "updated" in res_all.json()


@pytest.mark.asyncio
async def test_feedback_submission(client: AsyncClient, farmer_auth_headers, admin_auth_headers):
    """Test submitting farmer feedback and admin viewing."""
    feedback_payload = {
        "was_understandable": True,
        "was_relevant": True,
        "was_followed": True,
        "was_useful": True,
        "weather_accuracy_note": "Weather was accurate, avoided spray before rain",
        "additional_comment": "Very helpful advisory"
    }

    # Farmer submits
    res_sub = await client.post("/feedback", json=feedback_payload, headers=farmer_auth_headers)
    assert res_sub.status_code == 201
    assert res_sub.json()["was_useful"] is True

    # Admin lists
    res_admin = await client.get("/feedback", headers=admin_auth_headers)
    assert res_admin.status_code == 200
    assert len(res_admin.json()) >= 1


@pytest.mark.asyncio
async def test_assistant_chat(client: AsyncClient, farmer_auth_headers, mock_open_meteo_payload):
    """Test AI assistant chat query with weather and knowledge grounding."""
    with patch("app.services.weather_service.OpenMeteoClient.fetch_forecast") as mock_fetch:
        mock_fetch.return_value = mock_open_meteo_payload

        chat_payload = {
            "message": "Can I spray pesticide for cotton today?",
            "language": "te"
        }
        res = await client.post("/assistant/chat", json=chat_payload, headers=farmer_auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert "reply" in data
        assert "reply_te" in data
        assert len(data["sources_used"]) > 0
        assert len(data["suggested_actions"]) > 0


@pytest.mark.asyncio
async def test_admin_stats_and_health(client: AsyncClient, admin_auth_headers):
    """Test admin monitoring endpoints."""
    # Stats
    res_stats = await client.get("/admin/stats", headers=admin_auth_headers)
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert "total_users" in stats
    assert "crop_distribution" in stats

    # Rules
    res_rules = await client.get("/admin/rules", headers=admin_auth_headers)
    assert res_rules.status_code == 200
    assert len(res_rules.json()) >= 10

    # Health
    res_health = await client.get("/admin/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_assistant_chat_regression_with_crop_and_anonymous(client: AsyncClient, farmer_auth_headers, mock_open_meteo_payload):
    """Regression test: Ensure FarmerProfile and CropRecord query in assistant endpoint runs cleanly with crop_id and anonymous users."""
    with patch("app.services.weather_service.OpenMeteoClient.fetch_forecast") as mock_fetch:
        mock_fetch.return_value = mock_open_meteo_payload

        # 1. First get a valid crop id from /crops
        res_crops = await client.get("/crops", headers=farmer_auth_headers)
        crop_id = res_crops.json()[0]["id"] if res_crops.status_code == 200 and res_crops.json() else None

        # 2. Test chat with specific crop_id and authenticated farmer (exercises lines 30-41 in assistant.py)
        chat_payload = {
            "message": "When should I irrigate my paddy?",
            "crop_id": crop_id,
            "language": "te"
        }
        res_auth = await client.post("/assistant/chat", json=chat_payload, headers=farmer_auth_headers)
        assert res_auth.status_code == 200
        assert "reply" in res_auth.json()

        # 3. Test chat anonymously (without auth header)
        res_anon = await client.post("/assistant/chat", json={"message": "Is rain expected?", "language": "en"})
        assert res_anon.status_code == 200
        assert "reply" in res_anon.json()


@pytest.mark.asyncio
async def test_weather_endpoints_missing_coordinates(client: AsyncClient):
    """Regression test: Unauthenticated weather request without lat/lon must return 400 Bad Request."""
    res = await client.get("/weather")
    assert res.status_code == 400
    assert "required" in res.json()["detail"].lower()

    res_alerts = await client.get("/weather/alerts")
    assert res_alerts.status_code == 400

