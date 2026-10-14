import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  variant?: 'buttons' | 'dropdown' | 'compact';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ variant = 'buttons' }) => {
  const { language, setLanguage } = useTranslation();

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setLanguage(language === 'te' ? 'en' : 'te')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium transition-colors shadow-sm"
        title="భాష మార్చండి / Switch Language"
      >
        <Globe className="w-4 h-4 text-green-600" />
        <span>{language === 'te' ? 'English' : 'తెలుగు'}</span>
      </button>
    );
  }

  return (
    <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-0.5 shadow-inner">
      <button
        type="button"
        onClick={() => setLanguage('te')}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
          language === 'te'
            ? 'bg-white text-green-700 shadow-sm'
            : 'text-stone-600 hover:text-stone-900'
        }`}
      >
        తెలుగు
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
          language === 'en'
            ? 'bg-white text-green-700 shadow-sm'
            : 'text-stone-600 hover:text-stone-900'
        }`}
      >
        English
      </button>
    </div>
  );
};
