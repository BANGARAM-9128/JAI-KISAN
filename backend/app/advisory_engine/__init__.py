"""Advisory engine package for rule-based agricultural recommendations."""
from app.advisory_engine.rules import ADVISORY_RULES, AdvisoryRule, get_rule_by_id
from app.advisory_engine.risk_evaluator import RiskEvaluator, RiskEvaluationResult
from app.advisory_engine.advisory_generator import AdvisoryGenerator
from app.advisory_engine.crop_data import CROPS_DATA, get_supported_crops, normalize_crop_name

__all__ = [
    "ADVISORY_RULES",
    "AdvisoryRule",
    "get_rule_by_id",
    "RiskEvaluator",
    "RiskEvaluationResult",
    "AdvisoryGenerator",
    "CROPS_DATA",
    "get_supported_crops",
    "normalize_crop_name",
]
