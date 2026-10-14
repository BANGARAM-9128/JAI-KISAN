import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advisoryApi } from '../services/advisoryApi';
import { useTranslation } from '../contexts/LanguageContext';
import { SeverityBadge } from '../components/SeverityBadge';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { 
  ArrowLeft, 
  Calendar, 
  Sprout, 
  CloudSun, 
  CheckCircle2, 
  Award, 
  FileCheck2, 
  ThumbsUp, 
  ThumbsDown, 
  Leaf, 
  BookOpen, 
  Send 
} from 'lucide-react';

export const AdvisoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();

  const [feedbackHelpful, setFeedbackHelpful] = useState<boolean | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const {
    data: advisory,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['advisory', id],
    queryFn: () => advisoryApi.getAdvisory(id || ''),
    enabled: Boolean(id),
  });

  const feedbackMutation = useMutation({
    mutationFn: (vars: { helpful: boolean; comment?: string }) =>
      advisoryApi.saveAdvisoryFeedback(id!, vars.helpful, vars.comment),
    onSuccess: (updatedAdv) => {
      setFeedbackSubmitted(true);
      queryClient.setQueryData(['advisory', id], updatedAdv);
      queryClient.invalidateQueries({ queryKey: ['advisories'] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-stone-200 rounded w-1/4"></div>
        <div className="h-64 bg-white rounded-3xl border border-stone-200"></div>
      </div>
    );
  }

  if (isError || !advisory) {
    return (
      <ErrorDisplay
        title={t('error')}
        message={(error as Error)?.message || 'Advisory not found.'}
      />
    );
  }

  const title = language === 'te' ? advisory.title_te : advisory.title;
  const summary = language === 'te' ? advisory.summary_te : advisory.summary;
  const crop = language === 'te' ? advisory.crop_name_te || advisory.crop_name : advisory.crop_name;
  const weatherCond = language === 'te' ? advisory.weather_condition_te : advisory.weather_condition;
  const recommendation = language === 'te' ? advisory.recommendation_te : advisory.recommendation;
  const altAction = language === 'te' ? advisory.alternative_action_te : advisory.alternative_action;
  const rationale = language === 'te' ? advisory.scientific_rationale_te : advisory.scientific_rationale;

  const handleSendFeedback = (helpful: boolean) => {
    setFeedbackHelpful(helpful);
    feedbackMutation.mutate({ helpful, comment: feedbackComment });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      {/* Back Link */}
      <Link
        to="/advisories"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-600 hover:text-green-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('advisoriesTitle')}</span>
      </Link>

      {/* Main Advisory Container */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <SeverityBadge severity={advisory.severity} size="lg" />

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
              <Award className="w-4 h-4 text-amber-600" />
              <span>{advisory.confidence_score}% {t('confidence')}</span>
            </span>

            {crop && (
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold px-2.5 py-1 bg-green-50 text-green-800 rounded-lg border border-green-200">
                <Sprout className="w-4 h-4 text-green-600" />
                <span>{crop}</span>
              </span>
            )}
          </div>
        </div>

        {/* Title & Summary */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
            {title}
          </h1>
          <p className="text-base text-stone-600 leading-relaxed font-medium">
            {summary}
          </p>
        </div>

        {/* Weather Trigger Banner */}
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-start gap-3">
          <div className="p-2 bg-sky-100 text-sky-700 rounded-xl flex-shrink-0">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
              {language === 'te' ? 'వాతావరణ ప్రేరకం (Trigger)' : 'Triggering Weather Event'}
            </span>
            <p className="text-sm font-semibold text-stone-800 mt-0.5">
              {weatherCond}
            </p>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {t('validUntil')}: {new Date(advisory.valid_to).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </p>
          </div>
        </div>

        {/* Recommended Action Box */}
        <div className="p-5 rounded-2xl bg-green-50/70 border border-green-200 space-y-2">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-base sm:text-lg">
              {t('recommendedAction')}
            </h3>
          </div>
          <p className="text-sm sm:text-base text-stone-800 leading-relaxed pl-7">
            {recommendation}
          </p>
        </div>

        {/* Alternative / Organic Action */}
        {altAction && (
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900">
              <Leaf className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-base sm:text-lg">
                {t('alternativeAction')}
              </h3>
            </div>
            <p className="text-sm sm:text-base text-stone-800 leading-relaxed pl-7">
              {altAction}
            </p>
          </div>
        )}

        {/* Scientific Rationale */}
        {rationale && (
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 text-stone-800">
              <BookOpen className="w-5 h-5 text-stone-600" />
              <h3 className="font-bold text-base sm:text-lg">
                {t('scientificRationale')}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pl-7">
              {rationale}
            </p>
          </div>
        )}

        {/* Source Reference Attribution */}
        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 gap-2">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-green-600" />
            <span>
              <strong>{t('sourceOrg')}:</strong> {advisory.source_organization}
            </span>
          </div>
          <span className="italic">{advisory.source_reference}</span>
        </div>
      </div>

      {/* Farmer Feedback Section */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
          <span>{t('wasAdvisoryHelpful')}</span>
        </h3>

        {feedbackSubmitted || advisory.user_feedback ? (
          <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-sm text-green-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span>{t('feedbackThankYou')}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSendFeedback(true)}
                disabled={feedbackMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-green-300 bg-green-50 hover:bg-green-100 text-green-800 font-bold text-sm transition-colors"
              >
                <ThumbsUp className="w-4 h-4 text-green-600" />
                <span>{t('yesHelpful')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendFeedback(false)}
                disabled={feedbackMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold text-sm transition-colors"
              >
                <ThumbsDown className="w-4 h-4 text-stone-500" />
                <span>{t('noNotHelpful')}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder={t('commentsPlaceholder')}
                className="flex-1 px-4 py-2 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-stone-800"
              />
              <button
                type="button"
                onClick={() => handleSendFeedback(true)}
                disabled={feedbackMutation.isPending}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{t('submit')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
