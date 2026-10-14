"""Unit tests for the advisory engine: rules, risk evaluator, and advisory generator."""
import pytest
from app.advisory_engine.rules import ADVISORY_RULES, get_rule_by_id
from app.advisory_engine.risk_evaluator import RiskEvaluator
from app.advisory_engine.advisory_generator import AdvisoryGenerator
from app.advisory_engine.crop_data import get_supported_crops, normalize_crop_name


def test_rule_definitions_integrity():
    """Ensure all defined rules have valid fields, non-empty text, and bilingual content."""
    assert len(ADVISORY_RULES) >= 10
    rule_ids = set()

    for rule in ADVISORY_RULES:
        assert rule.rule_id not in rule_ids, f"Duplicate rule_id: {rule.rule_id}"
        rule_ids.add(rule.rule_id)
        assert rule.title_en and len(rule.title_en) > 5
        assert rule.title_te and len(rule.title_te) > 5
        assert rule.recommendation_en and len(rule.recommendation_en) > 10
        assert rule.recommendation_te and len(rule.recommendation_te) > 10
        assert rule.severity in ["info", "low", "moderate", "high", "critical"]
        assert rule.validity_hours > 0


def test_supported_crops_and_normalization():
    """Test crop normalization for English and Telugu names."""
    crops = get_supported_crops()
    assert "rice" in crops
    assert "cotton" in crops
    assert "chilli" in crops
    assert "groundnut" in crops
    assert "maize" in crops

    assert normalize_crop_name("Paddy") == "rice"
    assert normalize_crop_name("వరి") == "rice"
    assert normalize_crop_name("ప్రత్తి") == "cotton"
    assert normalize_crop_name("MIRAPA") == "chilli"
    assert normalize_crop_name("peanut") == "groundnut"
    assert normalize_crop_name("unknown_crop") == "unknown_crop"


# --- NORMAL DATA TESTS ---

def test_heavy_rain_risk_triggers_for_sensitive_crops():
    """Test heavy rain rule evaluation when rain exceeds 35mm in 48h."""
    evaluator = RiskEvaluator()
    weather = {
        "daily": {
            "precipitation_sum": [45.0, 10.0, 0.0, 0.0]
        }
    }

    # Cotton should trigger waterlogging alert
    results = evaluator.evaluate(weather, crop_name="cotton", growth_stage="vegetative")
    triggered_ids = [r.rule_id for r in results]
    assert "RULE_HEAVY_RAIN_WATERLOGGING" in triggered_ids

    # Rice vegetative should NOT trigger waterlogging (rice can withstand water)
    results_rice = evaluator.evaluate(weather, crop_name="rice", growth_stage="vegetative")
    triggered_rice_ids = [r.rule_id for r in results_rice]
    assert "RULE_HEAVY_RAIN_WATERLOGGING" not in triggered_rice_ids


def test_harvest_rain_damage_triggers_at_maturity():
    """Test harvest rain rule triggers specifically during maturity/harvesting stage."""
    evaluator = RiskEvaluator()
    weather = {
        "daily": {
            "precipitation_sum": [30.0, 5.0]
        }
    }

    # At maturity, rain > 25mm should trigger harvest damage
    results_mat = evaluator.evaluate(weather, crop_name="rice", growth_stage="maturity")
    assert any(r.rule_id == "RULE_HARVEST_RAIN_DAMAGE" for r in results_mat)

    # At vegetative stage, harvest damage should NOT trigger
    results_veg = evaluator.evaluate(weather, crop_name="rice", growth_stage="vegetative")
    assert not any(r.rule_id == "RULE_HARVEST_RAIN_DAMAGE" for r in results_veg)


def test_rice_blast_risk_evaluation():
    """Test rice blast conditions (RH >= 85% and moderate temp)."""
    evaluator = RiskEvaluator()
    weather = {
        "hourly": {
            "relative_humidity_2m": [88.0] * 24,
            "temperature_2m": [24.0] * 24,
            "precipitation": [0.0] * 24,
            "wind_speed_10m": [5.0] * 24
        }
    }

    results = evaluator.evaluate(weather, crop_name="rice", growth_stage="vegetative")
    assert any(r.rule_id == "RULE_RICE_BLAST_FAVORABLE" for r in results)


def test_heatwave_during_flowering():
    """Test heatwave rule (temp >= 36C) triggers for crops in flowering."""
    evaluator = RiskEvaluator()
    weather = {
        "daily": {
            "temperature_2m_max": [38.5, 39.0],
            "precipitation_sum": [0.0, 0.0]
        }
    }

    results = evaluator.evaluate(weather, crop_name="chilli", growth_stage="flowering")
    assert any(r.rule_id == "RULE_HEAT_WAVE_FLOWERING" for r in results)

    # vegetative chilli should not trigger flowering-specific heat rule
    results_veg = evaluator.evaluate(weather, crop_name="chilli", growth_stage="vegetative")
    assert not any(r.rule_id == "RULE_HEAT_WAVE_FLOWERING" for r in results_veg)


def test_strong_winds_lodging():
    """Test high wind speed (>= 30 km/h) triggers lodging risk for tall crops."""
    evaluator = RiskEvaluator()
    weather = {
        "hourly": {
            "wind_speed_10m": [35.0] * 12 + [15.0] * 12
        }
    }

    results_maize = evaluator.evaluate(weather, crop_name="maize", growth_stage="flowering")
    assert any(r.rule_id == "RULE_STRONG_WIND_LODGING" for r in results_maize)


