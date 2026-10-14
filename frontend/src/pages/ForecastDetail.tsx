import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { weatherApi } from '../services/weatherApi';
import { ChartSkeleton } from '../components/LoadingSkeleton';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  Thermometer, 
  CloudRain, 
  Droplets, 
  Wind, 
  Sunrise, 
  Sunset,
  ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ForecastDetail: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useTranslation();

  const lat = user?.location?.latitude || 17.9689;
  const lon = user?.location?.longitude || 79.5941;

  const {
    data: weatherData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: () => weatherApi.getWeather(lat, lon),
  });

  const [activeTab, setActiveTab] = useState<'temp' | 'rain' | 'humidity' | 'wind'>('temp');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (isError || !weatherData) {
    return (
      <ErrorDisplay
        title={t('error')}
        message={(error as Error)?.message || 'Could not load forecast data.'}
        onRetry={() => refetch()}
      />
    );
  }

  const dailyData = weatherData.daily.map((d) => ({
    name: language === 'te' ? d.day_name_te : d.day_name,
    date: d.date.split('-').slice(1).join('/'),
    maxTemp: d.temp_max_c,
    minTemp: d.temp_min_c,
    rainMm: d.precipitation_sum_mm,
    rainProb: d.precipitation_probability_max,
    wind: d.wind_speed_max_kph,
    sunrise: d.sunrise,
    sunset: d.sunset,
    condition: language === 'te' ? d.weather_text_te : d.weather_text,
  }));

  const hourlyData = weatherData.hourly.map((h) => ({
    time: h.time,
    temp: h.temp_c,
    rainMm: h.precipitation_mm,
    humidity: h.humidity,
    wind: h.wind_kph,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
              title={t('back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
              {t('forecastDetailTitle')}
            </h1>
          </div>
          <p className="text-sm text-stone-500 pl-8">
            {t('forecastDetailSubtitle')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('temp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'temp'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Thermometer className="w-4 h-4" />
          <span>{t('temperature')}</span>
        </button>

        <button
          onClick={() => setActiveTab('rain')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'rain'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <CloudRain className="w-4 h-4" />
          <span>{t('precipitation')}</span>
        </button>

        <button
          onClick={() => setActiveTab('humidity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'humidity'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>{t('humidity')}</span>
        </button>

        <button
          onClick={() => setActiveTab('wind')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'wind'
              ? 'bg-stone-700 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>{t('windSpeed')}</span>
        </button>
      </div>

      {/* Primary Chart Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-card p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">
            {activeTab === 'temp' && t('tempTrend')}
            {activeTab === 'rain' && t('rainfallChart')}
            {activeTab === 'humidity' && t('humidityTrend')}
            {activeTab === 'wind' && t('windTrend')}
          </h2>
          <span className="text-xs text-stone-400">7-Day Trend</span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'temp' ? (
              <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis unit="°C" domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `${value}°C`,
                    name === 'maxTemp' ? t('maxTemp') : t('minTemp'),
                  ]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="maxTemp"
                  name={t('maxTemp')}
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#ef4444' }}
                />
                <Line
                  type="monotone"
                  dataKey="minTemp"
                  name={t('minTemp')}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3b82f6' }}
                />
              </LineChart>
            ) : activeTab === 'rain' ? (
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis unit="mm" tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} mm`, t('precipitation')]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5' }}
                />
                <Legend />
                <Bar dataKey="rainMm" name={t('precipitation')} fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : activeTab === 'humidity' ? (
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, t('humidity')]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  name={t('humidity')}
                  stroke="#0d9488"
                  fill="#ccfbf1"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis unit="km/h" tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} km/h`, t('windSpeed')]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="wind"
                  name={t('windSpeed')}
                  stroke="#475569"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#475569' }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sun & Detailed Days Overview Table/Grid */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-card p-5 md:p-6 space-y-4">
        <h2 className="text-lg font-bold text-stone-900">
          {language === 'te' ? 'సూర్యోదయం & రోజువారీ ముఖ్యాంశాలు' : 'Sunrise, Sunset & Daily Highlights'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {dailyData.map((d, i) => (
            <div key={i} className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">{d.name}</span>
                <span className="text-xs text-stone-400">{d.date}</span>
              </div>
              <p className="text-xs text-stone-600 font-medium">{d.condition}</p>

              <div className="text-xs space-y-1 pt-1 border-t border-stone-200 text-stone-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('sunrise')}:</span>
                  </span>
                  <span className="font-semibold text-stone-700">{d.sunrise}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sunset className="w-3.5 h-3.5 text-orange-500" />
                    <span>{t('sunset')}:</span>
                  </span>
                  <span className="font-semibold text-stone-700">{d.sunset}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
