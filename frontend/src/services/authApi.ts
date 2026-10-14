import { apiClient } from './api';
import { User, Language } from '../types';
import { mockUser } from './mockData';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  full_name: string;
  phone_number?: string;
  language?: Language;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

const mapBackendUser = (backendUser: any, profile?: any): User => {
  const language = (backendUser.language_pref === 'en' ? 'en' : 'te') as Language;
  const fullName = profile?.display_name || backendUser.email?.split('@')[0] || 'Farmer';
  const isOnboarded = Boolean(profile && profile.district);

  return {
    id: String(backendUser.id),
    email: backendUser.email,
    full_name: fullName,
    role: backendUser.role || 'farmer',
    language,
    location: profile
      ? {
          latitude: Number(profile.latitude ?? 15.48),
          longitude: Number(profile.longitude ?? 78.48),
          village: profile.village || '',
          district: profile.district || 'Kurnool',
          state: profile.state || 'Andhra Pradesh',
        }
      : {
          latitude: 15.48,
          longitude: 78.48,
          village: '',
          district: 'Kurnool',
          state: 'Andhra Pradesh',
        },
    irrigation_type: profile?.irrigation_type,
    soil_type: profile?.soil_type,
    farm_size_acres: profile?.farm_size_acres,
    is_onboarded: isOnboarded,
    created_at: backendUser.created_at,
  };
};

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>('/auth/login', payload);
      if (response.data?.access_token) {
        localStorage.setItem('jai_kisan_token', response.data.access_token);
      }

      // Check if profile exists for this user
      let profile: any = null;
      try {
        const profRes = await apiClient.get<any>('/profile', {
          headers: { Authorization: `Bearer ${response.data.access_token}` },
        });
        profile = profRes.data;
      } catch {}

      const user = mapBackendUser(response.data.user, profile);
      localStorage.setItem('jai_kisan_user', JSON.stringify(user));

      return {
        user,
        access_token: response.data.access_token,
        token_type: response.data.token_type || 'bearer',
      };
    } catch (error) {
      console.warn('Backend login unavailable or failed, using simulated session:', error);
      const token = 'demo_jwt_token_' + Date.now();
      localStorage.setItem('jai_kisan_token', token);
      const demoUser: User = {
        ...mockUser,
        email: payload.email || mockUser.email,
      };
      localStorage.setItem('jai_kisan_user', JSON.stringify(demoUser));
      return {
        user: demoUser,
        access_token: token,
        token_type: 'bearer',
      };
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>('/auth/register', {
        email: payload.email,
        password: payload.password,
        role: 'farmer',
        language_pref: payload.language || 'te',
      });

      if (response.data?.access_token) {
        localStorage.setItem('jai_kisan_token', response.data.access_token);
      }

      const user = mapBackendUser(response.data.user);
      user.full_name = payload.full_name || user.full_name;
      user.is_onboarded = false; // Must complete onboarding
      localStorage.setItem('jai_kisan_user', JSON.stringify(user));

      return {
        user,
        access_token: response.data.access_token,
        token_type: response.data.token_type || 'bearer',
      };
    } catch (error) {
      console.warn('Backend unavailable, registering in simulated mode:', error);
      const token = 'demo_jwt_token_' + Date.now();
      localStorage.setItem('jai_kisan_token', token);
      const newUser: User = {
        ...mockUser,
        id: 'usr_' + Date.now(),
        email: payload.email,
        full_name: payload.full_name,
        phone_number: payload.phone_number,
        language: payload.language || 'te',
        is_onboarded: false,
      };
      localStorage.setItem('jai_kisan_user', JSON.stringify(newUser));
      return {
        user: newUser,
        access_token: token,
        token_type: 'bearer',
      };
    }
  },

  async getMe(): Promise<User> {
    try {
      const response = await apiClient.get<any>('/auth/me');
      let profile: any = null;
      try {
        const profRes = await apiClient.get<any>('/profile');
        profile = profRes.data;
      } catch {}

      const user = mapBackendUser(response.data, profile);
      localStorage.setItem('jai_kisan_user', JSON.stringify(user));
      return user;
    } catch (error) {
      const token = localStorage.getItem('jai_kisan_token');
      if (token) {
        const savedUserStr = localStorage.getItem('jai_kisan_user');
        if (savedUserStr) {
          try {
            return JSON.parse(savedUserStr);
          } catch {}
        }
        return mockUser;
      }
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem('jai_kisan_token');
    localStorage.removeItem('jai_kisan_user');
  },
};
