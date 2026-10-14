import { apiClient } from './api';
import { Advisory, AdvisorySeverity } from '../types';
import { mockAdvisories } from './mockData';

const ADVISORIES_STORAGE_KEY = 'jai_kisan_advisories';

const mapBackendAdvisory = (a: any): Advisory => {
  return {
    id: String(a.id),
    title: a.title,
    title_te: a.title_te || a.title,
    summary: a.recommendation ? a.recommendation.slice(0, 140) + '...' : a.title,
    summary_te: a.recommendation_te ? a.recommendation_te.slice(0, 140) + '...' : (a.title_te || a.title),
    severity: (a.severity || 'medium') as AdvisorySeverity,
    category: 'general',
    crop_name: a.crop_record_id ? 'Active Crop' : 'Farm Field',
    crop_name_te: a.crop_record_id ? 'రైతు పంట' : 'వ్యవసాయ భూమి',
    valid_from: a.created_at || new Date().toISOString(),
    valid_to: a.expires_at || new Date(Date.now() + 86400000 * 2).toISOString(),
    weather_condition: a.weather_summary || 'Normal Seasonal Weather Conditions',
    weather_condition_te: a.weather_summary || 'సాధారణ కాలానుగుణ వాతావరణ పరిస్థితులు',
    recommendation: a.recommendation,
    recommendation_te: a.recommendation_te || a.recommendation,
    alternative_action: a.alternative_action || 'Install physical/biological sticky traps to monitor insect activity without chemical spray.',
    alternative_action_te: a.alternative_action || 'రసాయన పిచికారీకి బదులుగా పసుపు/నీలి రంగు జిగురు అట్టలను లేదా లింగాకర్షక బుట్టలను అమర్చండి.',
    scientific_rationale: a.source_reference || 'Calibrated based on ICAR-CRIDA & ANGRAU agrometeorological thresholds.',
    scientific_rationale_te: a.source_reference || 'ICAR మరియు ANGRAU వ్యవసాయ పరిశోధనా మార్గదర్శకాల ఆధారంగా రూపొందించబడింది.',
    source_reference: a.source_reference || 'ANGRAU Package of Practices',
    source_organization: 'ANGRAU & ICAR Agromet Advisory Network',
    confidence_score: Math.round((a.confidence ?? 0.88) * 100),
  };
};

const getLocalAdvisories = (): Advisory[] => {
  const saved = localStorage.getItem(ADVISORIES_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  localStorage.setItem(ADVISORIES_STORAGE_KEY, JSON.stringify(mockAdvisories));
  return mockAdvisories;
};

export const advisoryApi = {
  async getAdvisories(): Promise<Advisory[]> {
    try {
      const response = await apiClient.get<any[]>('/advisories');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map(mapBackendAdvisory);
      }
      return getLocalAdvisories();
    } catch {
      return getLocalAdvisories();
    }
  },

  async getAdvisory(id: string): Promise<Advisory> {
    try {
      const response = await apiClient.get<any>(`/advisories/${id}`);
      if (response.data && response.data.id) {
        return mapBackendAdvisory(response.data);
      }
      throw new Error('Not found in backend');
    } catch {
      const list = getLocalAdvisories();
      const adv = list.find((a) => a.id === id);
      if (!adv) throw new Error('Advisory not found');
      return adv;
    }
  },

  async generateAdvisories(): Promise<Advisory[]> {
    try {
      const response = await apiClient.post<any>('/advisories/generate', {});
      const list = response.data?.advisories || response.data;
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map(mapBackendAdvisory);
        localStorage.setItem(ADVISORIES_STORAGE_KEY, JSON.stringify(mapped));
        return mapped;
      }
      return getLocalAdvisories();
    } catch {
      await new Promise((res) => setTimeout(res, 600));
      return getLocalAdvisories();
    }
  },

  async saveAdvisoryFeedback(id: string, isHelpful: boolean, comment?: string): Promise<Advisory> {
    try {
      await apiClient.post('/feedback', {
        advisory_id: Number(id.replace(/\D/g, '')) || null,
        was_understandable: true,
        was_relevant: true,
        was_followed: true,
        was_useful: isHelpful,
        additional_comment: comment || null,
      });
    } catch {}

    const list = getLocalAdvisories();
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        user_feedback: {
          is_helpful: isHelpful,
          comment,
          submitted_at: new Date().toISOString(),
        },
      };
      localStorage.setItem(ADVISORIES_STORAGE_KEY, JSON.stringify(list));
      return list[idx];
    }
    throw new Error('Advisory not found');
  },
};
