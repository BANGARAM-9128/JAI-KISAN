import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { LocationPicker } from '../components/LocationPicker';
import { LanguageToggle } from '../components/LanguageToggle';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Globe, 
  Check, 
  ExternalLink, 
  HelpCircle, 
  Save 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Language, LocationInfo } from '../types';

export const Settings: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { t, language, setLanguage } = useTranslation();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [location, setLocation] = useState<LocationInfo>(
    user?.location || {
      latitude: 17.9689,
      longitude: 79.5941,
      village: 'ధర్మసాగర్',
      mandal: 'ధర్మసాగర్',
      district: 'వరంగల్',
      state: 'Telangana',
    }
  );

  // Notification switches
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [waEnabled, setWaEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        full_name: fullName,
        phone_number: phoneNumber,
        location,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-green-700" />
          <span>{t('settingsTitle')}</span>
        </h1>
        <p className="text-sm text-stone-500">
          {t('settingsSubtitle')}
        </p>
      </div>

      {isSaved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5 text-green-600" />
          <span>{t('saved')}</span>
        </div>
      )}

      {/* Language Section */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Globe className="w-5 h-5 text-green-700" />
          <h2 className="text-lg font-bold text-stone-900">
            {t('language')}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-stone-800">
              {language === 'te' ? 'యాప్ భాష' : 'Application Display Language'}
            </p>
            <p className="text-xs text-stone-500">
              {language === 'te'
                ? 'మీకు అనుకూలమైన భాషను ఎంచుకోండి (తెలుగు లేదా ఇంగ్లీష్)'
                : 'Choose your preferred language across the entire platform'}
            </p>
          </div>

          <LanguageToggle variant="buttons" />
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <User className="w-5 h-5 text-green-700" />
          <h2 className="text-lg font-bold text-stone-900">
            {t('profileInformation')}
          </h2>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t('fullNameLabel')}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t('phoneNumberLabel')}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98480 22338"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t('step2Title')}
            </label>
            <LocationPicker value={location} onChange={setLocation} />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold shadow-md shadow-green-700/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? t('saving') : t('save')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Bell className="w-5 h-5 text-green-700" />
          <h2 className="text-lg font-bold text-stone-900">
            {t('notificationPreferences')}
          </h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
            <div>
              <p className="text-sm font-bold text-stone-800">{t('smsAlerts')}</p>
              <p className="text-xs text-stone-500">
                {language === 'te' ? 'భారీ వర్షం, ఉరుముల సమయంలో మొబైల్ SMS' : 'Instant SMS text for severe storms & rain warnings'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={smsEnabled}
              onChange={(e) => setSmsEnabled(e.target.checked)}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
            <div>
              <p className="text-sm font-bold text-stone-800">{t('whatsappAlerts')}</p>
              <p className="text-xs text-stone-500">
                {language === 'te' ? 'వారం వారం వాట్సాప్ ద్వారా వ్యవసాయ బులెటిన్' : 'Weekly crop advisory digest delivered to WhatsApp'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={waEnabled}
              onChange={(e) => setWaEnabled(e.target.checked)}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
            <div>
              <p className="text-sm font-bold text-stone-800">{t('emailDigest')}</p>
              <p className="text-xs text-stone-500">
                {language === 'te' ? 'ఈమెయిల్ ద్వారా సమగ్ర వాతావరణ విశ్లేషణ' : 'Comprehensive PDF agromet bulletin via email'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            />
          </label>
        </div>
      </div>

      {/* Scientific Methodology Link */}
      <div className="bg-stone-100 rounded-3xl p-6 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-stone-900">
            {t('methodologyTitle')}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {language === 'te'
              ? 'మేము వాతావరణ సమాచారాన్ని ఎలా సేకరిస్తాము మరియు సలహాలను ఎలా రూపొందిస్తామో తెలుసుకోండి.'
              : 'Understand our meteorological data pipelines and agronomic advisory rules.'}
          </p>
        </div>

        <Link
          to="/methodology"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-stone-800 hover:text-green-700 font-bold text-xs sm:text-sm border border-stone-300 shadow-sm transition-colors"
        >
          <span>{t('viewAll')}</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
