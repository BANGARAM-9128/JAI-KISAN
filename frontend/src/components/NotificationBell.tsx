import React from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../services/notificationApi';

export const NotificationBell: React.FC = () => {
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
    refetchInterval: 60000,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Link
      to="/notifications"
      className="relative p-2 text-stone-600 hover:text-green-700 hover:bg-stone-100 rounded-full transition-colors"
      title="నోటిఫికేషన్‌లు / Notifications"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5 md:w-6 md:h-6" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
};
