import axios from 'axios';
import { apiClient } from './api';
import { WeatherData, CurrentWeather, HourlyForecast, DailyForecast, WeatherAlert } from '../types';
import { mockWeatherData } from './mockData';

// Map WMO weather codes to English & Telugu descriptions
export const getWeatherCodeDescription = (code: number): { textEn: string; textTe: string } => {
  switch (code) {
    case 0:
      return { textEn: 'Clear Sky', textTe: 'నిర్మలమైన ఆకాశం' };
    case 1:
      return { textEn: 'Mainly Clear', textTe: 'ప్రధానంగా నిర్మలం' };
    case 2:
      return { textEn: 'Partly Cloudy', textTe: 'పాక్షికంగా మేఘావృతం' };
    case 3:
      return { textEn: 'Overcast', textTe: 'పూర్తిగా మేఘావృతం' };
    case 45:
    case 48:
      return { textEn: 'Fog / Mist', textTe: 'పొగమంచు' };
    case 51:
      return { textEn: 'Light Drizzle', textTe: 'తేలికపాటి చిరుజల్లులు' };
    case 53:
      return { textEn: 'Moderate Drizzle', textTe: 'చిరుజల్లులు' };
    case 55:
      return { textEn: 'Dense Drizzle', textTe: 'దట్టమైన చిరుజల్లులు' };
    case 61:
      return { textEn: 'Slight Rain', textTe: 'తేలికపాటి వర్షం' };
    case 63:
      return { textEn: 'Moderate Rain', textTe: 'మధ్యస్థ వర్షం' };
    case 65:
      return { textEn: 'Heavy Rain', textTe: 'భారీ వర్షం' };
    case 80:
    case 81:
    case 82:
      return { textEn: 'Rain Showers', textTe: 'వర్షపు జల్లులు' };
    case 95:
      return { textEn: 'Thunderstorm', textTe: 'ఉరుములతో కూడిన వర్షం' };
    case 96:
    case 99:
      return { textEn: 'Thunderstorm with Hail', textTe: 'వడగండ్ల వాన' };
    default:
      return { textEn: 'Fair Weather', textTe: 'అనుకూల వాతావరణం' };
  }
};

const getWindCardinal = (deg: number): string => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
  return dirs[index];
};

