import React from 'react';
import { CurrentWeather } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Compass, 
  CloudRain, 
  Sun, 
  Thermometer, 
  RefreshCw 
} from 'lucide-react';
import { DataAttribution } from './DataAttribution';

interface WeatherCardProps {
  weather: CurrentWeather;
  locationName: string;
  source?: string;
  isDemo?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  locationName,
  source,
  isDemo,
  onRefresh,
  isRefreshing = false,
}) => {
  const { language, t } = useTranslation();

  const weatherDesc = language === 'te' ? weather.weather_text_te : weather.weather_text;

  return (
    <div className="bg-gradient-to-br from-white to-stone-50 rounded-2xl border border-stone-200 shadow-card p-5 md:p-6 space-y-5">
      {/* Top Header: Location & Refresh */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
            {t('weatherOverview')}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-stone-900 mt-2 flex items-center gap-2">
            <span>{locationName}</span>
          </h2>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-stone-500 hover:text-green-700 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
            title={t('refresh')}
            aria-label={t('refresh')}
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-green-600' : ''}`} />
          </button>
        )}
      </div>

      {/* Main Temp & Condition */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 py-2 border-y border-stone-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-inner">
            {weather.weather_code >= 51 ? (
              <CloudRain className="w-10 h-10 md:w-12 md:h-12 text-blue-500" />
            ) : weather.weather_code >= 1 ? (
              <CloudSun className="w-10 h-10 md:w-12 md:h-12 text-amber-500" />
            ) : (
              <Sun className="w-10 h-10 md:w-12 md:h-12 text-amber-500" />
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight">
                {weather.temp_c}°
              </span>
              <span className="text-xl font-medium text-stone-500">C</span>
            </div>
            <p className="text-base md:text-lg font-semibold text-stone-700">
              {weatherDesc}
            </p>
          </div>
        </div>

        <div className="bg-stone-50 px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 flex items-center gap-2 self-stretch sm:self-auto justify-center">
          <Thermometer className="w-4 h-4 text-orange-500" />
          <span>{t('feelsLike')}:</span>
          <span className="font-bold text-stone-800">{weather.feels_like_c}°C</span>
        </div>
      </div>

      {/* 4 Metric Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">{t('humidity')}</p>
            <p className="text-base font-bold text-stone-800">{weather.humidity}%</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">{t('rainProbability')}</p>
            <p className="text-base font-bold text-stone-800">{weather.precipitation_probability}%</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">{t('windSpeed')}</p>
            <p className="text-base font-bold text-stone-800">{weather.wind_kph} km/h</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">{t('windDirection')}</p>
            <p className="text-base font-bold text-stone-800">{weather.wind_direction_cardinal} ({weather.wind_direction_deg}°)</p>
          </div>
        </div>
      </div>

      {/* Data Attribution Footer */}
      <DataAttribution
        source={source}
        updatedAt={weather.updated_at}
        isDemo={isDemo}
      />
    </div>
  );
};
