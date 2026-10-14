import { apiClient } from './api';
import { Crop, GrowthStage } from '../types';
import { mockCrops } from './mockData';

const CROPS_STORAGE_KEY = 'jai_kisan_crops';

const cropTeluguMap: Record<string, string> = {
  rice: 'వరి (వరి ధాన్యం)',
  paddy: 'వరి (వరి ధాన్యం)',
  cotton: 'పత్తి',
  chilli: 'మిరప',
  maize: 'మొక్కజొన్న',
  corn: 'మొక్కజొన్న',
  groundnut: 'వేరుశనగ',
  peanut: 'వేరుశనగ',
  redgram: 'కంది',
  bengalgram: 'శనగ',
  sugarcane: 'చెరకు',
  tomato: 'టమోటా',
  turmeric: 'పసుపు',
  mango: 'మామిడి',
};

const getTeluguCropName = (cropName: string): string => {
  const norm = cropName.toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
  return cropTeluguMap[norm] || cropName;
};

const getLocalCrops = (): Crop[] => {
  const saved = localStorage.getItem(CROPS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  localStorage.setItem(CROPS_STORAGE_KEY, JSON.stringify(mockCrops));
  return mockCrops;
};

export const cropApi = {
  async getCrops(): Promise<Crop[]> {
    try {
      const response = await apiClient.get<any[]>('/crops');
      if (Array.isArray(response.data)) {
        return response.data.map((c: any) => ({
          id: String(c.id),
          name: c.crop_name ? c.crop_name.charAt(0).toUpperCase() + c.crop_name.slice(1) : c.name || 'Crop',
          name_te: c.name_te || getTeluguCropName(c.crop_name || c.name || ''),
          variety: c.variety,
          sowing_date: c.sowing_date,
          growth_stage: (c.growth_stage || 'vegetative') as GrowthStage,
          field_area_acres: c.field_area_acres,
          fieldArea_acres: c.field_area_acres,
          notes: c.notes,
          created_at: c.created_at,
        }));
      }
      return getLocalCrops();
    } catch {
      return getLocalCrops();
    }
  },

  async addCrop(crop: Omit<Crop, 'id' | 'created_at'>): Promise<Crop> {
    try {
      const payload = {
        crop_name: (crop.name || 'crop').toLowerCase().split(' ')[0],
        variety: crop.variety || null,
        sowing_date: crop.sowing_date || new Date().toISOString().split('T')[0],
        growth_stage: (crop.growth_stage || 'vegetative').toLowerCase(),
        field_area_acres: crop.field_area_acres || crop.fieldArea_acres || 1.0,
        is_active: true,
      };
      const response = await apiClient.post<any>('/crops', payload);
      const c = response.data;
      return {
        id: String(c.id),
        name: c.crop_name ? c.crop_name.charAt(0).toUpperCase() + c.crop_name.slice(1) : crop.name,
        name_te: crop.name_te || getTeluguCropName(c.crop_name || crop.name),
        variety: c.variety,
        sowing_date: c.sowing_date,
        growth_stage: c.growth_stage as GrowthStage,
        field_area_acres: c.field_area_acres,
        fieldArea_acres: c.field_area_acres,
        created_at: c.created_at,
      };
    } catch {
      const crops = getLocalCrops();
      const newCrop: Crop = {
        ...crop,
        id: 'crop_' + Date.now(),
        created_at: new Date().toISOString(),
      };
      const updated = [newCrop, ...crops];
      localStorage.setItem(CROPS_STORAGE_KEY, JSON.stringify(updated));
      return newCrop;
    }
  },

  async updateCrop(id: string, updates: Partial<Crop>): Promise<Crop> {
    try {
      const payload: any = {};
      if (updates.name) payload.crop_name = updates.name.toLowerCase().split(' ')[0];
      if (updates.variety !== undefined) payload.variety = updates.variety;
      if (updates.sowing_date) payload.sowing_date = updates.sowing_date;
      if (updates.growth_stage) payload.growth_stage = updates.growth_stage.toLowerCase();
      if (updates.field_area_acres !== undefined || updates.fieldArea_acres !== undefined) {
        payload.field_area_acres = updates.field_area_acres || updates.fieldArea_acres;
      }

      const response = await apiClient.put<any>(`/crops/${id}`, payload);
      const c = response.data;
      return {
        id: String(c.id),
        name: c.crop_name ? c.crop_name.charAt(0).toUpperCase() + c.crop_name.slice(1) : updates.name || 'Crop',
        name_te: updates.name_te || getTeluguCropName(c.crop_name || ''),
        variety: c.variety,
        sowing_date: c.sowing_date,
        growth_stage: c.growth_stage as GrowthStage,
        field_area_acres: c.field_area_acres,
        fieldArea_acres: c.field_area_acres,
      };
    } catch {
      const crops = getLocalCrops();
      const index = crops.findIndex((c) => c.id === id);
      if (index === -1) throw new Error('Crop not found');
      const updatedCrop = { ...crops[index], ...updates };
      crops[index] = updatedCrop;
      localStorage.setItem(CROPS_STORAGE_KEY, JSON.stringify(crops));
      return updatedCrop;
    }
  },

  async deleteCrop(id: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/crops/${id}`);
      return { success: true };
    } catch {
      const crops = getLocalCrops();
      const filtered = crops.filter((c) => c.id !== id);
      localStorage.setItem(CROPS_STORAGE_KEY, JSON.stringify(filtered));
      return { success: true };
    }
  },
};
