import React from 'react';
import { DailyForecast } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { CloudRain, Sun, CloudSun, Droplets, Wind } from 'lucide-react';

interface ForecastCardProps {
  day: DailyForecast;
  isToday?: boolean;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ day, isToday = false }) => {
  const { language } = useTranslation();

  const dayLabel = language === 'te' ? day.day_name_te : day.day_name;
  const conditionLabel = language === 'te' ? day.weather_text_te : day.weather_text;

  const getIcon = (code: number) => {
    if (code >= 51) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (code >= 1) return <CloudSun className="w-8 h-8 text-amber-500" />;
    return <Sun className="w-8 h-8 text-amber-500" />;
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
        isToday
          ? 'bg-green-50/60 border-green-300 ring-1 ring-green-400/30'
          : 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className={`text-base font-bold ${isToday ? 'text-green-900' : 'text-stone-800'}`}>
            {dayLabel}
          </span>
          <p className="text-xs text-stone-500">{day.date}</p>
        </div>
        <div className="p-1.5 bg-stone-50 rounded-lg">{getIcon(day.weather_code)}</div>
      </div>

      <p className="text-xs font-medium text-stone-600 my-2 truncate" title={conditionLabel}>
        {conditionLabel}
      </p>

      {/* High / Low Temp */}
      <div className="flex items-baseline justify-between pt-2 border-t border-stone-100">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-stone-900">{day.temp_max_c}°</span>
          <span className="text-sm font-medium text-stone-400">/ {day.temp_min_c}°</span>
        </div>

        {day.precipitation_probability_max > 0 && (
          <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            <Droplets className="w-3 h-3" />
            <span>{day.precipitation_probability_max}%</span>
          </div>
        )}
      </div>

      <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
        <span>🌧️ {day.precipitation_sum_mm} mm</span>
        <span className="flex items-center gap-0.5">
          <Wind className="w-3 h-3" />
          {day.wind_speed_max_kph} km/h
        </span>
      </div>
    </div>
  );
};
