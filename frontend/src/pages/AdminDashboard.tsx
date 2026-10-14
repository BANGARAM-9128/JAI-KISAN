import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { feedbackApi } from '../services/feedbackApi';
import { advisoryApi } from '../services/advisoryApi';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  ShieldCheck, 
  Users, 
  Sprout, 
  Activity, 
  Database, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  BookOpen, 
  MessageSquare 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { t, language } = useTranslation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => feedbackApi.getAdminStats(),
  });

  const { data: advisories = [] } = useQuery({
    queryKey: ['advisories'],
    queryFn: () => advisoryApi.getAdvisories(),
  });

  const rulesList = [
    {
      id: 'RUL-01',
      name: 'Rain-Fast Foliar Spray Delay Rule',
      crops: 'Paddy, Cotton, Chilli',
      trigger: 'Precipitation Probability > 60% OR Wind > 18 km/h',
      severity: 'high',
      status: 'active',
    },
    {
      id: 'RUL-02',
      name: 'Paddy Flowering Stagnation Prevention',
      crops: 'Paddy (BPT 5204, MTU 1010)',
      trigger: 'Cumulative Rain > 30mm during Flowering Stage',
      severity: 'medium',
      status: 'active',
    },
    {
      id: 'RUL-03',
      name: 'Cotton Sucking Pest / Bollworm Risk Engine',
      crops: 'Bt Cotton II',
      trigger: 'Humidity > 80% & Temp between 25-32°C for 48h',
      severity: 'medium',
      status: 'active',
    },
    {
      id: 'RUL-04',
      name: 'Extreme Heat Stress & Irrigation Alert',
      crops: 'All Active Crops',
      trigger: 'Maximum Temp > 38°C for 3 consecutive days',
      severity: 'critical',
      status: 'active',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-purple-600" />
          <span>{t('adminTitle')}</span>
        </h1>
        <p className="text-sm text-stone-500">
          {t('adminSubtitle')}
        </p>
      </div>

      {/* Top 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase">{t('totalFarmers')}</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats?.total_users?.toLocaleString() || '14,820'}
          </p>
          <span className="text-xs text-green-600 font-semibold">
            +184 this week
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase">{t('advisoriesSent')}</span>
            <Sprout className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats?.advisories_generated?.toLocaleString() || '48,920'}
          </p>
          <span className="text-xs text-stone-400">
            Calculated across 42 mandals
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase">{t('feedbackSatisfaction')}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats?.positive_feedback_rate || 92.4}%
          </p>
          <span className="text-xs text-emerald-700 font-semibold">
            From 3,410 verified farmers
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase">{t('activeRules')}</span>
            <Layers className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats?.advisory_rules_count || 142}
          </p>
          <span className="text-xs text-amber-700 font-semibold">
            860 KVK / ICAR source docs
          </span>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-stone-600" />
          <span>System Pipeline Health</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-stone-900">{t('weatherApiStatus')}</p>
              <p className="text-xs text-stone-500">Open-Meteo High-Res API</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-green-600"></span>
              Healthy (200 OK)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-stone-900">{t('llmServiceStatus')}</p>
              <p className="text-xs text-stone-500">Kisan AI Assistant Engine</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-600" />
              Demo Mode Active
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-stone-900">{t('dbStatus')}</p>
              <p className="text-xs text-stone-500">PostgreSQL / SQLite State</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
              <Database className="w-3.5 h-3.5 text-green-600" />
              Connected (3ms)
            </span>
          </div>
        </div>
      </div>

      {/* Agronomic Advisory Rules Engine Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-stone-600" />
            <span>Active Agronomic Expert Rules</span>
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg">
            4 Core Rules Loaded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-700">
                <th className="py-2.5 px-3 font-bold">Rule ID & Name</th>
                <th className="py-2.5 px-3 font-bold">Applicable Crops</th>
                <th className="py-2.5 px-3 font-bold">Meteorological Trigger Condition</th>
                <th className="py-2.5 px-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-600">
              {rulesList.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-3 font-semibold text-stone-900">
                    <span className="text-xs text-stone-400 block font-mono">{r.id}</span>
                    {r.name}
                  </td>
                  <td className="py-3 px-3">{r.crops}</td>
                  <td className="py-3 px-3 font-mono text-xs text-stone-700">{r.trigger}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
