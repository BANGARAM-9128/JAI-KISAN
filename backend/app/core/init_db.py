"""Database initialization script to create tables and seed initial knowledge docs & demo accounts."""
import asyncio
from datetime import datetime, date, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash
import app.models  # Ensure all models are registered with Base.metadata
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.models.crop import CropRecord
from app.models.knowledge import KnowledgeDocument


SEED_DOCUMENTS = [
    {
        "title": "ANGRAU Rice Production and Blast Management Guidelines",
        "source_org": "ANGRAU",
        "source_url": "https://angrau.ac.in/rice-management",
        "content": "Rice blast (Pyricularia oryzae) is exacerbated by prolonged relative humidity >85% and temperatures between 20-28°C. Farmers are advised to avoid excessive nitrogen application. In case of initial spindle spot symptoms on leaves, spray Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L during calm morning hours.",
        "document_type": "pest_management",
        "crop_tags": "rice,paddy",
        "region_tags": "Andhra Pradesh,Rayalaseema,Coastal Andhra",
        "publication_date": date(2024, 6, 1),
        "review_date": date(2025, 6, 1),
        "is_verified": True
    },
    {
        "title": "Cotton Waterlogging Drainage and Sucking Pest Advisory",
        "source_org": "ANGRAU",
        "source_url": "https://angrau.ac.in/cotton-package",
        "content": "Cotton cannot tolerate waterlogging beyond 24 hours. Standing water leads to square shedding and root asphyxiation. Immediately excavate 30cm deep trench drains at field borders to drain surface water. For sucking pests like aphids, jassids, and whiteflies, use yellow sticky traps and spray Flonicamid 50% WG @ 0.3g/L if ETL is reached.",
        "document_type": "water_management",
        "crop_tags": "cotton,patti",
        "region_tags": "Andhra Pradesh,Guntur,Kurnool",
        "publication_date": date(2024, 7, 15),
        "review_date": date(2025, 7, 15),
        "is_verified": True
    },
    {
        "title": "Chilli Black Thrips and Anthracnose Control Measures",
        "source_org": "Dr. YSRHU",
        "source_url": "https://drysrhu.ap.gov.in/chilli-advisory",
        "content": "In hot and dry spells, Thrips parvispinus multiply rapidly causing upward curling and floral abortion in chilli. Install blue sticky traps (25/acre) and spray neem oil (10,000 ppm) @ 2ml/L. For anthracnose (fruit rot / dieback) during humid cloudy weather, spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L.",
        "document_type": "pest_management",
        "crop_tags": "chilli,mirapa",
        "region_tags": "Andhra Pradesh,Guntur,Krishna,Prakasam",
        "publication_date": date(2024, 8, 10),
        "review_date": date(2025, 8, 10),
        "is_verified": True
    },
    {
        "title": "Groundnut Moisture Management during Pegging Stage",
        "source_org": "ICAR-CRIDA",
        "source_url": "https://crida.in/groundnut-resilience",
        "content": "Pegging stage (35-60 days after sowing) is the most critical moisture-sensitive period for groundnut. Moisture stress during this period drastically reduces pod formation and causes soil compaction. Provide supplemental micro-irrigation. For Tikka disease (Cercospora), apply Mancozeb 75% WP @ 2g/L.",
        "document_type": "irrigation",
        "crop_tags": "groundnut,verusenaga",
        "region_tags": "Andhra Pradesh,Anantapur,Kurnool,Kadapa",
        "publication_date": date(2024, 5, 20),
        "review_date": date(2025, 5, 20),
        "is_verified": True
    },
    {
        "title": "Maize Fall Armyworm (FAW) Integrated Pest Management",
        "source_org": "ICAR-IIMR",
        "source_url": "https://iimr.icar.gov.in/faw-management",
        "content": "Fall Armyworm (Spodoptera frugiperda) attacks maize during whorl stages. Monitor whorls for pin-hole damage and fresh sawdust frass. Place pheromone traps @ 5/acre. Apply neem cake at planting and release Trichogramma egg parasitoids. For chemical intervention, apply Chlorantraniliprole 18.5% SC @ 0.4ml/L directly into the leaf whorl.",
        "document_type": "pest_management",
        "crop_tags": "maize,corn",
        "region_tags": "Andhra Pradesh,Telangana",
        "publication_date": date(2024, 6, 25),
        "review_date": date(2025, 6, 25),
        "is_verified": True
    }
]


async def init_db() -> None:
    """Create all database tables and seed initial data."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Seed Knowledge Documents if empty
        k_res = await db.execute(select(KnowledgeDocument).limit(1))
        if not k_res.scalars().first():
            for doc_data in SEED_DOCUMENTS:
                doc = KnowledgeDocument(**doc_data)
                db.add(doc)
            await db.commit()

        # 2. Seed Admin User if not exists
        admin_res = await db.execute(select(User).where(User.email == "admin@jaikisan.in"))
        admin = admin_res.scalars().first()
        if not admin:
            admin = User(
                email="admin@jaikisan.in",
                password_hash=get_password_hash("Admin@123456"),
                role="admin",
                language_pref="en"
            )
            db.add(admin)
            await db.commit()

        # 3. Seed Demo Farmer User & Profile if not exists
        farmer_res = await db.execute(select(User).where(User.email == "farmer@jaikisan.in"))
        farmer = farmer_res.scalars().first()
        if not farmer:
            farmer = User(
                email="farmer@jaikisan.in",
                password_hash=get_password_hash("Farmer@123456"),
                role="farmer",
                language_pref="te"
            )
            db.add(farmer)
            await db.commit()
            await db.refresh(farmer)

            profile = FarmerProfile(
                user_id=farmer.id,
                display_name="Rami Reddy",
                village="Nandyal Rural",
                district="Kurnool",
                state="Andhra Pradesh",
                latitude=15.48,
                longitude=78.48,
                irrigation_type="borewell",
                soil_type="black_cotton",
                farm_size_acres=4.5
            )
            db.add(profile)
            await db.commit()
            await db.refresh(profile)

            # Seed crops for demo farmer
            today = date.today()
            crop1 = CropRecord(
                farmer_profile_id=profile.id,
                crop_name="cotton",
                variety="Bt-Cotton",
                sowing_date=today - timedelta(days=45),
                growth_stage="vegetative",
                field_area_acres=3.0,
                is_active=True
            )
            crop2 = CropRecord(
                farmer_profile_id=profile.id,
                crop_name="chilli",
                variety="Teja Chilli",
                sowing_date=today - timedelta(days=30),
                growth_stage="vegetative",
                field_area_acres=1.5,
                is_active=True
            )
            db.add_all([crop1, crop2])
            await db.commit()


if __name__ == "__main__":
    asyncio.run(init_db())
