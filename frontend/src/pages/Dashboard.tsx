import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { weatherApi } from '../services/weatherApi';
import { advisoryApi } from '../services/advisoryApi';
import { WeatherCard } from '../components/WeatherCard';
import { HourlyForecast } from '../components/HourlyForecast';
import { ForecastCard } from '../components/ForecastCard';
import { AdvisoryCard } from '../components/AdvisoryCard';
import { WeatherCardSkeleton, AdvisoryCardSkeleton } from '../components/LoadingSkeleton';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { SeverityBadge } from '../components/SeverityBadge';
import { 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  CloudSun, 
  Sprout, 
  Bot, 
  RefreshCw 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useTranslation();

  const lat = user?.location?.latitude || 17.9689;
  const lon = user?.location?.longitude || 79.5941;

  // Weather Query
  const {
    data: weatherData,
    isLoading: weatherLoading,
    isError: weatherIsError,
    error: weatherError,
    refetch: refetchWeather,
    isFetching: weatherFetching,
  } = useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: () => weatherApi.getWeather(lat, lon),
    staleTime: 5 * 60 * 1000,
  });

  // Advisories Query
  const {
    data: advisories = [],
    isLoading: advisoriesLoading,
    refetch: refetchAdvisories,
  } = useQuery({
    queryKey: ['advisories'],
    queryFn: () => advisoryApi.getAdvisories(),
  });

  const locationDisplay = user?.location
    ? `${user.location.village ? user.location.village + ', ' : ''}${user.location.district}`
    : weatherData?.location_name || 'Telangana, India';

  if (weatherLoading) {
    return (
      <div className="space-y-6">
        <WeatherCardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdvisoryCardSkeleton />
          <AdvisoryCardSkeleton />
        </div>
      </div>
    );
  }

  if (weatherIsError || !weatherData) {
    return (
      <ErrorDisplay
        title={t('error')}
        message={
          (weatherError as Error)?.message ||
          'Could not load weather information. Please check network connection.'
        }
        onRetry={() => {
          refetchWeather();
          refetchAdvisories();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome / Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900">
            {language === 'te'
              ? `నమస్తే, ${user?.full_name || 'రైతు సోదరా'}!`
              : `Welcome, ${user?.full_name || 'Farmer'}!`}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            {language === 'te'
              ? 'మీ ప్రాంతపు తాజా వాతావరణ సమాచారం & సలహాలు క్రింద చూడండి.'
              : 'Here is your localized agromet forecast and crop protection guidance.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/assistant"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 text-xs sm:text-sm font-bold border border-green-200 transition-colors"
          >
            <Bot className="w-4 h-4 text-green-600" />
            <span>{t('navAssistant')}</span>
          </Link>

          <Link
            to="/forecast"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition-colors"
          >
            <span>{t('navForecast')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Severe Weather Alerts Section (if any) */}
      {weatherData.alerts && weatherData.alerts.length > 0 && (
        <div className="space-y-3">
          {weatherData.alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-sm space-y-2 text-stone-900"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-200 text-amber-900 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-amber-950">
                    {language === 'te' ? alert.title_te : alert.title}
                  </h3>
                </div>
                <SeverityBadge severity={alert.severity} size="sm" />
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-9">
                {language === 'te' ? alert.description_te : alert.description}
              </p>

              <div className="ml-9 p-3 bg-white/80 rounded-xl border border-amber-200 text-xs sm:text-sm text-stone-800 font-medium">
                <span className="font-bold text-amber-900">
                  {language === 'te' ? 'రైతులకు సూచన: ' : 'Action: '}
                </span>
                <span>{language === 'te' ? alert.instruction_te : alert.instruction}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Weather Card */}
      <WeatherCard
        weather={weatherData.current}
        locationName={locationDisplay}
        source={weatherData.source}
        isDemo={weatherData.is_demo}
        onRefresh={() => {
          refetchWeather();
          refetchAdvisories();
        }}
        isRefreshing={weatherFetching}
      />

      {/* Hourly Forecast (Horizontal Scroll) */}
      {weatherData.hourly && weatherData.hourly.length > 0 && (
        <HourlyForecast hourly={weatherData.hourly} />
      )}

      {/* Active Advisories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 text-green-800 rounded-xl">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                {t('advisoriesTitle')}
              </h2>
              <p className="text-xs text-stone-500">
                {language === 'te'
                  ? 'ప్రస్తుత వాతావరణానికి అనుగుణంగా శాస్త్రీయ సిఫార్సులు'
                  : 'Actionable crop guidance tailored to current weather conditions'}
              </p>
            </div>
          </div>

          <Link
            to="/advisories"
            className="text-xs sm:text-sm font-bold text-green-700 hover:text-green-800 flex items-center gap-1 group"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {advisoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdvisoryCardSkeleton />
            <AdvisoryCardSkeleton />
          </div>
        ) : advisories.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-stone-200 text-center text-sm text-stone-500">
            {t('noAdvisoriesDesc')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisories.slice(0, 2).map((adv) => (
              <AdvisoryCard key={adv.id} advisory={adv} />
            ))}
          </div>
        )}
      </div>

      {/* 7-Day Extended Forecast Preview */}
      {weatherData.daily && weatherData.daily.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                {t('weeklyForecast')}
              </h2>
            </div>

            <Link
              to="/forecast"
              className="text-xs sm:text-sm font-bold text-green-700 hover:text-green-800 flex items-center gap-1 group"
            >
              <span>{t('forecastDetailTitle')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {weatherData.daily.map((day, idx) => (
              <ForecastCard key={day.date} day={day} isToday={idx === 0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
