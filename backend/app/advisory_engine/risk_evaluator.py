"""Risk evaluator: evaluates weather conditions against agronomic rules."""
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from app.advisory_engine.rules import ADVISORY_RULES, AdvisoryRule
from app.advisory_engine.crop_data import normalize_crop_name


@dataclass
class RiskEvaluationResult:
    rule_id: str
    rule_name: str
    severity: str
    confidence: float
    trigger_summary: str
    rule: AdvisoryRule


class RiskEvaluator:
    """Evaluates weather forecasts and crop attributes to identify agricultural risks."""

    def __init__(self, rules: Optional[List[AdvisoryRule]] = None):
        self.rules = rules or ADVISORY_RULES

    def _extract_weather_metrics(self, weather_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Safely extract key metrics handling None, missing keys, or empty lists."""
        metrics = {
            "current_temp": None,
            "current_rh": None,
            "current_wind": None,
            "current_precip": None,
            "max_temp_next_48h": None,
            "min_temp_next_48h": None,
            "precip_sum_next_48h": 0.0,
            "precip_sum_7d": 0.0,
            "max_wind_next_48h": None,
            "max_rh_next_48h": None,
            "max_precip_prob_next_24h": 0.0,
        }

        if not weather_data or not isinstance(weather_data, dict):
            return metrics

        # 1. Current metrics
        current = weather_data.get("current")
        if isinstance(current, dict):
            metrics["current_temp"] = current.get("temperature_2m")
            metrics["current_rh"] = current.get("relative_humidity_2m")
            metrics["current_wind"] = current.get("wind_speed_10m")
            metrics["current_precip"] = current.get("precipitation")

        # 2. Hourly metrics
        hourly = weather_data.get("hourly")
        if isinstance(hourly, dict):
            temps = hourly.get("temperature_2m") or []
            rhs = hourly.get("relative_humidity_2m") or []
            precips = hourly.get("precipitation") or []
            winds = hourly.get("wind_speed_10m") or []
            precip_probs = hourly.get("precipitation_probability") or []

            # Filter valid numbers in next 48 hours (or available)
            valid_temps_48 = [t for t in temps[:48] if isinstance(t, (int, float))]
            if valid_temps_48:
                metrics["max_temp_next_48h"] = max(valid_temps_48)
                metrics["min_temp_next_48h"] = min(valid_temps_48)

            valid_rhs_48 = [rh for rh in rhs[:48] if isinstance(rh, (int, float))]
            if valid_rhs_48:
                metrics["max_rh_next_48h"] = max(valid_rhs_48)

            valid_precips_48 = [p for p in precips[:48] if isinstance(p, (int, float))]
            if valid_precips_48:
                metrics["precip_sum_next_48h"] = sum(valid_precips_48)

            valid_winds_48 = [w for w in winds[:48] if isinstance(w, (int, float))]
            if valid_winds_48:
                metrics["max_wind_next_48h"] = max(valid_winds_48)

            valid_probs_24 = [p for p in precip_probs[:24] if isinstance(p, (int, float))]
            if valid_probs_24:
                metrics["max_precip_prob_next_24h"] = max(valid_probs_24)

        # 3. Daily metrics fallback or supplement
        daily = weather_data.get("daily")
        if isinstance(daily, dict):
            daily_precip = daily.get("precipitation_sum") or []
            valid_daily_precip = [p for p in daily_precip if isinstance(p, (int, float))]
            if valid_daily_precip:
                metrics["precip_sum_7d"] = sum(valid_daily_precip[:7])
                if metrics["precip_sum_next_48h"] == 0.0 and len(valid_daily_precip) >= 2:
                    metrics["precip_sum_next_48h"] = sum(valid_daily_precip[:2])

            daily_temp_max = daily.get("temperature_2m_max") or []
            valid_daily_max = [t for t in daily_temp_max[:2] if isinstance(t, (int, float))]
            if valid_daily_max and metrics["max_temp_next_48h"] is None:
                metrics["max_temp_next_48h"] = max(valid_daily_max)

            daily_wind_max = daily.get("wind_speed_10m_max") or []
            valid_daily_winds = [w for w in daily_wind_max[:2] if isinstance(w, (int, float))]
            if valid_daily_winds and metrics["max_wind_next_48h"] is None:
                metrics["max_wind_next_48h"] = max(valid_daily_winds)

        # Fallbacks to current if 48h windows are absent
        if metrics["max_temp_next_48h"] is None and metrics["current_temp"] is not None:
            metrics["max_temp_next_48h"] = metrics["current_temp"]

        if metrics["max_wind_next_48h"] is None and metrics["current_wind"] is not None:
            metrics["max_wind_next_48h"] = metrics["current_wind"]

        if metrics["max_rh_next_48h"] is None and metrics["current_rh"] is not None:
            metrics["max_rh_next_48h"] = metrics["current_rh"]

        return metrics

    def _matches_crop_and_stage(
        self,
        rule: AdvisoryRule,
        crop_name: Optional[str],
        growth_stage: Optional[str]
    ) -> bool:
        """Check if rule applies to the specified crop and growth stage."""
        norm_crop = normalize_crop_name(crop_name) if crop_name else None
        norm_stage = growth_stage.lower().strip() if growth_stage else None

        # Crop matching
        crop_match = False
        if "ALL" in rule.crops:
            crop_match = True
        elif norm_crop and norm_crop in rule.crops:
            crop_match = True

        if not crop_match:
            return False

        # Stage matching
        if "ALL" in rule.stages:
            return True
        if norm_stage and norm_stage in rule.stages:
            return True

        return False

    def evaluate(
        self,
        weather_data: Optional[Dict[str, Any]],
        crop_name: Optional[str] = None,
        growth_stage: Optional[str] = None,
        soil_type: Optional[str] = None,
        irrigation_type: Optional[str] = None
    ) -> List[RiskEvaluationResult]:
        """Evaluate weather conditions and crop context against all registered rules."""
        m = self._extract_weather_metrics(weather_data)
        triggered: List[RiskEvaluationResult] = []

        for rule in self.rules:
            if not self._matches_crop_and_stage(rule, crop_name, growth_stage):
                continue

            # Evaluate each rule's specific threshold conditions
            if rule.rule_id == "RULE_HEAVY_RAIN_WATERLOGGING":
                precip = m["precip_sum_next_48h"]
                if precip is not None and precip >= 35.0:
                    conf = min(0.95, 0.70 + (precip / 100.0) * 0.25)
                    triggered.append(RiskEvaluationResult(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=rule.severity,
                        confidence=round(conf, 2),
                        trigger_summary=f"Forecast rain of {precip:.1f}mm in next 48h exceeds 35mm threshold",
                        rule=rule
                    ))

            elif rule.rule_id == "RULE_HARVEST_RAIN_DAMAGE":
                precip = m["precip_sum_next_48h"]
                if precip is not None and precip >= 25.0:
                    conf = min(0.95, 0.75 + (precip / 80.0) * 0.2)
                    triggered.append(RiskEvaluationResult(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=rule.severity,
                        confidence=round(conf, 2),
                        trigger_summary=f"Rain of {precip:.1f}mm expected during maturity/harvest stage",
                        rule=rule
                    ))

            elif rule.rule_id == "RULE_RICE_BLAST_FAVORABLE":
                rh = m["max_rh_next_48h"]
                temp = m["max_temp_next_48h"]
                if rh is not None and rh >= 85.0 and temp is not None and 18.0 <= temp <= 30.0:
                    conf = 0.88 if rh >= 90.0 else 0.80
                    triggered.append(RiskEvaluationResult(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=rule.severity,
                        confidence=conf,
                        trigger_summary=f"Favorable blast conditions: RH {rh:.0f}% (>=85%) and temp {temp:.1f}°C (18-30°C)",
                        rule=rule
                    ))

            elif rule.rule_id == "RULE_CHILLI_THRIPS_DRY_HEAT":
                temp = m["max_temp_next_48h"]
                precip = m["precip_sum_next_48h"]
                if temp is not None and temp >= 33.0 and precip is not None and precip < 5.0:
                    triggered.append(RiskEvaluationResult(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=rule.severity,
                        confidence=0.84,
                        trigger_summary=f"Hot & dry conditions: Max temp {temp:.1f}°C (>=33°C) and minimal rain {precip:.1f}mm",
                        rule=rule
                    ))

            elif rule.rule_id == "RULE_COTTON_PEST_WEATHER":
                rh = m["max_rh_next_48h"]
                temp = m["max_temp_next_48h"]
                if rh is not None and rh >= 75.0 and temp is not None and 25.0 <= temp <= 36.0:
                    triggered.append(RiskEvaluationResult(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=rule.severity,
                        confidence=0.82,
                        trigger_summary=f"High humidity ({rh:.0f}%) and warm temp ({temp:.1f}°C) favoring cotton pests",
                        rule=rule
                    ))

            elif rule.rule_id == "RULE_GROUNDNUT_TIKKA":
                rh = m["max_rh_next_48h"]
                temp = m["max_temp_next_48h"]
                if rh is not None and rh >= 80.0 and temp is not None and 24.0 <= temp <= 32.0:
                    triggered.append(RiskEvaluationResult(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=rule.severity,
                        confidence=0.85,
                        trigger_summary=f"Tikka favorable weather: RH {rh:.0f}% (>=80%) and temp {temp:.1f}°C",
                        rule=rule
                    ))

            elif rule.rule_id == "RULE_HEAT_WAVE_FLOWERING":
                temp = m["max_temp_next_48h"]
                if temp is not None and temp >= 36.0:
                    conf = min(0.95, 0.75 + ((temp - 36.0) / 10.0) * 0.2)
                    triggered.append(RiskEvaluationResult(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=rule.severity,
                        confidence=round(conf, 2),
                        trigger_summary=f"Severe heat stress: Max temp {temp:.1f}°C (>=36°C) during flowering/tasseling",
                        rule=rule
                    ))

            elif rule.rule_id == "RULE_DRY_SPELL_IRRIGATION":
                precip_7d = m["precip_sum_7d"]
                temp = m["max_temp_next_48h"]
                if precip_7d is not None and precip_7d < 3.0 and temp is not None and temp >= 32.0:
                    triggered.append(RiskEvaluationResult(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=rule.severity,
                        confidence=0.80,
                        trigger_summary=f"Prolonged dry spell: 7-day rain sum {precip_7d:.1f}mm (<3mm) and warm conditions",
                        rule=rule
                    ))

            elif rule.rule_id == "RULE_STRONG_WIND_LODGING":
                wind = m["max_wind_next_48h"]
                if wind is not None and wind >= 30.0:
                    conf = min(0.95, 0.75 + ((wind - 30.0) / 40.0) * 0.2)
                    triggered.append(RiskEvaluationResult(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=rule.severity,
                        confidence=round(conf, 2),
                        trigger_summary=f"Strong wind gusts expected: {wind:.1f} km/h (>=30 km/h)",
                        rule=rule
                    ))

            elif rule.rule_id == "RULE_SPRAY_WEATHER_POSTPONE":
                wind = m["max_wind_next_48h"] or m["current_wind"]
                precip = m["precip_sum_next_48h"]
                prob = m["max_precip_prob_next_24h"]
                is_windy = wind is not None and wind >= 18.0
                is_rainy = (precip is not None and precip >= 3.0) or (prob is not None and prob >= 50.0)

                if is_windy or is_rainy:
                    triggered.append(RiskEvaluationResult(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=rule.severity,
                        confidence=0.85,
                        trigger_summary=f"Unfavorable spraying conditions: wind={wind} km/h, rain={precip} mm, rain_prob={prob}%",
                        rule=rule
                    ))

            elif rule.rule_id == "RULE_SPRAY_WINDOW_FAVORABLE":
                wind = m["max_wind_next_48h"] or m["current_wind"]
                precip = m["precip_sum_next_48h"]
                prob = m["max_precip_prob_next_24h"]
                is_calm = wind is not None and wind <= 12.0
                is_dry = (precip is not None and precip <= 0.2) and (prob is not None and prob <= 20.0)

                if is_calm and is_dry:
                    triggered.append(RiskEvaluationResult(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=rule.severity,
                        confidence=0.90,
                        trigger_summary=f"Calm & dry conditions favorable for foliar spray: wind={wind} km/h, prob={prob}%",
                        rule=rule
                    ))

        return triggered