const daysMapTe = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'];
const daysMapEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatSunTime = (iso: string) => {
  if (!iso) return '--';
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return iso;
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const weatherApi = {
  async getWeather(lat: number = 15.48, lon: number = 78.48): Promise<WeatherData> {
    // 1. Try local FastAPI backend endpoint GET /weather?lat=...&lon=...
    try {
      const response = await apiClient.get('/weather', {
        params: { lat, lon },
      });
      const d = response.data;

      if (d && d.current && d.hourly && d.daily) {
        const currCode = d.current.weather_code ?? 0;
        const currDesc = getWeatherCodeDescription(currCode);

        const current: CurrentWeather = {
          temp_c: Math.round(d.current.temperature_2m ?? 28),
          feels_like_c: Math.round(d.current.apparent_temperature ?? d.current.temperature_2m ?? 30),
          humidity: Math.round(d.current.relative_humidity_2m ?? 70),
          wind_kph: Math.round(d.current.wind_speed_10m ?? 10),
          wind_direction_deg: d.current.wind_direction_10m ?? 90,
          wind_direction_cardinal: getWindCardinal(d.current.wind_direction_10m ?? 90),
          precipitation_mm: Number((d.current.precipitation ?? 0).toFixed(1)),
          precipitation_probability: d.hourly.precipitation_probability?.[0] ?? 0,
          uv_index: 6,
          weather_code: currCode,
          weather_text: currDesc.textEn,
          weather_text_te: currDesc.textTe,
          updated_at: d.retrieved_at || new Date().toISOString(),
        };

        const hourly: HourlyForecast[] = [];
        if (Array.isArray(d.hourly.time)) {
          for (let i = 0; i < Math.min(24, d.hourly.time.length); i += 3) {
            const timeStr = d.hourly.time[i];
            const dateObj = new Date(timeStr);
            const formattedTime = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
              : timeStr.slice(11, 16);

            hourly.push({
              time: formattedTime,
              temp_c: Math.round(d.hourly.temperature_2m?.[i] ?? 25),
              humidity: Math.round(d.hourly.relative_humidity_2m?.[i] ?? 70),
              precipitation_mm: Number((d.hourly.precipitation?.[i] ?? 0).toFixed(1)),
              precipitation_probability: d.hourly.precipitation_probability?.[i] ?? 0,
              wind_kph: Math.round(d.hourly.wind_speed_10m?.[i] ?? 10),
              weather_code: currCode,
            });
          }
        }

        const daily: DailyForecast[] = [];
        if (Array.isArray(d.daily.time)) {
          for (let i = 0; i < d.daily.time.length; i++) {
            const dateStr = d.daily.time[i];
            const dateObj = new Date(dateStr);
            const dayIdx = !isNaN(dateObj.getTime()) ? dateObj.getDay() : i % 7;
            const isToday = i === 0;
            const isTomorrow = i === 1;

            const code = currCode;
            const desc = getWeatherCodeDescription(code);

            daily.push({
              date: dateStr,
              day_name: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : daysMapEn[dayIdx],
              day_name_te: isToday ? 'ఈ రోజు' : isTomorrow ? 'రేపు' : daysMapTe[dayIdx],
              temp_max_c: Math.round(d.daily.temperature_2m_max?.[i] ?? 32),
              temp_min_c: Math.round(d.daily.temperature_2m_min?.[i] ?? 22),
              precipitation_sum_mm: Number((d.daily.precipitation_sum?.[i] ?? 0).toFixed(1)),
              precipitation_probability_max: d.daily.precipitation_probability_max?.[i] ?? 0,
              wind_speed_max_kph: Math.round(d.daily.wind_speed_10m_max?.[i] ?? 12),
              weather_code: code,
              weather_text: desc.textEn,
              weather_text_te: desc.textTe,
              sunrise: formatSunTime(d.daily.sunrise?.[i]),
              sunset: formatSunTime(d.daily.sunset?.[i]),
            });
          }
        }

        // Fetch active alerts from backend
        let alerts: WeatherAlert[] = [];
        try {
          alerts = await weatherApi.getAlerts(lat, lon);
        } catch {}

        return {
          current,
          hourly,
          daily,
          alerts,
          location_name: `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`,
          location_name_te: `అక్షాంశం: ${lat.toFixed(2)}, రేఖాంశం: ${lon.toFixed(2)}`,
          latitude: lat,
          longitude: lon,
          is_demo: false,
          source: `${d.attribution || 'Open-Meteo.com'} (${d.is_cached ? 'Cached' : 'Fresh'})`,
        };
      }
    } catch (backendErr) {
      console.warn('Backend weather endpoint unavailable, falling back to direct Open-Meteo API:', backendErr);
    }

    // 2. Direct Open-Meteo live API fallback
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=auto&forecast_days=7`;

      const openMeteoRes = await axios.get(url, { timeout: 6000 });
      const d = openMeteoRes.data;

      const currentCode = d.current?.weather_code ?? 0;
      const currentDesc = getWeatherCodeDescription(currentCode);

      const current: CurrentWeather = {
        temp_c: Math.round(d.current?.temperature_2m ?? 28),
        feels_like_c: Math.round(d.current?.apparent_temperature ?? 30),
        humidity: Math.round(d.current?.relative_humidity_2m ?? 70),
        wind_kph: Math.round(d.current?.wind_speed_10m ?? 10),
        wind_direction_deg: d.current?.wind_direction_10m ?? 90,
        wind_direction_cardinal: getWindCardinal(d.current?.wind_direction_10m ?? 90),
        precipitation_mm: d.current?.precipitation ?? 0,
        precipitation_probability: d.hourly?.precipitation_probability?.[0] ?? 0,
        uv_index: 6,
        weather_code: currentCode,
        weather_text: currentDesc.textEn,
        weather_text_te: currentDesc.textTe,
        updated_at: new Date().toISOString(),
      };

      const hourly: HourlyForecast[] = [];
      if (d.hourly?.time) {
        for (let i = 0; i < Math.min(24, d.hourly.time.length); i += 3) {
          const timeStr = d.hourly.time[i];
          const dateObj = new Date(timeStr);
          const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          hourly.push({
            time: formattedTime,
            temp_c: Math.round(d.hourly.temperature_2m[i]),
            humidity: Math.round(d.hourly.relative_humidity_2m[i]),
            precipitation_mm: Number(d.hourly.precipitation[i].toFixed(1)),
            precipitation_probability: d.hourly.precipitation_probability[i] ?? 0,
            wind_kph: Math.round(d.hourly.wind_speed_10m[i]),
            weather_code: d.hourly.weather_code[i],
          });
        }
      }

      const daily: DailyForecast[] = [];
      if (d.daily?.time) {
        for (let i = 0; i < d.daily.time.length; i++) {
          const dateStr = d.daily.time[i];
          const dateObj = new Date(dateStr);
          const dayIdx = dateObj.getDay();
          const isToday = i === 0;
          const isTomorrow = i === 1;

          const code = d.daily.weather_code[i];
          const desc = getWeatherCodeDescription(code);

          daily.push({
            date: dateStr,
            day_name: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : daysMapEn[dayIdx],
            day_name_te: isToday ? 'ఈ రోజు' : isTomorrow ? 'రేపు' : daysMapTe[dayIdx],
            temp_max_c: Math.round(d.daily.temperature_2m_max[i]),
            temp_min_c: Math.round(d.daily.temperature_2m_min[i]),
            precipitation_sum_mm: Number(d.daily.precipitation_sum[i].toFixed(1)),
            precipitation_probability_max: d.daily.precipitation_probability_max[i] ?? 0,
            wind_speed_max_kph: Math.round(d.daily.wind_speed_10m_max[i]),
            weather_code: code,
            weather_text: desc.textEn,
            weather_text_te: desc.textTe,
            sunrise: formatSunTime(d.daily.sunrise?.[i]),
            sunset: formatSunTime(d.daily.sunset?.[i]),
          });
        }
      }

      const alerts: WeatherAlert[] = [];
      const maxRainDay = daily.find((day) => day.precipitation_sum_mm >= 12);
      if (maxRainDay) {
        alerts.push({
          id: 'openmeteo_alert_rain',
          severity: maxRainDay.precipitation_sum_mm > 20 ? 'high' : 'moderate',
          title: `Rain Alert: ${maxRainDay.precipitation_sum_mm}mm expected on ${maxRainDay.day_name}`,
          title_te: `వర్ష హెచ్చరిక: ${maxRainDay.day_name_te} రోజున ${maxRainDay.precipitation_sum_mm} మి.మీ వర్షం అవకాశం`,
          description: `Weather models predict elevated rainfall of ${maxRainDay.precipitation_sum_mm} mm with wind speeds up to ${maxRainDay.wind_speed_max_kph} km/h.`,
          description_te: `వాతావరణ అంచనాల ప్రకారం ${maxRainDay.precipitation_sum_mm} మి.మీ వర్షపాతం మరియు గాలి వేగం ${maxRainDay.wind_speed_max_kph} కి.మీ/గం నమోదయ్యే అవకాశం ఉంది.`,
          starts_at: maxRainDay.date,
          ends_at: maxRainDay.date,
          instruction: 'Delay foliar chemical sprays and prepare farm drainage outlets.',
          instruction_te: 'మందుల పిచికారీని వాయిదా వేయండి మరియు పొలంలో మురుగు కాలువలు సిద్ధం చేసుకోండి.',
        });
      }

      return {
        current,
        hourly,
        daily,
        alerts,
        location_name: `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`,
        location_name_te: `అక్షాంశం: ${lat.toFixed(2)}, రేఖాంశం: ${lon.toFixed(2)}`,
        latitude: lat,
        longitude: lon,
        is_demo: false,
        source: 'Open-Meteo Global Forecasting Model (Live)',
      };
    } catch (openMeteoError) {
      console.warn('Open-Meteo API unavailable, falling back to mock weather data:', openMeteoError);
      return {
        ...mockWeatherData,
        is_demo: true,
        source: 'Simulated Historical Meteorological Profile (Demo Mode)',
      };
    }
  },

  async getAlerts(lat: number = 15.48, lon: number = 78.48): Promise<WeatherAlert[]> {
    try {
      const response = await apiClient.get<any[]>('/weather/alerts', {
        params: { lat, lon },
      });
      if (Array.isArray(response.data)) {
        return response.data.map((a: any) => ({
          id: a.id || 'alert_' + Math.random(),
          severity: a.severity || 'moderate',
          title: a.title,
          title_te: a.headline || a.title,
          description: a.description,
          description_te: a.description,
          starts_at: a.effective_from || new Date().toISOString(),
          ends_at: a.effective_to || new Date().toISOString(),
          instruction: a.instruction || 'Follow precautionary measures',
          instruction_te: a.instruction || 'ముందస్తు జాగ్రత్తలు పాటించండి',
        }));
      }
      return mockWeatherData.alerts;
    } catch {
      return mockWeatherData.alerts;
    }
  },
};
