"""Assistant service combining weather, agronomy knowledge base, and conversational response generation."""
import logging
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.farmer_profile import FarmerProfile
from app.models.crop import CropRecord
from app.schemas.assistant import ChatRequest, ChatResponse
from app.services.weather_service import WeatherService
from app.services.knowledge_service import KnowledgeService
from app.advisory_engine.crop_data import CROPS_DATA, normalize_crop_name

logger = logging.getLogger(__name__)


class AssistantService:
    """Conversational agronomy assistant with weather context and knowledge retrieval."""

    def __init__(
        self,
        weather_service: Optional[WeatherService] = None,
        knowledge_service: Optional[KnowledgeService] = None
    ):
        self.weather_service = weather_service or WeatherService()
        self.knowledge_service = knowledge_service or KnowledgeService()

    async def get_response(
        self,
        db: AsyncSession,
        request: ChatRequest,
        profile: Optional[FarmerProfile] = None,
        crop: Optional[CropRecord] = None
    ) -> ChatResponse:
        """Process farmer chat request with grounded context."""
        query_text = request.message.lower().strip()
        weather_summary = None
        sources = ["ANGRAU Agricultural Guidelines"]

        # 1. Gather Weather Context if location available
        if profile:
            try:
                forecast = await self.weather_service.get_forecast(
                    db=db,
                    latitude=profile.latitude,
                    longitude=profile.longitude
                )
                curr_temp = forecast.current.temperature_2m
                curr_rh = forecast.current.relative_humidity_2m
                curr_wind = forecast.current.wind_speed_10m
                precip_48h = sum(forecast.daily.precipitation_sum[:2]) if forecast.daily.precipitation_sum else 0.0

                weather_summary = (
                    f"Location: {profile.district}, AP. Temp: {curr_temp:.1f}°C, "
                    f"Humidity: {curr_rh:.0f}%, Wind: {curr_wind:.1f} km/h, 48h Rain: {precip_48h:.1f}mm"
                )
                sources.append("Open-Meteo Weather Service")
            except Exception as e:
                logger.warning(f"Could not retrieve weather context for assistant: {e}")

        # 2. Search relevant knowledge docs
        crop_name = crop.crop_name if crop else None
        knowledge_hits = await self.knowledge_service.search_documents(
            db=db,
            query=query_text,
            crop=crop_name,
            limit=3
        )
        for doc in knowledge_hits:
            if doc.source_org not in sources:
                sources.append(doc.source_org)

        # 3. Grounded response generation (Demo Mode / Offline Agronomy Engine)
        return self._generate_grounded_response(
            query=query_text,
            language=request.language or "te",
            weather_summary=weather_summary,
            sources=sources,
            crop=crop,
            profile=profile
        )

    def _generate_grounded_response(
        self,
        query: str,
        language: str,
        weather_summary: Optional[str],
        sources: List[str],
        crop: Optional[CropRecord],
        profile: Optional[FarmerProfile]
    ) -> ChatResponse:
        """Generate bilingual agronomic response based on query patterns."""
        crop_str = crop.crop_name.capitalize() if crop else "your crop"
        crop_norm = normalize_crop_name(crop.crop_name) if crop else "rice"

        # Check for spray conditions
        if any(w in query for w in ["spray", "pest", "spray cheyocha", "పిచికారీ", "పురుగుల", "మందు"]):
            reply_en = (
                f"Based on current atmospheric conditions ({weather_summary or 'Calm weather'}), "
                "ensure wind speed is under 15 km/h before spraying. "
                "Spray during early morning or late afternoon to maximize leaf absorption and protect pollinators."
            )
            reply_te = (
                f"ప్రస్తుత వాతావరణ పరిస్థితుల ప్రకారం ({weather_summary or 'శాంతమైన వాతావరణం'}), "
                "గాలి వేగం తక్కువగా ఉన్నప్పుడు మాత్రమే పురుగుమందుల పిచికారీ చేయండి. "
                "ఉదయం 7 నుండి 10 గంటల మధ్య లేదా సాయంత్రం వేళల్లో పిచికారీ చేస్తే మంచి ఫలితం ఉంటుంది."
            )
            suggested = [
                "Check 24-hour rain forecast",
                "View recommended fungicides",
                "Log spray activity"
            ]

        # Check for rain / weather
        elif any(w in query for w in ["rain", "varsham", "వర్షం", "weather", "వాతావరణం"]):
            reply_en = (
                f"Weather Outlook: {weather_summary or 'Weather is stable'}. "
                "Please ensure all drainage canals are cleared to prevent root-zone water stagnation."
            )
            reply_te = (
                f"వాతావరణ సమాచారం: {weather_summary or 'వాతావరణం నిలకడగా ఉంది'}. "
                "పొలంలో నీరు నిల్వ ఉండకుండా మురుగు కాల్వలను శుభ్రంగా ఉంచుకోండి."
            )
            suggested = [
                "View 7-day detailed forecast",
                "Inspect drainage channels",
                "Check harvest advisories"
            ]

        # Check for fertilizer / urea
        elif any(w in query for w in ["fertilizer", "urea", "eruvulu", "యూరియా", "ఎరువులు"]):
            reply_en = (
                f"For {crop_str}, apply top-dressing fertilizers when the soil is moist but not saturated. "
                "Avoid applying urea prior to heavy rain forecasts to eliminate nutrient leaching."
            )
            reply_te = (
                f"{crop_str} పంటకు నేలలో తగినంత తేమ ఉన్నప్పుడు మాత్రమే పైపాటుగా ఎరువులు వేయండి. "
                "భారీ వర్ష సూచన ఉన్నప్పుడు యూరియా వేయవద్దు, అది కొట్టుకుపోయే ప్రమాదం ఉంది."
            )
            suggested = [
                "Calculate fertilizer dosage",
                "Check soil test recommendations",
                "View micro-nutrient options"
            ]

        # General inquiry / default
        else:
            reply_en = (
                f"Welcome to Jai Kisan Advisor. For {crop_str} in {profile.district if profile else 'Andhra Pradesh'}, "
                f"current status: {weather_summary or 'Weather monitoring active'}. "
                "How can I assist you today regarding crop protection, irrigation, or weather alerts?"
            )
            reply_te = (
                f"జై కిసాన్ సహాయకుడికి స్వాగతం. {crop_str} పంటకు సంబంధించి {weather_summary or 'వాతావరణ పరిశీలన కొనసాగుతోంది'}. "
                "సస్యరక్షణ, నీటి యాజమాన్యం లేదా వాతావరణ సలహాల గురించి మీకు ఎలాంటి సమాచారం కావాలి?"
            )
            suggested = [
                "Current crop risks",
                "Should I spray today?",
                "Irrigation schedule"
            ]

        return ChatResponse(
            reply=reply_en,
            reply_te=reply_te,
            sources_used=sources,
            weather_context_used=weather_summary,
            suggested_actions=suggested
        )
