import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

export interface CropOption {
  nameEn: string;
  nameTe: string;
}

export const COMMON_CROPS: CropOption[] = [
  { nameEn: 'Paddy (Rice)', nameTe: 'వరి (వరి ధాన్యం)' },
  { nameEn: 'Cotton', nameTe: 'పత్తి' },
  { nameEn: 'Chilli', nameTe: 'మిరప' },
  { nameEn: 'Maize (Corn)', nameTe: 'మొక్కజొన్న' },
  { nameEn: 'Groundnut', nameTe: 'వేరుశనగ' },
  { nameEn: 'Red Gram (Pigeon Pea)', nameTe: 'కంది' },
  { nameEn: 'Bengal Gram (Chickpea)', nameTe: 'శనగ' },
  { nameEn: 'Soybean', nameTe: 'సోయాబీన్' },
  { nameEn: 'Sugarcane', nameTe: 'చెరకు' },
  { nameEn: 'Tomato', nameTe: 'టమోటా' },
  { nameEn: 'Turmeric', nameTe: 'పసుపు' },
  { nameEn: 'Mango', nameTe: 'మామిడి' },
];

interface CropSelectorProps {
  selectedCrop: string;
  onChange: (crop: CropOption) => void;
  label?: string;
  error?: string;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  selectedCrop,
  onChange,
  label,
  error,
}) => {
  const { language, t } = useTranslation();

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-stone-700">
          {label}
        </label>
      )}

      {/* Select Dropdown */}
      <select
        value={selectedCrop}
        onChange={(e) => {
          const opt = COMMON_CROPS.find((c) => c.nameEn === e.target.value);
          if (opt) onChange(opt);
        }}
        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm md:text-base transition-colors"
      >
        <option value="">{language === 'te' ? '-- పంటను ఎంచుకోండి --' : '-- Select Crop --'}</option>
        {COMMON_CROPS.map((crop) => (
          <option key={crop.nameEn} value={crop.nameEn}>
            {language === 'te' ? `${crop.nameTe} (${crop.nameEn})` : `${crop.nameEn} (${crop.nameTe})`}
          </option>
        ))}
      </select>

      {/* Quick Select Chips */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {COMMON_CROPS.slice(0, 5).map((crop) => {
          const isSelected = selectedCrop === crop.nameEn;
          return (
            <button
              key={crop.nameEn}
              type="button"
              onClick={() => onChange(crop)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                isSelected
                  ? 'bg-green-700 text-white border-green-700 font-semibold'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {language === 'te' ? crop.nameTe : crop.nameEn}
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
