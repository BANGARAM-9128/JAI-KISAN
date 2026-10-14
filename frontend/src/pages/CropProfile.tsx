import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../contexts/LanguageContext';
import { cropApi } from '../services/cropApi';
import { CropSelector, COMMON_CROPS } from '../components/CropSelector';
import { GrowthStageSelector, GROWTH_STAGES } from '../components/GrowthStageSelector';
import { EmptyState } from '../components/EmptyState';
import { Crop, GrowthStage } from '../types';
import { 
  Sprout, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Maximize2, 
  X, 
  Check, 
  Layers 
} from 'lucide-react';

export const CropProfile: React.FC = () => {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCropId, setEditingCropId] = useState<string | null>(null);

  // Form State
  const [cropName, setCropName] = useState('Paddy (Rice)');
  const [cropNameTe, setCropNameTe] = useState('వరి (వరి ధాన్యం)');
  const [variety, setVariety] = useState('');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [growthStage, setGrowthStage] = useState<GrowthStage>('vegetative');
  const [fieldArea, setFieldArea] = useState<number>(2.0);
  const [notes, setNotes] = useState('');

  const { data: crops = [], isLoading } = useQuery({
    queryKey: ['crops'],
    queryFn: () => cropApi.getCrops(),
  });

  const addMutation = useMutation({
    mutationFn: (newCrop: Omit<Crop, 'id' | 'created_at'>) => cropApi.addCrop(newCrop),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Crop> }) =>
      cropApi.updateCrop(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cropApi.deleteCrop(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crops'] }),
  });

  const openAddModal = () => {
    setEditingCropId(null);
    setCropName('Paddy (Rice)');
    setCropNameTe('వరి (వరి ధాన్యం)');
    setVariety('');
    setSowingDate(new Date().toISOString().split('T')[0]);
    setGrowthStage('vegetative');
    setFieldArea(2.0);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (crop: Crop) => {
    setEditingCropId(crop.id);
    setCropName(crop.name);
    setCropNameTe(crop.name_te);
    setVariety(crop.variety || '');
    setSowingDate(crop.sowing_date || new Date().toISOString().split('T')[0]);
    setGrowthStage(crop.growth_stage);
    setFieldArea(crop.fieldArea_acres || 1.0);
    setNotes(crop.notes || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCropId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCropId) {
      updateMutation.mutate({
        id: editingCropId,
        updates: {
          name: cropName,
          name_te: cropNameTe,
          variety,
          sowing_date: sowingDate,
          growth_stage: growthStage,
          fieldArea_acres: fieldArea,
          notes,
        },
      });
    } else {
      addMutation.mutate({
        name: cropName,
        name_te: cropNameTe,
        variety,
        sowing_date: sowingDate,
        growth_stage: growthStage,
        fieldArea_acres: fieldArea,
        notes,
      });
    }
  };

  const getStageLabel = (stage: GrowthStage) => {
    const s = GROWTH_STAGES.find((st) => st.value === stage);
    if (!s) return stage;
    return language === 'te' ? s.labelTe : s.labelEn;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            {t('myCropsTitle')}
          </h1>
          <p className="text-sm text-stone-500">
            {t('myCropsSubtitle')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow-md shadow-green-700/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addNewCrop')}</span>
        </button>
      </div>

      {/* Crops Cards List */}
      {crops.length === 0 ? (
        <EmptyState
          title={t('noCropsYet')}
          description="Add your farm crops to receive tailored, weather-calibrated pest and irrigation advisories."
          actionText={t('addNewCrop')}
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {crops.map((crop) => (
            <div
              key={crop.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-card hover:shadow-card-hover transition-all p-5 sm:p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-green-50 border border-green-200 text-green-700 flex items-center justify-center">
                      <Sprout className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-stone-900 leading-snug">
                        {language === 'te' ? crop.name_te : crop.name}
                      </h2>
                      {crop.variety && (
                        <p className="text-xs text-stone-500 font-medium">
                          {crop.variety}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(crop)}
                      className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                      title={t('edit')}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('confirmDeleteCrop'))) {
                          deleteMutation.mutate(crop.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stage Progress Pill */}
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-stone-400 tracking-wider block">
                    {t('growthStage')}
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-600"></span>
                    <span>{getStageLabel(crop.growth_stage)}</span>
                  </div>
                </div>

                {/* Area & Sowing Date */}
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-1">
                  <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{crop.sowing_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl">
                    <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>{crop.fieldArea_acres || '--'} {language === 'te' ? 'ఎకరాలు' : 'Acres'}</span>
                  </div>
                </div>

                {crop.notes && (
                  <p className="text-xs text-stone-500 italic line-clamp-2">
                    "{crop.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Crop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-xl font-bold text-stone-900">
                {editingCropId ? t('edit') : t('addNewCrop')}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <CropSelector
                selectedCrop={cropName}
                onChange={(crop) => {
                  setCropName(crop.nameEn);
                  setCropNameTe(crop.nameTe);
                }}
                label={t('cropName')}
              />

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {t('cropVariety')}
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. BPT 5204 / Hybrid 102"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    {t('sowingDate')}
                  </label>
                  <input
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    {t('fieldArea')}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={fieldArea}
                    onChange={(e) => setFieldArea(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              <GrowthStageSelector
                value={growthStage}
                onChange={setGrowthStage}
                label={t('growthStage')}
              />

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  {language === 'te' ? 'గమనికలు (ఐచ్ఛికం)' : 'Field Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Panicle initiation observed"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold shadow-md shadow-green-700/20 disabled:opacity-50"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
