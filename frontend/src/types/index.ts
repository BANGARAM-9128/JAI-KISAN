export type Language = 'en' | 'te';

export type UserRole = 'farmer' | 'admin' | 'expert';

export interface LocationInfo {
  latitude: number;
  longitude: number;
  village?: string;
  mandal?: string;
  district: string;
  state: string;
  pincode?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  language: Language;
  location: LocationInfo;
  irrigation_type?: 'drip' | 'sprinkler' | 'canal' | 'borewell' | 'rainfed';
  soil_type?: 'red' | 'black' | 'alluvial' | 'sandy' | 'clay';
  farm_size_acres?: number;
  is_onboarded: boolean;
  created_at?: string;
}

export type GrowthStage = 
  | 'sowing' 
  | 'vegetative' 
  | 'flowering' 
  | 'fruiting' 
  | 'harvesting' 
  | 'post_harvest';

export interface Crop {
  id: string;
  user_id?: string;
  name: string;
  name_te: string;
  variety?: string;
  sowing_date: string;
  growth_stage: GrowthStage;
  field_area_acres?: number;
  fieldArea_acres?: number;
  irrigation_type?: string;
  soil_type?: string;
  notes?: string;
  created_at?: string;
}

export interface CurrentWeather {
  temp_c: number;
  feels_like_c: number;
  humidity: number;
  wind_kph: number;
  wind_direction_deg: number;
  wind_direction_cardinal: string;
  precipitation_mm: number;
  precipitation_probability: number;
  uv_index: number;
  weather_code: number;
  weather_text: string;
  weather_text_te: string;
  updated_at: string;
}

export interface HourlyForecast {
  time: string;
  temp_c: number;
  humidity: number;
  precipitation_mm: number;
  precipitation_probability: number;
  wind_kph: number;
  weather_code: number;
}

export interface DailyForecast {
  date: string;
  day_name: string;
  day_name_te: string;
  temp_max_c: number;
  temp_min_c: number;
  precipitation_sum_mm: number;
  precipitation_probability_max: number;
  wind_speed_max_kph: number;
  weather_code: number;
  weather_text: string;
  weather_text_te: string;
  sunrise: string;
  sunset: string;
}

export type AlertSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface WeatherAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  title_te: string;
  description: string;
  description_te: string;
  starts_at: string;
  ends_at: string;
  instruction: string;
  instruction_te: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
  location_name: string;
  location_name_te: string;
  latitude: number;
  longitude: number;
  is_demo?: boolean;
  source: string;
}

export type AdvisorySeverity = 'low' | 'medium' | 'high' | 'critical';
export type AdvisoryCategory = 'irrigation' | 'pest_disease' | 'fertilizer' | 'harvest' | 'general';

export interface AdvisoryFeedback {
  is_helpful?: boolean;
  comment?: string;
  submitted_at?: string;
}

export interface Advisory {
  id: string;
  title: string;
  title_te: string;
  summary: string;
  summary_te: string;
  severity: AdvisorySeverity;
  category: AdvisoryCategory;
  crop_id?: string;
  crop_name?: string;
  crop_name_te?: string;
  growth_stage?: GrowthStage;
  valid_from: string;
  valid_to: string;
  weather_condition: string;
  weather_condition_te: string;
  recommendation: string;
  recommendation_te: string;
  alternative_action: string;
  alternative_action_te: string;
  scientific_rationale: string;
  scientific_rationale_te: string;
  source_reference: string;
  source_organization: string;
  confidence_score: number;
  user_feedback?: AdvisoryFeedback;
}

export type NotificationSeverity = 'info' | 'warning' | 'alert' | 'critical';

export interface NotificationItem {
  id: string;
  title: string;
  title_te: string;
  message: string;
  message_te: string;
  severity: NotificationSeverity;
  category: string;
  created_at: string;
  is_read: boolean;
  link?: string;
}

export interface FeedbackSubmission {
  id?: string;
  advisory_id?: string;
  rating: number; // 1 to 5
  is_helpful: boolean;
  was_action_taken: boolean;
  outcome?: string;
  comments?: string;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: {
    title: string;
    source_org?: string;
    url?: string;
  }[];
  is_demo?: boolean;
}

export interface AdminStats {
  total_users: number;
  active_farmers: number;
  advisories_generated: number;
  feedback_count: number;
  positive_feedback_rate: number;
  weather_queries_today: number;
  system_health: {
    weather_api: 'healthy' | 'degraded' | 'down';
    llm_service: 'healthy' | 'degraded' | 'demo_mode' | 'down';
    database: 'healthy' | 'degraded' | 'down';
  };
  advisory_rules_count: number;
  knowledge_base_documents: number;
}
