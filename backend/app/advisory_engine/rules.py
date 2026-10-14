"""Rule definitions for agricultural weather advisory evaluation."""
from typing import Dict, Any, List, Optional
from dataclasses import dataclass


@dataclass
class AdvisoryRule:
    rule_id: str
    name: str
    crops: List[str]  # e.g., ["rice"], ["cotton", "chilli"], or ["ALL"]
    stages: List[str]  # e.g., ["flowering"], ["maturity"], or ["ALL"]
    severity: str  # info, low, moderate, high, critical
    title_en: str
    title_te: str
    recommendation_en: str
    recommendation_te: str
    alternative_en: str
    alternative_te: str
    source_reference: str
    validity_hours: int = 48


ADVISORY_RULES: List[AdvisoryRule] = [
    # 1. HEAVY RAINFALL - GENERAL / WATERLOGGING
    AdvisoryRule(
        rule_id="RULE_HEAVY_RAIN_WATERLOGGING",
        name="Heavy Rain & Waterlogging Warning",
        crops=["cotton", "maize", "groundnut", "chilli"],
        stages=["ALL"],
        severity="high",
        title_en="Heavy Rainfall Expected: Clear Field Drainage Immediately",
        title_te="భారీ వర్ష సూచన: పొలంలో మురుగునీటి కాల్వలను వెంటనే శుభ్రం చేయండి",
        recommendation_en="Forecast indicates substantial rainfall (>35mm). Cotton, maize, chilli, and groundnut are extremely sensitive to standing water. Open drainage channels around field borders to prevent root asphyxiation and collar rot.",
        recommendation_te="రాబోయే 24-48 గంటల్లో భారీ వర్షం కురిసే అవకాశం ఉంది. ప్రత్తి, మొక్కజొన్న, మిరప, వేరుశనగ పంటలు నిలిచిన నీటికి తట్టుకోలేవు. వేరుకుళ్లు, మొక్కలు ఎండిపోకుండా నివారించడానికి మురుగునీటి కాల్వలు తీసి నీరు బయటకు పోయేలా చూడండి.",
        alternative_en="If field is already flooded, apply recommended fungicide drench (copper oxychloride @ 3g/L) after water recedes.",
        alternative_te="పొలంలో నీరు నిలిచిపోతే, నీరు తగ్గిన వెంటనే కాపర్ ఆక్సిక్లోరైడ్ 3 గ్రాములు లీటరు నీటికి కలిపి పాదుల వద్ద పిచికారీ చేయండి.",
        source_reference="ANGRAU Disaster Management Agromet Advisory",
        validity_hours=48
    ),

    # 2. HEAVY RAINFALL AT HARVEST - RICE / GROUNDNUT
    AdvisoryRule(
        rule_id="RULE_HARVEST_RAIN_DAMAGE",
        name="Heavy Rain during Harvest / Maturity Stage",
        crops=["rice", "groundnut"],
        stages=["maturity", "harvesting"],
        severity="critical",
        title_en="Urgent: Postpone Harvesting or Protect Harvested Produce from Rain",
        title_te="అత్యవసరం: వర్షం ఉన్నందున కోత వాయిదా వేయండి లేదా కోసిన పైరును భద్రపరచండి",
        recommendation_en="Heavy rainfall is forecast during the maturity/harvest stage. Postpone crop harvesting. For already harvested produce, stack on elevated ground and cover tightly with tarpaulins to prevent grain sprouting and aflatoxin development.",
        recommendation_te="పంట కోత దశలో భారీ వర్షం సూచన ఉన్నందున కోత పనులను వాయిదా వేయండి. ఇప్పటికే కోసిన ధాన్యం లేదా వేరుశనగ కాయలను ఎత్తైన ప్రదేశంలో భద్రపరిచి టార్పాలిన్లతో కప్పండి.",
        alternative_en="If grain was wetted, spray 5% salt (NaCl) solution on paddy sheaves to temporarily inhibit sprouting.",
        alternative_te="కోసిన వరి పనలు తడిచినట్లయితే మొలక రాకుండా 5% ఉప్పు ద్రావణాన్ని పిచికారీ చేయండి.",
        source_reference="ICAR-CRIDA Agromet Advisory Bulletin",
        validity_hours=36
    ),

    # 3. RICE BLAST RISK (HUMIDITY + CLOUD/RAIN + MODERATE TEMP)
    AdvisoryRule(
        rule_id="RULE_RICE_BLAST_FAVORABLE",
        name="Rice Blast Disease Alert (Weather Conducive)",
        crops=["rice"],
        stages=["vegetative", "flowering", "grain_filling"],
        severity="high",
        title_en="High Blast Disease Risk in Rice Due to High Humidity and Moderate Temperatures",
        title_te="అధిక తేమ వల్ల వరిలో అగ్గి తెగులు (బ్లాస్ట్) వ్యాప్తి చెందే ప్రమాదం",
        recommendation_en="Prolonged relative humidity (>85%) combined with temperatures between 20°C and 28°C strongly favors rice blast (Pyricularia oryzae). Avoid excessive top-dressing of nitrogen fertilizers. Monitor leaf spindle lesions.",
        recommendation_te="గాలిలో అధిక తేమ (85% పైగా) మరియు 20-28 డిగ్రీల ఉష్ణోగ్రత ఉన్నందున వరిలో అగ్గి తెగులు సోకే అవకాశం ఉంది. యూరియా అధికంగా వాడవద్దు. ఆకులపై కంటి ఆకారపు మచ్చలను గమనించండి.",
        alternative_en="If initial spots appear, spray Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L during a dry spray window.",
        alternative_te="తెగులు లక్షణాలు కనిపిస్తే వర్షం లేని సమయంలో ట్రైసైక్లాజోల్ 0.6 గ్రా. లేదా ఐసోప్రోథియోలేన్ 1.5 మి.లీ. లీటరు నీటికి కలిపి పిచికారీ చేయండి.",
        source_reference="ANGRAU Rice Protection Bulletin",
        validity_hours=72
    ),

    # 4. CHILLI THRIPS & DIEBACK IN WARM/DRY SPELL
    AdvisoryRule(
        rule_id="RULE_CHILLI_THRIPS_DRY_HEAT",
        name="Chilli Thrips & Sucking Pest Alert",
        crops=["chilli"],
        stages=["vegetative", "flowering"],
        severity="moderate",
        title_en="Warm & Dry Conditions Favor Black Thrips / Mites in Chilli",
        title_te="పొడి వాతావరణం, ఎండ తీవ్రత వల్ల మిరపలో నల్ల తామర పురుగుల ఉధృతి",
        recommendation_en="Max temperatures (>33°C) and low rainfall create ideal conditions for thrips multiplication, causing upward leaf curling and flower shedding. Install blue and yellow sticky traps (20-25 per acre).",
        recommendation_te="పగటి ఉష్ణోగ్రతలు పెరగడం, పొడి వాతావరణం వల్ల మిరపలో తామర పురుగులు, నల్లి ఆశించే అవకాశం ఉంది. ఎకరానికి 20-25 నీలి, పసుపు రంగు జిగురు అట్టలను అమర్చండి.",
        alternative_en="Spray neem oil (10,000 ppm) @ 2ml/L as preventive, or Fipronil 5% SC @ 2ml/L if infestation crosses economic threshold.",
        alternative_te="నివారణకు వేప నూనె 2 మి.లీ. లేదా ఉధృతి ఎక్కువగా ఉంటే ఫిప్రోనిల్ 2 మి.లీ. లీటరు నీటికి కలిపి పిచికారీ చేయండి.",
        source_reference="Dr. YSR Horticultural University Advisory",
        validity_hours=72
    ),

    # 5. COTTON SUCKING PESTS / BOLL ROT
    AdvisoryRule(
        rule_id="RULE_COTTON_PEST_WEATHER",
        name="Cotton Pest & Weather Threat",
        crops=["cotton"],
        stages=["flowering", "boll_development"],
        severity="moderate",
        title_en="High Humidity & Intermittent Showers Favor Cotton Boll Rot & Sucking Pests",
        title_te="తేమతో కూడిన వాతావరణంలో ప్రత్తిలో కాయకుళ్లు మరియు రసం పీల్చే పురుగుల ప్రభావం",
        recommendation_en="Intermittent rains with overcast conditions increase boll rot risk and jassids/whiteflies. Ensure good aeration in dense canopies by topping or de-suckering if needed.",
        recommendation_te="ముసురు వాతావరణం, చిరుజల్లుల వల్ల ప్రత్తి కాయలు కుళ్లిపోయే ప్రమాదం ఉంది. తోటలో గాలి వెలుతురు ధారాళంగా ప్రసరించేలా చూడండి.",
        alternative_en="Apply Copper Oxychloride @ 30g + Streptocycline @ 1g in 10 liters of water during clear sunny weather.",
        alternative_te="ఎండ వచ్చినప్పుడు కాపర్ ఆక్సిక్లోరైడ్ 30 గ్రాములు + స్ట్రెప్టోసైక్లిన్ 1 గ్రాము 10 లీటర్ల నీటికి కలిపి పిచికారీ చేయండి.",
        source_reference="ANGRAU Cotton Package of Practices",
        validity_hours=48
    ),

    # 6. GROUNDNUT TIKKA LEAF SPOT
    AdvisoryRule(
        rule_id="RULE_GROUNDNUT_TIKKA",
        name="Groundnut Tikka Leaf Spot Risk",
        crops=["groundnut"],
        stages=["flowering", "pod_development"],
        severity="moderate",
        title_en="Warm Humid Weather: Watch for Tikka Leaf Spot in Groundnut",
        title_te="తేమతో కూడిన వేడి వాతావరణం: వేరుశనగలో తిక్కా ఆకుమచ్చ తెగులు జాగ్రత్త",
        recommendation_en="Relative humidity above 80% with temperatures between 25-30°C promotes Cercospora leaf spot (Tikka). Regularly inspect lower leaves for dark brown circular spots.",
        recommendation_te="గాలిలో అధిక తేమ, వెచ్చని వాతావరణం వల్ల వేరుశనగలో తిక్కా ఆకుమచ్చ తెగులు ఆశించే అవకాశం ఉంది. కింద ఆకులపై గోధుమ రంగు మచ్చలను పరిశీలించండి.",
        alternative_en="Spray Mancozeb @ 2g/L or Tebuconazole @ 1ml/L at disease onset.",
        alternative_te="తెగులు గుర్తిస్తే మాంకోజెబ్ 2 గ్రాములు లేదా టెబుకొనజోల్ 1 మి.లీ. లీటరు నీటికి కలిపి పిచికారీ చేయండి.",
        source_reference="ICRISAT & ANGRAU Groundnut Agronomy",
        validity_hours=72
    ),

    # 7. HIGH TEMPERATURE FLOWER DROP
    AdvisoryRule(
        rule_id="RULE_HEAT_WAVE_FLOWERING",
        name="High Temperature / Heat Wave during Flowering",
        crops=["rice", "cotton", "maize", "chilli", "groundnut"],
        stages=["flowering", "tasseling"],
        severity="high",
        title_en="Extreme Heat Alert: Protect Flowering Crops from Pollen Sterility",
        title_te="తీవ్ర ఉష్ణోగ్రత హెచ్చరిక: పూత దశలో ఉన్న పైరును కాపాడుకోండి",
        recommendation_en="Daytime maximum temperatures exceeding 36°C will impair pollination and cause flower drop. Provide light and frequent irrigations during evening hours to maintain microclimate humidity.",
        recommendation_te="పగటి ఉష్ణోగ్రతలు 36 డిగ్రీలకు మించనున్నందున పూత రాలిపోయే ప్రమాదం ఉంది. సాయంత్రం వేళల్లో తేలికపాటి తడులు ఇచ్చి నేలలో తేమను కాపాడండి.",
        alternative_en="Spray potassium nitrate (13-0-45) @ 10g/L to enhance crop thermal tolerance.",
        alternative_te="ఉష్ణ ఒత్తిడిని తట్టుకోవడానికి 13-0-45 (పొటాషియం నైట్రేట్) 10 గ్రాములు లీటరు నీటికి కలిపి పిచికారీ చేయండి.",
        source_reference="IMD-Agromet Advisory Services",
        validity_hours=48
    ),

    # 8. DRY SPELL / MOISTURE STRESS
    AdvisoryRule(
        rule_id="RULE_DRY_SPELL_IRRIGATION",
        name="Dry Spell Alert: Supplemental Irrigation Advised",
        crops=["ALL"],
        stages=["ALL"],
        severity="moderate",
        title_en="Dry Spell Forecast: Plan Supplemental Irrigation",
        title_te="పొడి వాతావరణం: పంటలకు అవసరమైన నీటి తడులు అందించండి",
        recommendation_en="No significant precipitation is expected in the next 7 days with elevated evaporation rates. Crops with high moisture demand should be irrigated immediately, preferably using drip or sprinkler systems.",
        recommendation_te="రాగల 7 రోజుల్లో వర్ష సూచన లేదు. నేలలో తేమ ఆరిపోకుండా పంటలకు సరిపడా నీటి తడులు ఇవ్వండి. బిందు సేద్యం లేదా తుంపర సేద్యం వాడడం శ్రేయస్కరం.",
        alternative_en="Apply organic mulch or crop residue between crop rows to conserve soil moisture.",
        alternative_te="భూమిలో తేమ ఆవిరి కాకుండా అంతర సాగు లేదా ఎండిన ఆకులతో నేలను కప్పండి (మల్చింగ్).",
        source_reference="CRIDA Dryland Agriculture Guidelines",
        validity_hours=72
    ),

    # 9. HIGH WIND SPEED / CYCLONIC GUSTS
    AdvisoryRule(
        rule_id="RULE_STRONG_WIND_LODGING",
        name="Strong Wind / Lodging Danger",
        crops=["maize", "rice", "cotton"],
        stages=["flowering", "grain_filling", "maturity"],
        severity="high",
        title_en="High Wind Gusts (>30 km/h): Risk of Crop Lodging",
        title_te="ఈదురు గాలుల ప్రమాదం: పంటలు నేలవాలే ముప్పు",
        recommendation_en="Forecast indicates strong sustained wind gusts exceeding 30 km/h. Avoid irrigation prior to windy days as wet root zones increase lodging risks. Provide earthing up for maize and staking for chilli/cotton.",
        recommendation_te="గంటకు 30 కి.మీ పైగా వేగంతో ఈదురు గాలులు వీచే అవకాశం ఉంది. తడి నేలలో పైరు సులభంగా నేలవాలుతుంది కాబట్టి గాలులకు ముందు నీరు పెట్టవద్దు. మొక్కజొన్నకు మొదళ్ళ వద్ద మట్టిని ఎగదోయండి.",
        alternative_en="Drain excess standing water immediately to firm up root anchoring in the soil.",
        alternative_te="వేర్లు బలంగా నిలబడటానికి మడులలో నిల్వ ఉన్న నీటిని వెంటనే తొలగించండి.",
        source_reference="IMD Agrometeorological Warning",
        validity_hours=48
    ),

    # 10. SPRAY WEATHER CONDITIONS
    AdvisoryRule(
        rule_id="RULE_SPRAY_WEATHER_POSTPONE",
        name="Unfavorable Weather for Pesticide/Fertilizer Spraying",
        crops=["ALL"],
        stages=["ALL"],
        severity="moderate",
        title_en="Postpone Chemical Spraying: Rain or High Winds Forecast",
        title_te="పురుగుమందుల పిచికారీ వాయిదా వేయండి: వర్షం / గాలుల సూచన",
        recommendation_en="High wind speeds (>18 km/h) or upcoming rain will cause spray drift or wash-off, wasting expensive inputs and contaminating nearby fields. Delay pesticide and foliar fertilizer application until weather clears.",
        recommendation_te="గాలి వేగం ఎక్కువగా ఉండడం లేదా వర్ష సూచన ఉన్నందున పురుగుమందులు మరియు పోషకాల పిచికారీని తాత్కాలికంగా వాయిదా వేయండి. మందు వృధా కాకుండా ఆకాశం నిర్మలంగా ఉన్నప్పుడు పిచికారీ చేయండి.",
        alternative_en="If urgent spray is required due to severe pest attack, use sticking agent (spreader/sticker @ 0.5ml/L) only during calm morning hours.",
        alternative_te="తప్పనిసరిగా పిచికారీ చేయాల్సి వస్తే ఉదయం వేళల్లో మాత్రమే జిగురు మందు (స్టిక్కర్) కలిపి పిచికారీ చేయండి.",
        source_reference="ANGRAU Good Agricultural Practices",
        validity_hours=24
    ),

    # 11. FAVORABLE SPRAY WINDOW
    AdvisoryRule(
        rule_id="RULE_SPRAY_WINDOW_FAVORABLE",
        name="Favorable Window for Field Operations",
        crops=["ALL"],
        stages=["ALL"],
        severity="info",
        title_en="Weather Clear: Favorable Conditions for Field Spraying and Inter-cultivation",
        title_te="వాతావరణం అనుకూలం: పిచికారీ మరియు అంతర సాగు పనులకు సరైన సమయం",
        recommendation_en="Weather conditions are calm with light winds (<12 km/h) and no rain forecast. Ideal window for scheduled plant protection sprays, weeding, and nutrient applications.",
        recommendation_te="ఆకాశం నిర్మలంగా ఉండి, గాలి వేగం తక్కువగా ఉంది. పురుగుమందుల పిచికారీ, కలుపు తీత మరియు ఎరువులు వేయడానికి ఇది అనుకూలమైన సమయం.",
        alternative_en="Always conduct spraying in early morning (7:00 AM - 10:30 AM) or late afternoon (4:00 PM - 6:00 PM) to avoid pollinator harm.",
        alternative_te="తేనెటీగలకు హాని కలగకుండా ఎల్లప్పుడూ ఉదయం 7 నుండి 10:30 గంటలలోపు లేదా సాయంత్రం 4 గంటల తర్వాత మాత్రమే పిచికారీ చేయండి.",
        source_reference="ANGRAU Agromet Advisory Bulletin",
        validity_hours=24
    )
]


def get_rule_by_id(rule_id: str) -> Optional[AdvisoryRule]:
    """Find a rule by its ID."""
    for rule in ADVISORY_RULES:
        if rule.rule_id == rule_id:
            return rule
    return None
