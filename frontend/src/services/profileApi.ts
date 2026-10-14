import { apiClient } from './api';
import { User } from '../types';
import { mockUser } from './mockData';

const mapProfileToUser = (profile: any): User => {
  return {
    id: String(profile.user_id || profile.id || 'usr_1'),
    email: profile.email || 'farmer@jaikisan.in',
    full_name: profile.display_name || profile.full_name || 'Farmer',
    role: 'farmer',
    language: 'te',
    is_onboarded: true,
    location: {
      latitude: Number(profile.latitude ?? 15.48),
      longitude: Number(profile.longitude ?? 78.48),
      village: profile.village || '',
      district: profile.district || 'Kurnool',
      state: profile.state || 'Andhra Pradesh',
    },
    irrigation_type: profile.irrigation_type,
    soil_type: profile.soil_type,
    farm_size_acres: profile.farm_size_acres,
    created_at: profile.created_at,
  };
};

export const profileApi = {
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<any>('/profile');
      if (response.data && (response.data.display_name || response.data.district)) {
        const user = mapProfileToUser(response.data);
        localStorage.setItem('jai_kisan_user', JSON.stringify(user));
        return user;
      }
      throw new Error('No profile data');
    } catch {
      const saved = localStorage.getItem('jai_kisan_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
      return mockUser;
    }
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const payload: any = {};
      if (updates.full_name) payload.display_name = updates.full_name;
      if (updates.location?.village) payload.village = updates.location.village;
      if (updates.location?.district) payload.district = updates.location.district;
      if (updates.location?.state) payload.state = updates.location.state;
      if (updates.location?.latitude !== undefined) payload.latitude = updates.location.latitude;
      if (updates.location?.longitude !== undefined) payload.longitude = updates.location.longitude;
      if (updates.irrigation_type) payload.irrigation_type = updates.irrigation_type;
      if (updates.soil_type) payload.soil_type = updates.soil_type;
      if (updates.farm_size_acres !== undefined) payload.farm_size_acres = updates.farm_size_acres;

      const response = await apiClient.put<any>('/profile', payload);
      const user = mapProfileToUser(response.data);
      localStorage.setItem('jai_kisan_user', JSON.stringify(user));
      return user;
    } catch {
      const current = await profileApi.getProfile();
      const updated: User = { ...current, ...updates };
      localStorage.setItem('jai_kisan_user', JSON.stringify(updated));
      return updated;
    }
  },

  async setupProfile(data: Partial<User>): Promise<User> {
    try {
      const payload = {
        display_name: data.full_name || 'Farmer',
        village: data.location?.village || '',
        district: data.location?.district || 'Kurnool',
        state: data.location?.state || 'Andhra Pradesh',
        latitude: Number(data.location?.latitude ?? 15.48),
        longitude: Number(data.location?.longitude ?? 78.48),
        irrigation_type: data.irrigation_type || 'borewell',
        soil_type: data.soil_type || 'black_cotton',
        farm_size_acres: data.farm_size_acres || 3.0,
      };

      const response = await apiClient.post<any>('/profile/setup', payload);
      const user = mapProfileToUser(response.data);
      user.is_onboarded = true;
      localStorage.setItem('jai_kisan_user', JSON.stringify(user));
      return user;
    } catch {
      const current = await profileApi.getProfile();
      const updated: User = { ...current, ...data, is_onboarded: true };
      localStorage.setItem('jai_kisan_user', JSON.stringify(updated));
      return updated;
    }
  },
};
