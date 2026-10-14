# Jai Kisan — API Integrations Guide

## 1. Open-Meteo (Weather Data) — ✅ Active

### Overview
- **Provider**: Open-Meteo (open-source)
- **Base URL**: `https://api.open-meteo.com/v1/forecast`
- **Authentication**: None required (free tier)
- **Rate Limits**: Fair use policy; no strict limit for non-commercial use
- **Documentation**: https://open-meteo.com/en/docs

### Parameters Used
```
latitude, longitude — Location coordinates
hourly — temperature_2m, relative_humidity_2m, precipitation_probability,
         precipitation, wind_speed_10m, wind_direction_10m, apparent_temperature,
         weather_code
daily  — temperature_2m_max, temperature_2m_min, precipitation_sum,
         precipitation_probability_max, wind_speed_10m_max, sunrise, sunset,
         weather_code
current — temperature_2m, relative_humidity_2m, precipitation, wind_speed_10m,
          wind_direction_10m, apparent_temperature, weather_code
timezone — auto
forecast_days — 7
```

### Example Request
```
GET https://api.open-meteo.com/v1/forecast?latitude=15.83&longitude=78.05&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,apparent_temperature,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,weather_code&timezone=auto&forecast_days=7
```

### Integration Notes
- Cache responses for 30 minutes (configurable)
- Always display "Data from Open-Meteo" attribution
- Handle HTTP errors, timeouts (10s), and malformed responses
- Store `retrieved_at` timestamp with all cached data

---

## 2. IMD (Weather Warnings) — 🔶 Interface Only

### Overview
- **Provider**: India Meteorological Department
- **Status**: Provider adapter interface created; no live integration
- **Reason**: IMD does not offer a documented public REST API for automated access
- **Future**: May integrate via web scraping, partnership, or data sharing agreement

### Required for Integration
1. Identify available IMD data access channels (API, FTP, data portal)
2. Register for access if required
3. Implement parser for IMD warning format
4. Configure polling interval

---

## 3. LLM Provider (AI Assistant) — 🔶 Demo Mode

### Overview
- **Status**: Provider-neutral adapter created
- **Demo mode**: Returns pre-written responses with agricultural guidance
- **Supported providers** (when configured):
  - Google Gemini (set `LLM_PROVIDER=gemini`, `LLM_API_KEY=...`)
  - OpenAI (set `LLM_PROVIDER=openai`, `LLM_API_KEY=...`)

### Configuration
```env
LLM_PROVIDER=demo          # demo | gemini | openai
LLM_API_KEY=               # Required for non-demo providers
LLM_MODEL=gemini-pro       # Model name
```

### Integration Design
- System prompt includes farmer context (crop, location, weather)
- Retrieved knowledge documents injected as context
- Response includes `[Source: ...]` citations
- Demo mode clearly labeled in UI

---

## 4. Firebase Cloud Messaging — 🔶 Interface Only

### Overview
- **Status**: Adapter interface created; not configured
- **Reason**: Requires Firebase project setup and credentials

### Required for Integration
1. Create Firebase project
2. Download service account credentials
3. Set `FIREBASE_CREDENTIALS_PATH` in `.env`
4. Configure frontend with Firebase config
5. Request notification permission from users

---

## 5. Bhashini (Voice/Translation) — 🔶 Interface Only

### Overview
- **Provider**: Bhashini (Government of India NLP platform)
- **Status**: Interface only; browser Web Speech API used as fallback
- **Documentation**: https://bhashini.gov.in/ulca

### Required for Integration
1. Register on Bhashini/ULCA platform
2. Obtain API key and pipeline IDs
3. Configure ASR (speech-to-text) for Telugu
4. Configure TTS (text-to-speech) for Telugu
5. Set credentials in `.env`

### Current Fallback
- **Speech-to-Text**: Browser Web Speech API (Chrome-supported)
- **Text-to-Speech**: Browser SpeechSynthesis API
- Both work offline for English; Telugu support depends on browser/device

---

## Adding a New Provider

1. Create adapter class in `backend/app/providers/`
2. Implement the provider interface (fetch, validate, transform)
3. Add configuration to `app/core/config.py`
4. Add environment variables to `.env.example`
5. Document in this file
6. Add mocked tests for success and failure cases
