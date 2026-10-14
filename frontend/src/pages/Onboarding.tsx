import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { LocationPicker } from '../components/LocationPicker';
import { CropSelector, COMMON_CROPS } from '../components/CropSelector';
import { GrowthStageSelector } from '../components/GrowthStageSelector';
import { cropApi } from '../services/cropApi';
import { LocationInfo, GrowthStage, Language } from '../types';
import { 
  Sprout, 
  MapPin, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Droplets 
} from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { user, setupProfile } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Personal & Language
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [prefLang, setPrefLang] = useState<Language>(user?.language || language || 'te');

  // Step 2: Location
  const [location, setLocation] = useState<LocationInfo>(
    user?.location || {
      latitude: 17.9689,
      longitude: 79.5941,
      village: 'ధర్మసాగర్ (Dharmasagar)',
      mandal: 'ధర్మసాగర్',
      district: 'వరంగల్ (Warangal)',
      state: 'Telangana',
      pincode: '506142',
    }
  );

  // Step 3: Primary Crop & Growth Stage
  const [selectedCropName, setSelectedCropName] = useState('Paddy (Rice)');
  const [selectedCropTe, setSelectedCropTe] = useState('వరి (వరి ధాన్యం)');
  const [cropVariety, setCropVariety] = useState('BPT 5204 (Samba Mahsuri)');
  const [growthStage, setGrowthStage] = useState<GrowthStage>('vegetative');
  const [fieldArea, setFieldArea] = useState<number>(3.0);

  // Step 4: Irrigation & Soil (Optional)
  const [irrigationType, setIrrigationType] = useState<'borewell' | 'canal' | 'drip' | 'sprinkler' | 'rainfed'>('borewell');
  const [soilType, setSoilType] = useState<'black' | 'red' | 'alluvial' | 'sandy' | 'clay'>('black');
  const [farmSize, setFarmSize] = useState<number>(4.0);

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      setLanguage(prefLang);

      // Save user profile
      await setupProfile({
        full_name: fullName,
        language: prefLang,
        location,
        irrigation_type: irrigationType,
        soil_type: soilType,
        farm_size_acres: farmSize,
        is_onboarded: true,
      });

      // Save primary crop
      await cropApi.addCrop({
        name: selectedCropName,
        name_te: selectedCropTe,
        variety: cropVariety,
        sowing_date: new Date().toISOString().split('T')[0],
        growth_stage: growthStage,
        fieldArea_acres: fieldArea,
        irrigation_type: irrigationType,
        soil_type: soilType,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { num: 1, title: t('step1Title') },
    { num: 2, title: t('step2Title') },
    { num: 3, title: t('step3Title') },
    { num: 4, title: t('step4Title') },
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        {/* Branding & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-700 text-white shadow-md shadow-green-700/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            {t('onboardingTitle')}
          </h1>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            {t('onboardingSubtitle')}
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            {stepsMeta.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step > s.num
                        ? 'bg-green-700 text-white'
                        : step === s.num
                        ? 'bg-green-100 text-green-800 ring-2 ring-green-600'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="text-[11px] font-semibold text-stone-600 text-center hidden sm:block">
                    {s.title}
                  </span>
                </div>
                {idx < stepsMeta.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-all ${
                      step > s.num ? 'bg-green-600' : 'bg-stone-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                {t('step1Title')}
              </h2>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {t('fullNameLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="రైతు పేరు / Farmer Name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-stone-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  {t('preferredLanguage')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrefLang('te')}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      prefLang === 'te'
                        ? 'bg-green-50 border-green-600 ring-2 ring-green-600/20 text-green-950 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="text-lg block mb-0.5">తెలుగు</span>
                    <span className="text-xs text-stone-500">Telugu Language</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrefLang('en')}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      prefLang === 'en'
                        ? 'bg-green-50 border-green-600 ring-2 ring-green-600/20 text-green-950 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="text-lg block mb-0.5">English</span>
                    <span className="text-xs text-stone-500">ఇంగ్లీష్ భాష</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                {t('step2Title')}
              </h2>
              <p className="text-xs text-stone-500">
                ఖచ్చితమైన వాతావరణ సమాచారం కోసం మీ పొలం లొకేషన్‌ను ఎంచుకోండి. GPS బటన్ నొక్కడం ద్వారా ఆటోమేటిక్‌గా మీ స్థానాన్ని గుర్తించవచ్చు.
              </p>
              <LocationPicker value={location} onChange={setLocation} />
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                {t('step3Title')}
              </h2>

              <CropSelector
                selectedCrop={selectedCropName}
                onChange={(crop) => {
                  setSelectedCropName(crop.nameEn);
                  setSelectedCropTe(crop.nameTe);
                }}
                label={t('cropName')}
              />

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {t('cropVariety')}
                </label>
                <input
                  type="text"
                  value={cropVariety}
                  onChange={(e) => setCropVariety(e.target.value)}
                  placeholder="e.g. BPT 5204 / Bt Cotton II / Teja"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-stone-900 text-sm"
                />
              </div>

              <GrowthStageSelector
                value={growthStage}
                onChange={setGrowthStage}
                label={t('growthStage')}
              />

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {t('fieldArea')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={fieldArea}
                  onChange={(e) => setFieldArea(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-stone-900 text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="text-lg font-bold text-stone-900">
                  {t('step4Title')}
                </h2>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="text-xs text-stone-500 hover:text-green-700 font-semibold underline"
                >
                  {t('skipOptional')}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  {t('irrigationTypeLabel')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'borewell', labelTe: 'బోరు బావి', labelEn: 'Borewell' },
                    { id: 'canal', labelTe: 'కాలువ నీరు', labelEn: 'Canal Water' },
                    { id: 'drip', labelTe: 'బిందు సేద్యం (డ్రిప్)', labelEn: 'Drip Irrigation' },
                    { id: 'sprinkler', labelTe: 'స్ప్రింక్లర్', labelEn: 'Sprinkler' },
                    { id: 'rainfed', labelTe: 'వర్షాధారం', labelEn: 'Rainfed (No Irrigation)' },
                  ].map((irr) => (
                    <button
                      key={irr.id}
                      type="button"
                      onClick={() => setIrrigationType(irr.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        irrigationType === irr.id
                          ? 'bg-green-50 border-green-600 text-green-950 font-bold ring-2 ring-green-600/20'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-sm block">{language === 'te' ? irr.labelTe : irr.labelEn}</span>
                      <span className="text-[11px] text-stone-400">{language === 'te' ? irr.labelEn : irr.labelTe}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  {t('soilTypeLabel')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'black', labelTe: 'నల్ల రేగడి నేల', labelEn: 'Black Soil' },
                    { id: 'red', labelTe: 'ఎర్ర నేల', labelEn: 'Red Soil' },
                    { id: 'alluvial', labelTe: 'ఒండ్రు నేల', labelEn: 'Alluvial Soil' },
                    { id: 'sandy', labelTe: 'ఇసుక నేల', labelEn: 'Sandy Soil' },
                    { id: 'clay', labelTe: 'బంకమట్టి నేల', labelEn: 'Clay Soil' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSoilType(s.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        soilType === s.id
                          ? 'bg-green-50 border-green-600 text-green-950 font-bold ring-2 ring-green-600/20'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-sm block">{language === 'te' ? s.labelTe : s.labelEn}</span>
                      <span className="text-[11px] text-stone-400">{language === 'te' ? s.labelEn : s.labelTe}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  {t('farmSizeLabel')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={farmSize}
                  onChange={(e) => setFarmSize(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600 text-stone-900 text-sm"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('previousStep')}</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold transition-all text-sm shadow-md shadow-green-700/20"
              >
                <span>{t('nextStep')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold transition-all text-sm sm:text-base shadow-lg shadow-green-700/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{t('saving')}</span>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>{t('finishSetup')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
