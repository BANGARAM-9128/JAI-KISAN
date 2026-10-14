import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  onRetry,
  title,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto my-6">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-red-900 mb-1">
        {title || t('error')}
      </h3>
      <p className="text-sm text-red-700 mb-4">
        {message || 'Something went wrong while fetching data. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('retry')}</span>
        </button>
      )}
    </div>
  );
};
