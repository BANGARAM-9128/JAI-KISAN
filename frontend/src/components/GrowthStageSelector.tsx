import React from 'react';
import { GrowthStage } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { Leaf, Sprout, Flower2, Apple, Scissors, Warehouse } from 'lucide-react';

interface StageOption {
  value: GrowthStage;
  labelEn: string;
  labelTe: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const GROWTH_STAGES: StageOption[] = [
  { value: 'sowing', labelEn: 'Sowing / Seedling', labelTe: 'విత్తనం నాటే దశ', icon: Leaf },
  { value: 'vegetative', labelEn: 'Vegetative Growth', labelTe: 'శాఖీయ పెరుగుదల', icon: Sprout },
  { value: 'flowering', labelEn: 'Flowering Stage', labelTe: 'పూత దశ', icon: Flower2 },
  { value: 'fruiting', labelEn: 'Fruiting / Grain Fill', labelTe: 'కాయలు / గింజ దశ', icon: Apple },
  { value: 'harvesting', labelEn: 'Harvesting', labelTe: 'కోత దశ', icon: Scissors },
  { value: 'post_harvest', labelEn: 'Post-Harvest / Storage', labelTe: 'కోత అనంతర పనులు', icon: Warehouse },
];

interface GrowthStageSelectorProps {
  value: GrowthStage;
  onChange: (stage: GrowthStage) => void;
  label?: string;
}

export const GrowthStageSelector: React.FC<GrowthStageSelectorProps> = ({
  value,
  onChange,
  label,
}) => {
  const { language } = useTranslation();

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-stone-700">
          {label}
        </label>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {GROWTH_STAGES.map((stage) => {
          const isSelected = value === stage.value;
          const Icon = stage.icon;

          return (
            <button
              key={stage.value}
              type="button"
              onClick={() => onChange(stage.value)}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                isSelected
                  ? 'bg-green-50 border-green-600 ring-2 ring-green-600/20 text-green-950 font-bold'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div
                className={`p-2 rounded-lg flex-shrink-0 ${
                  isSelected ? 'bg-green-600 text-white' : 'bg-stone-100 text-stone-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-bold truncate">
                  {language === 'te' ? stage.labelTe : stage.labelEn}
                </p>
                <p className="text-[11px] text-stone-400 truncate">
                  {language === 'te' ? stage.labelEn : stage.labelTe}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
