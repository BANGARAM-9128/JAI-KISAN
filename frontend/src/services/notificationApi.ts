import { apiClient } from './api';
import { NotificationItem } from '../types';
import { mockNotifications } from './mockData';

const NOTIFS_STORAGE_KEY = 'jai_kisan_notifications';

const getLocalNotifications = (): NotificationItem[] => {
  const saved = localStorage.getItem(NOTIFS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(mockNotifications));
  return mockNotifications;
};

export const notificationApi = {
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await apiClient.get<any[]>('/notifications');
      if (Array.isArray(response.data)) {
        return response.data.map((n: any) => ({
          id: String(n.id),
          title: n.title,
          title_te: n.title,
          message: n.message,
          message_te: n.message,
          severity: n.severity || 'info',
          category: n.type || 'alert',
          created_at: n.created_at || new Date().toISOString(),
          is_read: Boolean(n.is_read),
        }));
      }
      return getLocalNotifications();
    } catch {
      return getLocalNotifications();
    }
  },

  async markRead(id: string): Promise<void> {
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch {
      const notifs = getLocalNotifications();
      const updated = notifs.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
    }
  },

  async markAllRead(): Promise<void> {
    try {
      await apiClient.put('/notifications/read-all');
    } catch {
      const notifs = getLocalNotifications();
      const updated = notifs.map((n) => ({ ...n, is_read: true }));
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
    }
  },
};
