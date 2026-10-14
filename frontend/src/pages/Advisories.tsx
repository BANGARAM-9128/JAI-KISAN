import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../contexts/LanguageContext';
import { advisoryApi } from '../services/advisoryApi';
import { AdvisoryCard } from '../components/AdvisoryCard';
import { AdvisoryCardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { AdvisorySeverity } from '../types';
import { 
  Sprout, 
  RefreshCw, 
  Filter, 
  Sparkles, 
  SlidersHorizontal 
} from 'lucide-react';

export const Advisories: React.FC = () => {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('all');

  const {
    data: advisories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['advisories'],
    queryFn: () => advisoryApi.getAdvisories(),
  });

  const generateMutation = useMutation({
    mutationFn: () => advisoryApi.generateAdvisories(),
    onSuccess: (data) => {
      queryClient.setQueryData(['advisories'], data);
    },
  });

  // Unique crops in the active advisories
  const cropsList = Array.from(
    new Set(advisories.map((a) => a.crop_name).filter(Boolean))
  ) as string[];

  const filteredAdvisories = advisories.filter((adv) => {
    const cropMatch =
      selectedCropFilter === 'all' || adv.crop_name === selectedCropFilter;
    const severityMatch =
      selectedSeverityFilter === 'all' || adv.severity === selectedSeverityFilter;
    return cropMatch && severityMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            {t('advisoriesTitle')}
          </h1>
          <p className="text-sm text-stone-500">
            {t('advisoriesSubtitle')}
          </p>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${generateMutation.isPending ? 'animate-spin' : ''}`}
          />
          <span>
            {generateMutation.isPending
              ? t('generatingAdvisories')
              : t('generateAdvisories')}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-green-600" />
          <span>ఫిల్టర్లు / Filters:</span>
        </div>

        {/* Crop Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-600">
            {t('cropName')}:
          </label>
          <select
            value={selectedCropFilter}
            onChange={(e) => setSelectedCropFilter(e.target.value)}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 focus:bg-white focus:ring-1 focus:ring-green-500"
          >
            <option value="all">{language === 'te' ? 'అన్ని పంటలు' : 'All Crops'}</option>
            {cropsList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-600">
            {t('severityHigh')}:
          </label>
          <select
            value={selectedSeverityFilter}
            onChange={(e) => setSelectedSeverityFilter(e.target.value)}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-800 focus:bg-white focus:ring-1 focus:ring-green-500"
          >
            <option value="all">{language === 'te' ? 'అన్ని తీవ్రతలు' : 'All Severities'}</option>
            <option value="critical">{language === 'te' ? 'అత్యవసరం (Critical)' : 'Critical'}</option>
            <option value="high">{language === 'te' ? 'తీవ్ర హెచ్చరిక (High)' : 'High'}</option>
            <option value="medium">{language === 'te' ? 'మధ్యస్థం (Medium)' : 'Medium'}</option>
            <option value="low">{language === 'te' ? 'సాధారణం (Low)' : 'Low'}</option>
          </select>
        </div>
      </div>

      {/* Advisory Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdvisoryCardSkeleton />
          <AdvisoryCardSkeleton />
          <AdvisoryCardSkeleton />
        </div>
      ) : isError ? (
        <ErrorDisplay
          title={t('error')}
          message={(error as Error)?.message}
          onRetry={() => refetch()}
        />
      ) : filteredAdvisories.length === 0 ? (
        <EmptyState
          title={t('noAdvisoriesTitle')}
          description={t('noAdvisoriesDesc')}
          actionText={t('generateAdvisories')}
          onAction={() => generateMutation.mutate()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAdvisories.map((adv) => (
            <AdvisoryCard key={adv.id} advisory={adv} />
          ))}
        </div>
      )}
    </div>
  );
};
