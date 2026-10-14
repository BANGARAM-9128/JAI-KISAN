import React, { useState } from 'react';
import { LocationInfo } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { MapPin, Navigation, Check, AlertCircle } from 'lucide-react';

interface LocationPickerProps {
  value: LocationInfo;
  onChange: (loc: LocationInfo) => void;
}

const TELANGANA_DISTRICTS = [
  'Warangal (వరంగల్)',
  'Karimnagar (కరీంనగర్)',
  'Nalgonda (నల్గొండ)',
  'Khammam (ఖమ్మం)',
  'Nizamabad (నిజామాబాద్)',
  'Mahabubnagar (మహబూబ్‌నగర్)',
  'Adilabad (ఆదిలాబాద్)',
  'Medak (మెదక్)',
  'Rangareddy (రంగారెడ్డి)',
  'Suryapet (సూర్యాపేట)',
];

const AP_DISTRICTS = [
  'Guntur (గుంటూరు)',
  'Krishna (కృష్ణా)',
  'East Godavari (తూర్పు గోదావరి)',
  'West Godavari (పశ్చిమ గోదావరి)',
  'Kurnool (కర్నూలు)',
  'Anantapur (అనంతపురం)',
  'Chittoor (చిత్తూరు)',
  'Prakasam (ప్రకాశం)',
  'Nellore (నెల్లూరు)',
  'Visakhapatnam (విశాఖపట్నం)',
];

export const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
  const { language, t } = useTranslation();
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleGetCoordinates = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setLocationSuccess(true);
        onChange({
          ...value,
          latitude: Number(position.coords.latitude.toFixed(4)),
          longitude: Number(position.coords.longitude.toFixed(4)),
          village: value.village || 'Local Farm GPS',
        });
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        setGeoError(t('locationPermissionDenied'));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const isTelangana = value.state.toLowerCase().includes('telangana');
  const districtList = isTelangana ? TELANGANA_DISTRICTS : AP_DISTRICTS;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-stone-800 text-base md:text-lg">
            {t('location')}
          </h3>
        </div>

        {/* GPS Quick Button */}
        <button
          type="button"
          onClick={handleGetCoordinates}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-800 text-xs md:text-sm font-semibold transition-colors border border-green-200"
        >
          {locationSuccess ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          )}
          <span>{isLocating ? t('fetchingLocation') : t('useCurrentLocation')}</span>
        </button>
      </div>

      {geoError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            {t('stateLabel')}
          </label>
          <select
            value={value.state}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-500"
          >
            <option value="Telangana">తెలంగాణ (Telangana)</option>
            <option value="Andhra Pradesh">ఆంధ్రప్రదేశ్ (Andhra Pradesh)</option>
            <option value="Karnataka">కర్ణాటక (Karnataka)</option>
            <option value="Maharashtra">మహారాష్ట్ర (Maharashtra)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            {t('districtLabel')}
          </label>
          <input
            type="text"
            list="districts"
            value={value.district}
            onChange={(e) => onChange({ ...value, district: e.target.value })}
            placeholder="e.g. Warangal / వరంగల్"
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-500"
          />
          <datalist id="districts">
            {districtList.map((d, i) => (
              <option key={i} value={d} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            {t('mandalLabel')}
          </label>
          <input
            type="text"
            value={value.mandal || ''}
            onChange={(e) => onChange({ ...value, mandal: e.target.value })}
            placeholder="e.g. Dharmasagar / ధర్మసాగర్"
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            {t('villageLabel')}
          </label>
          <input
            type="text"
            value={value.village || ''}
            onChange={(e) => onChange({ ...value, village: e.target.value })}
            placeholder="e.g. Dharmasagar / గ్రామం పేరు"
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Lat/Lon Readout */}
      <div className="pt-2 text-xs text-stone-500 flex flex-wrap gap-4 border-t border-stone-100">
        <span>GPS Lat: <strong className="text-stone-700">{value.latitude}</strong></span>
        <span>GPS Lon: <strong className="text-stone-700">{value.longitude}</strong></span>
      </div>
    </div>
  );
};
