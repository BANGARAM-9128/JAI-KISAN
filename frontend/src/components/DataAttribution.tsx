import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Sparkles, Radio, CheckCircle2 } from 'lucide-react';

interface DataAttributionProps {
  source?: string;
  updatedAt?: string;
  isDemo?: boolean;
}

export const DataAttribution: React.FC<DataAttributionProps> = ({
  source = 'Open-Meteo Weather API',
  updatedAt,
  isDemo = false,
}) => {
  const { language, t } = useTranslation();

  const formattedTime = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : t('lastUpdatedNow');

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 text-xs text-stone-500 bg-stone-100/80 rounded-lg border border-stone-200">
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-stone-600">{source}</span>
        <span className="text-stone-300">•</span>
        <span>
          {t('updatedAt')}: {formattedTime}
        </span>
      </div>

      <div>
        {isDemo ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-medium">
            <Radio className="w-3 h-3 animate-pulse" />
            {t('demoMode')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 text-green-800 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            {t('liveData')}
          </span>
        )}
      </div>
    </div>
  );
};
