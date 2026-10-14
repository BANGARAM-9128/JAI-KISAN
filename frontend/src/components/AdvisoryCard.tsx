import React from 'react';
import { Advisory } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { SeverityBadge } from './SeverityBadge';
import { ArrowRight, Calendar, Sprout, CheckCircle2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdvisoryCardProps {
  advisory: Advisory;
}

export const AdvisoryCard: React.FC<AdvisoryCardProps> = ({ advisory }) => {
  const { language, t } = useTranslation();

  const title = language === 'te' ? advisory.title_te : advisory.title;
  const summary = language === 'te' ? advisory.summary_te : advisory.summary;
  const cropName = language === 'te' ? advisory.crop_name_te || advisory.crop_name : advisory.crop_name;
  const weatherCond = language === 'te' ? advisory.weather_condition_te : advisory.weather_condition;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-card hover:shadow-card-hover transition-all p-5 space-y-4">
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SeverityBadge severity={advisory.severity} />

        <div className="flex items-center gap-2">
          {advisory.confidence_score && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{advisory.confidence_score}% {t('confidence')}</span>
            </span>
          )}

          {cropName && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-green-50 text-green-700 rounded-md border border-green-200">
              <Sprout className="w-3 h-3" />
              <span>{cropName}</span>
            </span>
          )}
        </div>
      </div>

      {/* Title & Summary */}
      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-2 leading-snug">
          {title}
        </h3>
        <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
          {summary}
        </p>
      </div>

      {/* Context info: Weather & Dates */}
      <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-xs text-stone-600 space-y-1.5">
        <div className="flex items-start gap-1.5">
          <span className="font-semibold text-stone-700 flex-shrink-0">
            {language === 'te' ? 'వాతావరణం:' : 'Trigger:'}
          </span>
          <span className="truncate">{weatherCond}</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {t('validUntil')}: {new Date(advisory.valid_to).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Footer link & Feedback status */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {advisory.user_feedback && (
            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'ఫీడ్‌బ్యాక్ ఇచ్చారు' : 'Reviewed'}</span>
            </span>
          )}
        </div>

        <Link
          to={`/advisories/${advisory.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 group"
        >
          <span>{t('viewAdvisoryDetails')}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};
