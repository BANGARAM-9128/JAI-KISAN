import React from 'react';
import { HourlyForecast as HourlyType } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { CloudRain, Sun, CloudSun, Clock } from 'lucide-react';

interface HourlyForecastProps {
  hourly: HourlyType[];
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly }) => {
  const { t } = useTranslation();

  const getIcon = (code: number) => {
    if (code >= 51) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (code >= 1) return <CloudSun className="w-6 h-6 text-amber-500" />;
    return <Sun className="w-6 h-6 text-amber-500" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5 space-y-4">
      <div className="flex items-center gap-2 text-stone-800">
        <Clock className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-bold">{t('hourlyForecast')}</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 custom-scrollbar">
        {hourly.map((item, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 flex flex-col items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 min-w-[90px] transition-colors text-center"
          >
            <span className="text-xs font-semibold text-stone-600">{item.time}</span>
            <div className="my-2">{getIcon(item.weather_code)}</div>
            <span className="text-base font-bold text-stone-900">{item.temp_c}°</span>
            {item.precipitation_probability > 0 ? (
              <span className="text-xs font-medium text-blue-600 mt-1">
                💧 {item.precipitation_probability}%
              </span>
            ) : (
              <span className="text-xs text-stone-400 mt-1">0%</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
