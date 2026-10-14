# Jai Kisan — Agricultural Sources Documentation

## Primary Sources

### 1. Indian Council of Agricultural Research (ICAR)
- **Organization**: ICAR, New Delhi
- **Website**: https://icar.org.in
- **Content used**: Crop-specific package of practices, growth stage descriptions, irrigation guidelines
- **Status**: Referenced for rule definitions; documents not automatically ingested
- **Limitations**: Publications may require manual download; not all available digitally

### 2. Acharya N.G. Ranga Agricultural University (ANGRAU)
- **Organization**: ANGRAU, Andhra Pradesh
- **Website**: https://www.angrau.ac.in
- **Content used**: AP-specific crop calendars, variety recommendations, pest/disease guidance
- **Status**: Referenced for Andhra Pradesh-specific rules
- **Limitations**: Website content changes; PDFs may not be machine-readable

### 3. Krishi Vigyan Kendras (KVKs) — Andhra Pradesh
- **Organization**: Various KVKs under ICAR
- **Content used**: Local advisory bulletins, seasonal recommendations
- **Status**: Referenced for localized guidance
- **Limitations**: Advisories are periodic; real-time integration not available

### 4. India Meteorological Department (IMD)
- **Organization**: IMD, Ministry of Earth Sciences
- **Website**: https://mausam.imd.gov.in
- **Content used**: Weather warnings, district-level forecasts
- **Status**: Integration interface designed; direct API access may require registration
- **Limitations**: IMD does not provide a public REST API for all data; some data requires scraping or partnership agreements

### 5. Open-Meteo
- **Organization**: Open-Meteo (open-source weather API)
- **Website**: https://open-meteo.com
- **API Documentation**: https://open-meteo.com/en/docs
- **Content used**: Hourly and daily weather forecasts, current conditions
- **Status**: ✅ Actively integrated — primary weather data source
- **Terms**: Free for non-commercial use; attribution required
- **Data sources**: ECMWF, GFS, and other NWP models
- **Limitations**: Forecast data only (not official IMD observations); no official Indian weather warnings

## Crop Knowledge Base

### Supported Crops (Initial)

| Crop | Telugu | Scientific Name | AP Seasons |
|------|--------|----------------|------------|
| Rice (Paddy) | వరి | Oryza sativa | Kharif (Jun-Oct), Rabi (Nov-Mar) |
| Cotton | పత్తి | Gossypium spp. | Kharif (Jun-Nov) |
| Maize | మొక్కజొన్న | Zea mays | Kharif, Rabi |
| Groundnut | వేరుశనగ | Arachis hypogaea | Kharif, Rabi |
| Chilli | మిర్చి | Capsicum annuum | Kharif, Rabi |
| Bengal Gram | శనగ | Cicer arietinum | Rabi (Oct-Feb) |

### Growth Stages Used

Each crop uses a simplified growth-stage model:
1. **Land Preparation** — Pre-sowing field work
2. **Sowing/Transplanting** — Seed placement or transplant
3. **Vegetative** — Active growth phase
4. **Flowering** — Reproductive phase
5. **Grain/Fruit Development** — Pod/grain filling
6. **Maturity** — Ready for harvest
7. **Harvesting** — Active harvest period

### Agricultural Rules Sources

| Rule Category | Source Reference | Notes |
|---------------|-----------------|-------|
| Heavy rainfall thresholds | IMD classification system | >64.5mm/day = very heavy; >115.5mm = extremely heavy |
| Spray wind limits | General agricultural practice | Spraying not recommended when wind >15 km/h |
| Rice water requirements | ICAR Package of Practices | Varies by growth stage |
| Disease risk conditions | ANGRAU crop protection guides | Temperature + humidity thresholds |
| Harvest weather windows | General agricultural practice | Dry conditions preferred |
| Frost/cold stress | ICAR recommendations | Crop-specific temperature thresholds |

> **Important**: All agricultural rules in this system represent general guidance compiled from published sources. They are NOT site-specific prescriptions. Farmers should consult local KVK officers or agricultural extension workers for recommendations tailored to their specific conditions.

## Data Freshness Policy

| Data Type | Maximum Age | Action When Stale |
|-----------|-------------|-------------------|
| Current weather | 1 hour | Refetch; show last-updated warning |
| Hourly forecast | 3 hours | Refetch; show stale warning |
| Daily forecast | 6 hours | Refetch; show stale warning |
| Weather warnings | 1 hour | Refetch; mark uncertain |
| Advisories | Based on rule's time window | Mark as expired |
| Knowledge documents | Manual review cycle | Show review date |

## Disclaimer

Jai Kisan provides weather-informed agricultural decision support, not definitive prescriptions. The system:

1. Uses weather forecasts, which are inherently uncertain
2. Applies general agricultural rules, not field-specific assessments
3. Does not replace expert agronomic consultation
4. Cannot verify local soil, water, or pest conditions
5. Should be used as one input among many in farming decisions

For chemical application (pesticides, fungicides, herbicides), always follow the product label and consult authorized dealers or agricultural extension officers.
