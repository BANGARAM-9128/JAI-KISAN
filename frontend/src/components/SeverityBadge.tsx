import React from 'react';
import { AdvisorySeverity, AlertSeverity } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface SeverityBadgeProps {
  severity: AdvisorySeverity | AlertSeverity;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  showIcon = true,
}) => {
  const { language } = useTranslation();

  const config = {
    low: {
      bg: 'bg-blue-50 border-blue-200 text-blue-700',
      icon: Info,
      labelEn: 'Low / Info',
      labelTe: 'సాధారణం',
    },
    moderate: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      icon: AlertTriangle,
      labelEn: 'Moderate',
      labelTe: 'మధ్యస్థం',
    },
    medium: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      icon: AlertTriangle,
      labelEn: 'Medium Alert',
      labelTe: 'మధ్యస్థ శ్రద్ధ',
    },
    high: {
      bg: 'bg-orange-50 border-orange-200 text-orange-700',
      icon: AlertCircle,
      labelEn: 'High Alert',
      labelTe: 'తీవ్ర హెచ్చరిక',
    },
    critical: {
      bg: 'bg-red-50 border-red-200 text-red-700 font-bold animate-pulse',
      icon: ShieldAlert,
      labelEn: 'Critical',
      labelTe: 'అత్యవసరం',
    },
  }[severity] || {
    bg: 'bg-stone-50 border-stone-200 text-stone-700',
    icon: Info,
    labelEn: severity,
    labelTe: severity,
  };

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} whitespace-nowrap`}
    >
      {showIcon && <IconComponent className={iconSizes} />}
      <span>{language === 'te' ? config.labelTe : config.labelEn}</span>
    </span>
  );
};
