import React from 'react';
import { Sprout } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center max-w-md mx-auto my-6 shadow-sm">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
        {icon || <Sprout className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-stone-800 mb-2">{title}</h3>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
