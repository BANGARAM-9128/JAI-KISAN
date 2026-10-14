import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../contexts/LanguageContext';
import { notificationApi } from '../services/notificationApi';
import { EmptyState } from '../components/EmptyState';
import { SeverityBadge } from '../components/SeverityBadge';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  ExternalLink, 
  Calendar 
} from 'lucide-react';

export const Notifications: React.FC = () => {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-2">
            <span>{t('notificationsTitle')}</span>
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                {unreadCount} {language === 'te' ? 'కొత్తవి' : 'New'}
              </span>
            )}
          </h1>
          <p className="text-sm text-stone-500">
            {language === 'te'
              ? 'వాతావరణ హెచ్చరికలు మరియు అత్యవసర సలహాల వివరాలు.'
              : 'Stay alert with critical weather updates and urgent field advisories.'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold transition-colors shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-green-600" />
            <span>{t('markAllAsRead')}</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          title={t('noNotifications')}
          description={t('allCaughtUp')}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const title = language === 'te' ? item.title_te : item.title;
            const message = language === 'te' ? item.message_te : item.message;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.is_read) {
                    markReadMutation.mutate(item.id);
                  }
                }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  item.is_read
                    ? 'bg-white border-stone-200 text-stone-700 shadow-sm opacity-90'
                    : 'bg-green-50/50 border-green-300 ring-1 ring-green-400/20 shadow-card text-stone-900'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-sm flex-shrink-0">
                  {getIcon(item.severity)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-base font-bold text-stone-900">
                      {title}
                    </h2>
                    <SeverityBadge severity={item.severity as any} size="sm" />
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {message}
                  </p>

                  <div className="flex items-center justify-between pt-2 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </span>

                    {item.link && (
                      <Link
                        to={item.link}
                        className="text-green-700 hover:text-green-800 font-semibold inline-flex items-center gap-1 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{language === 'te' ? 'వివరాలు చూడండి' : 'View Details'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {!item.is_read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-green-600 flex-shrink-0 mt-2"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
