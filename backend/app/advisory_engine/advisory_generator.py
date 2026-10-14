"""Advisory generator: creates tailored, localized agricultural advisories from evaluated risks."""
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from app.advisory_engine.risk_evaluator import RiskEvaluator, RiskEvaluationResult
from app.advisory_engine.crop_data import CROPS_DATA, normalize_crop_name


class AdvisoryGenerator:
    """Generates structured crop-specific and weather-based advisories."""

    def __init__(self, evaluator: Optional[RiskEvaluator] = None):
        self.evaluator = evaluator or RiskEvaluator()

    def generate_for_crop(
        self,
        weather_data: Dict[str, Any],
        farmer_profile_id: int,
        crop_name: str,
        growth_stage: str,
        crop_record_id: Optional[int] = None,
        soil_type: Optional[str] = None,
        irrigation_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate advisories targeted at a specific crop and its growth stage."""
        results = self.evaluator.evaluate(
            weather_data=weather_data,
            crop_name=crop_name,
            growth_stage=growth_stage,
            soil_type=soil_type,
            irrigation_type=irrigation_type
        )

        norm_crop = normalize_crop_name(crop_name)
        crop_meta = CROPS_DATA.get(norm_crop, {})
        telugu_crop = crop_meta.get("telugu_name", crop_name)

        advisories: List[Dict[str, Any]] = []
        now = datetime.now(timezone.utc)

        for res in results:
            rule = res.rule
            expires_at = now + timedelta(hours=rule.validity_hours)

            # Crop-specific title refinement if crop is specified
            title_en = rule.title_en
            title_te = rule.title_te
            if norm_crop in rule.crops and len(rule.crops) == 1:
                # Already specific
                pass

            advisory_dict = {
                "farmer_profile_id": farmer_profile_id,
                "crop_record_id": crop_record_id,
                "rule_id": rule.rule_id,
                "title": title_en,
                "title_te": title_te,
                "recommendation": rule.recommendation_en,
                "recommendation_te": rule.recommendation_te,
                "severity": res.severity,
                "weather_summary": res.trigger_summary,
                "source_reference": rule.source_reference,
                "confidence": res.confidence,
                "alternative_action": rule.alternative_en,
                "expires_at": expires_at,
                "is_active": True
            }
            advisories.append(advisory_dict)

        return advisories

    def generate_general_advisories(
        self,
        weather_data: Dict[str, Any],
        farmer_profile_id: int
    ) -> List[Dict[str, Any]]:
        """Generate general field and spray operation advisories when no crop is targeted."""
        results = self.evaluator.evaluate(
            weather_data=weather_data,
            crop_name=None,
            growth_stage=None
        )

        advisories: List[Dict[str, Any]] = []
        now = datetime.now(timezone.utc)

        for res in results:
            rule = res.rule
            expires_at = now + timedelta(hours=rule.validity_hours)

            advisory_dict = {
                "farmer_profile_id": farmer_profile_id,
                "crop_record_id": None,
                "rule_id": rule.rule_id,
                "title": rule.title_en,
                "title_te": rule.title_te,
                "recommendation": rule.recommendation_en,
                "recommendation_te": rule.recommendation_te,
                "severity": res.severity,
                "weather_summary": res.trigger_summary,
                "source_reference": rule.source_reference,
                "confidence": res.confidence,
                "alternative_action": rule.alternative_en,
                "expires_at": expires_at,
                "is_active": True
            }
            advisories.append(advisory_dict)

        return advisories
