"""Live integration verification script for Jai Kisan API endpoints."""
import asyncio
import httpx

async def verify_live_api():
    base_url = "http://127.0.0.1:8000"
    async with httpx.AsyncClient(base_url=base_url, timeout=15.0) as client:
        # 1. Health check
        res = await client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print(f"1. Health Check OK: {res.json()['status']}, version: {res.json()['version']}")

        # 2. Farmer Login
        login_res = await client.post("/auth/login", json={"email": "farmer@jaikisan.in", "password": "Farmer@123456"})
        assert login_res.status_code == 200, f"Farmer login failed: {login_res.text}"
        token = login_res.json()["access_token"]
        farmer_headers = {"Authorization": f"Bearer {token}"}
        print(f"2. Farmer Login OK: {login_res.json()['user']['email']}")

        # 3. Farmer Profile
        prof_res = await client.get("/profile", headers=farmer_headers)
        assert prof_res.status_code == 200, f"Profile fetch failed: {prof_res.text}"
        prof = prof_res.json()
        print(f"3. Profile OK: {prof['display_name']} ({prof['district']}, {prof['state']}) GPS: ({prof['latitude']}, {prof['longitude']})")

        # 4. Crop Records
        crops_res = await client.get("/crops", headers=farmer_headers)
        assert crops_res.status_code == 200, f"Crops list failed: {crops_res.text}"
        crops = crops_res.json()
        print(f"4. Crops OK: {len(crops)} crops found -> {[c['crop_name'] for c in crops]}")

        # 5. Live Weather with Attribution
        weather_res = await client.get(f"/weather?lat={prof['latitude']}&lon={prof['longitude']}")
        assert weather_res.status_code == 200, f"Weather fetch failed: {weather_res.text}"
        w = weather_res.json()
        print(f"5. Weather OK: {w['current']['temperature_2m']}°C, Provider: {w['provider']}, Attribution: '{w['attribution']}', Cached: {w['is_cached']}")

        # 6. Advisory Generation
        gen_res = await client.post("/advisories/generate", json={}, headers=farmer_headers)
        assert gen_res.status_code == 200, f"Advisory generation failed: {gen_res.text}"
        gen = gen_res.json()
        print(f"6. Advisory Generation OK: Generated {gen['count']} advisories: {gen['message']}")

        # 7. List Advisories
        adv_res = await client.get("/advisories", headers=farmer_headers)
        assert adv_res.status_code == 200, f"Advisories list failed: {adv_res.text}"
        advs = adv_res.json()
        print(f"7. Active Advisories OK: {len(advs)} active advisories found.")
        if advs:
            print(f"   Top Advisory: '{advs[0]['title']}' (Severity: {advs[0]['severity']}, Confidence: {advs[0]['confidence']})")

        # 8. Kisan AI Assistant (Bilingual)
        chat_res = await client.post(
            "/assistant/chat",
            json={"message": "Can I spray pesticide on cotton today?", "language": "te"},
            headers=farmer_headers
        )
        assert chat_res.status_code == 200, f"Chat failed: {chat_res.text}"
        chat = chat_res.json()
        print(f"8. Kisan AI Assistant OK: Reply Telugu length: {len(chat.get('reply_te', ''))} chars, Sources: {chat['sources_used']}")

        # 9. Admin Stats
        admin_login_res = await client.post("/auth/login", json={"email": "admin@jaikisan.in", "password": "Admin@123456"})
        assert admin_login_res.status_code == 200, f"Admin login failed: {admin_login_res.text}"
        admin_token = admin_login_res.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        stats_res = await client.get("/admin/stats", headers=admin_headers)
        assert stats_res.status_code == 200, f"Admin stats failed: {stats_res.text}"
        stats = stats_res.json()
        print(f"9. Admin Stats OK: Total Users: {stats['total_users']}, Profiles: {stats['total_profiles']}, Crops: {stats['total_crops']}, Advisories: {stats['total_advisories']}")

        print("\n[SUCCESS] ALL 9 LIVE ENDPOINTS VERIFIED SUCCESSFULLY AGAINST RUNNING SERVER!")

if __name__ == "__main__":
    asyncio.run(verify_live_api())
