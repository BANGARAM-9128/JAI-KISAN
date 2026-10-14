"""Agricultural crop data and stage agronomy for Andhra Pradesh crops."""
from typing import Dict, Any, List

CROPS_DATA: Dict[str, Dict[str, Any]] = {
    "rice": {
        "common_name": "Rice (వరి)",
        "telugu_name": "వరి",
        "scientific_name": "Oryza sativa",
        "duration_days": 130,
        "stages": [
            {
                "stage": "nursery",
                "days": "0-25",
                "water_need": "high",
                "critical_risks": ["flooding", "seedling_blight"],
            },
            {
                "stage": "vegetative",
                "days": "25-50",
                "water_need": "high",
                "critical_risks": ["stem_borer", "blast", "water_stress"],
            },
            {
                "stage": "flowering",
                "days": "50-80",
                "water_need": "critical",
                "critical_risks": ["heat_sterility", "heavy_rain_washing", "brown_planthopper"],
            },
            {
                "stage": "grain_filling",
                "days": "80-110",
                "water_need": "moderate",
                "critical_risks": ["sheath_rot", "neck_blast", "false_smut"],
            },
            {
                "stage": "maturity",
                "days": "110-130",
                "water_need": "low",
                "critical_risks": ["cyclone_lodging", "unseasonal_rain", "grain_discoloration"],
            },
        ],
        "optimal_temp_c": {"min": 20.0, "max": 33.0},
        "critical_temp_max_c": 36.0,
        "sources": ["ANGRAU Rice Production Guide 2024", "ICAR-IIRR Hyderabad"]
    },
    "cotton": {
        "common_name": "Cotton (ప్రత్తి)",
        "telugu_name": "ప్రత్తి",
        "scientific_name": "Gossypium hirsutum",
        "duration_days": 160,
        "stages": [
            {
                "stage": "sowing",
                "days": "0-20",
                "water_need": "low",
                "critical_risks": ["waterlogging", "seed_rot", "crust_formation"],
            },
            {
                "stage": "vegetative",
                "days": "20-55",
                "water_need": "moderate",
                "critical_risks": ["sucking_pests", "leaf_curl", "weed_competition"],
            },
            {
                "stage": "flowering",
                "days": "55-110",
                "water_need": "critical",
                "critical_risks": ["bollworm", "square_shedding", "heavy_rain_damage"],
            },
            {
                "stage": "boll_development",
                "days": "110-145",
                "water_need": "moderate",
                "critical_risks": ["boll_rot", "pink_bollworm", "leaf_reddening"],
            },
            {
                "stage": "maturity",
                "days": "145-165",
                "water_need": "dry",
                "critical_risks": ["lint_spoilage_rain", "stained_lint"],
            },
        ],
        "optimal_temp_c": {"min": 21.0, "max": 35.0},
        "critical_temp_max_c": 40.0,
        "sources": ["ANGRAU Cotton Package of Practices", "ICAR-CICR Nagpur"]
    },
    "maize": {
        "common_name": "Maize (మొక్కజొన్న)",
        "telugu_name": "మొక్కజొన్న",
        "scientific_name": "Zea mays",
        "duration_days": 105,
        "stages": [
            {
                "stage": "sowing",
                "days": "0-15",
                "water_need": "moderate",
                "critical_risks": ["waterlogging", "cutworms"],
            },
            {
                "stage": "vegetative",
                "days": "15-40",
                "water_need": "moderate",
                "critical_risks": ["fall_armyworm", "stem_borer"],
            },
            {
                "stage": "tasseling",
                "days": "40-65",
                "water_need": "critical",
                "critical_risks": ["drought_pollen_desiccation", "high_winds_lodging"],
            },
            {
                "stage": "grain_filling",
                "days": "65-90",
                "water_need": "high",
                "critical_risks": ["turcicum_leaf_blight", "stalk_rot"],
            },
            {
                "stage": "maturity",
                "days": "90-105",
                "water_need": "low",
                "critical_risks": ["ear_rot", "cob_damage_by_rain"],
            },
        ],
        "optimal_temp_c": {"min": 18.0, "max": 32.0},
        "critical_temp_max_c": 38.0,
        "sources": ["ANGRAU Maize Guidelines", "ICAR-IIMR"]
    },
    "groundnut": {
        "common_name": "Groundnut (వేరుశనగ)",
        "telugu_name": "వేరుశనగ",
        "scientific_name": "Arachis hypogaea",
        "duration_days": 110,
        "stages": [
            {
                "stage": "sowing",
                "days": "0-15",
                "water_need": "moderate",
                "critical_risks": ["collar_rot", "seed_dormancy"],
            },
            {
                "stage": "vegetative",
                "days": "15-35",
                "water_need": "moderate",
                "critical_risks": ["leaf_miner", "aphids"],
            },
            {
                "stage": "flowering",
                "days": "35-60",
                "water_need": "critical",
                "critical_risks": ["moisture_stress_pegging", "tikka_disease"],
            },
            {
                "stage": "pod_development",
                "days": "60-90",
                "water_need": "critical",
                "critical_risks": ["pod_rot", "soil_compaction_drought"],
            },
            {
                "stage": "maturity",
                "days": "90-110",
                "water_need": "dry",
                "critical_risks": ["aflatoxin_spoilage_rain", "sprouting_in_pod"],
            },
        ],
        "optimal_temp_c": {"min": 22.0, "max": 30.0},
        "critical_temp_max_c": 35.0,
        "sources": ["ANGRAU Groundnut Advisory Bulletin", "ICRISAT Groundnut Agronomy"]
    },
    "chilli": {
        "common_name": "Chilli (మిరప)",
        "telugu_name": "మిరప",
        "scientific_name": "Capsicum annuum",
        "duration_days": 150,
        "stages": [
            {
                "stage": "nursery",
                "days": "0-35",
                "water_need": "moderate",
                "critical_risks": ["damping_off", "whitefly"],
            },
            {
                "stage": "vegetative",
                "days": "35-65",
                "water_need": "moderate",
                "critical_risks": ["thrips_black_thrips", "mites", "leaf_curl"],
            },
            {
                "stage": "flowering",
                "days": "65-100",
                "water_need": "high",
                "critical_risks": ["flower_drop_heat", "anthracnose_dieback", "powdery_mildew"],
            },
            {
                "stage": "fruit_maturation",
                "days": "100-150",
                "water_need": "moderate",
                "critical_risks": ["fruit_rot", "fruit_borer", "unseasonal_rain_drying_yards"],
            },
        ],
        "optimal_temp_c": {"min": 20.0, "max": 32.0},
        "critical_temp_max_c": 36.0,
        "sources": ["Dr. YSR Horticultural University Advisory", "ANGRAU Chilli Advisory Bulletin"]
    }
}


def get_supported_crops() -> List[str]:
    """Return list of supported crop keys."""
    return list(CROPS_DATA.keys())


def normalize_crop_name(name: str) -> str:
    """Normalize input crop name to standard key."""
    if not name:
        return "other"
    cleaned = name.lower().strip()
    mapping = {
        "paddy": "rice",
        "rice": "rice",
        "వరి": "rice",
        "cotton": "cotton",
        "ప్రత్తి": "cotton",
        "patti": "cotton",
        "maize": "maize",
        "corn": "maize",
        "మొక్కజొన్న": "maize",
        "groundnut": "groundnut",
        "peanut": "groundnut",
        "వేరుశనగ": "groundnut",
        "verusenaga": "groundnut",
        "chilli": "chilli",
        "chili": "chilli",
        "mirapa": "chilli",
        "మిరప": "chilli",
    }
    return mapping.get(cleaned, cleaned)
