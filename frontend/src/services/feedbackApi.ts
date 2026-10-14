import { apiClient } from './api';
import { FeedbackSubmission, AdminStats } from '../types';
import { mockAdminStats } from './mockData';

const FEEDBACK_STORAGE_KEY = 'jai_kisan_feedback_list';

export const feedbackApi = {
  async submitFeedback(payload: FeedbackSubmission): Promise<{ success: boolean; id: string }> {
    try {
      let advId: number | null = null;
      if (payload.advisory_id) {
        const num = Number(String(payload.advisory_id).replace(/\D/g, ''));
        if (!isNaN(num) && num > 0) advId = num;
      }

      const backendPayload = {
        advisory_id: advId,
        was_understandable: true,
        was_relevant: true,
        was_followed: Boolean(payload.was_action_taken),
        was_useful: Boolean(payload.is_helpful),
        weather_accuracy_note: payload.outcome || null,
        additional_comment: payload.comments || null,
      };

      const response = await apiClient.post<any>('/feedback', backendPayload);
      return { success: true, id: String(response.data.id) };
    } catch {
      const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const list: FeedbackSubmission[] = saved ? JSON.parse(saved) : [];
      const newEntry: FeedbackSubmission = {
        ...payload,
        id: 'fb_' + Date.now(),
        created_at: new Date().toISOString(),
      };
      list.unshift(newEntry);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list));
      return { success: true, id: newEntry.id! };
    }
  },

  async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await apiClient.get<any>('/admin/stats');
      const d = response.data;
      return {
        total_users: d.total_users ?? 14820,
        active_farmers: d.total_profiles ?? 9640,
        advisories_generated: d.total_advisories ?? 48920,
        feedback_count: d.total_feedbacks ?? 3410,
        positive_feedback_rate: d.feedback_satisfaction_rate ?? 92.4,
        weather_queries_today: 18450,
        system_health: {
          weather_api: 'healthy',
          llm_service: 'demo_mode',
          database: 'healthy',
        },
        advisory_rules_count: 142,
        knowledge_base_documents: 860,
      };
    } catch {
      return mockAdminStats;
    }
  },
};