def test_spray_window_evaluations():
    """Test spray postponement vs favorable window conditions."""
    evaluator = RiskEvaluator()

    # Unfavorable: high wind 22 km/h
    bad_weather = {
        "current": {"wind_speed_10m": 22.0, "precipitation": 0.0},
        "hourly": {"precipitation_probability": [10.0]}
    }
    res_bad = evaluator.evaluate(bad_weather)
    assert any(r.rule_id == "RULE_SPRAY_WEATHER_POSTPONE" for r in res_bad)
    assert not any(r.rule_id == "RULE_SPRAY_WINDOW_FAVORABLE" for r in res_bad)

    # Favorable: calm 8 km/h, 0 rain, low probability
    good_weather = {
        "current": {"wind_speed_10m": 8.0, "precipitation": 0.0},
        "hourly": {
            "wind_speed_10m": [8.0] * 24,
            "precipitation": [0.0] * 24,
            "precipitation_probability": [5.0] * 24
        }
    }
    res_good = evaluator.evaluate(good_weather)
    assert any(r.rule_id == "RULE_SPRAY_WINDOW_FAVORABLE" for r in res_good)
    assert not any(r.rule_id == "RULE_SPRAY_WEATHER_POSTPONE" for r in res_good)


# --- BOUNDARY DATA TESTS ---

def test_boundary_thresholds():
    """Test exact boundary condition handling."""
    evaluator = RiskEvaluator()

    # 1. Rain threshold at exactly 35.0mm (should trigger) vs 34.9mm (should NOT trigger)
    weather_exact_35 = {"daily": {"precipitation_sum": [35.0, 0.0]}}
    weather_below_35 = {"daily": {"precipitation_sum": [34.9, 0.0]}}

    res_35 = evaluator.evaluate(weather_exact_35, crop_name="cotton", growth_stage="vegetative")
    res_below_35 = evaluator.evaluate(weather_below_35, crop_name="cotton", growth_stage="vegetative")

    assert any(r.rule_id == "RULE_HEAVY_RAIN_WATERLOGGING" for r in res_35)
    assert not any(r.rule_id == "RULE_HEAVY_RAIN_WATERLOGGING" for r in res_below_35)

    # 2. Temperature threshold at exactly 36.0°C (should trigger) vs 35.9°C (should NOT trigger)
    weather_exact_36 = {"daily": {"temperature_2m_max": [36.0, 30.0]}}
    weather_below_36 = {"daily": {"temperature_2m_max": [35.9, 30.0]}}

    res_36 = evaluator.evaluate(weather_exact_36, crop_name="rice", growth_stage="flowering")
    res_below_36 = evaluator.evaluate(weather_below_36, crop_name="rice", growth_stage="flowering")

    assert any(r.rule_id == "RULE_HEAT_WAVE_FLOWERING" for r in res_36)
    assert not any(r.rule_id == "RULE_HEAT_WAVE_FLOWERING" for r in res_below_36)

    # 3. Wind speed threshold at exactly 30.0 km/h vs 29.9 km/h
    weather_exact_30 = {"hourly": {"wind_speed_10m": [30.0]}}
    weather_below_30 = {"hourly": {"wind_speed_10m": [29.9]}}

    res_30 = evaluator.evaluate(weather_exact_30, crop_name="maize", growth_stage="flowering")
    res_below_30 = evaluator.evaluate(weather_below_30, crop_name="maize", growth_stage="flowering")

    assert any(r.rule_id == "RULE_STRONG_WIND_LODGING" for r in res_30)
    assert not any(r.rule_id == "RULE_STRONG_WIND_LODGING" for r in res_below_30)


# --- MISSING DATA AND ROBUSTNESS TESTS ---

def test_missing_and_corrupt_data():
    """Verify evaluator never crashes with None, empty dicts, or corrupt lists."""
    evaluator = RiskEvaluator()

    # None input
    assert evaluator.evaluate(None) == []

    # Empty dictionary
    assert evaluator.evaluate({}) == []

    # Dictionary with None values
    corrupt_weather = {
        "current": None,
        "hourly": {
            "temperature_2m": [None, "invalid", 25.0],
            "relative_humidity_2m": [],
            "precipitation": None
        },
        "daily": {
            "precipitation_sum": [None, None]
        }
    }
    res = evaluator.evaluate(corrupt_weather, crop_name="rice", growth_stage="flowering")
    assert isinstance(res, list)


def test_advisory_generator_output():
    """Test AdvisoryGenerator formats complete bilingual advisory objects."""
    generator = AdvisoryGenerator()
    weather = {
        "daily": {
            "precipitation_sum": [50.0, 20.0]
        }
    }

    advisories = generator.generate_for_crop(
        weather_data=weather,
        farmer_profile_id=1,
        crop_name="cotton",
        growth_stage="flowering",
        crop_record_id=10
    )

    assert len(advisories) > 0
    adv = advisories[0]
    assert adv["farmer_profile_id"] == 1
    assert adv["crop_record_id"] == 10
    assert adv["title"] and isinstance(adv["title"], str)
    assert adv["title_te"] and isinstance(adv["title_te"], str)
    assert adv["recommendation"] and isinstance(adv["recommendation"], str)
    assert adv["recommendation_te"] and isinstance(adv["recommendation_te"], str)
    assert adv["expires_at"] is not None
    assert adv["confidence"] > 0.0
