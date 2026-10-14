import { describe, it, expect, beforeEach } from 'vitest';
import { cropApi } from '../services/cropApi';

describe('cropApi Local Simulation & Cache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves default sample crops when localStorage is unpopulated', async () => {
    const crops = await cropApi.getCrops();
    expect(Array.isArray(crops)).toBe(true);
    expect(crops.length).toBeGreaterThan(0);
  });

  it('adds a new crop and persists it to simulated storage', async () => {
    const newCrop = await cropApi.addCrop({
      name: 'Rice (Paddy)',
      name_te: 'వరి',
      variety: 'BPT 5204 (Samba Mahsuri)',
      growth_stage: 'vegetative',
      sowing_date: '2026-07-01',
      field_area_acres: 3.5,
    });

    expect(newCrop.id).toBeDefined();
    expect(newCrop.name).toBe('Rice (Paddy)');

    const updatedCrops = await cropApi.getCrops();
    const found = updatedCrops.find(c => c.id === newCrop.id);
    expect(found).toBeDefined();
    expect(found?.variety).toBe('BPT 5204 (Samba Mahsuri)');
  });

  it('updates an existing crop growth stage', async () => {
    const crops = await cropApi.getCrops();
    const targetCrop = crops[0];

    const updated = await cropApi.updateCrop(targetCrop.id, {
      growth_stage: 'flowering',
    });

    expect(updated.growth_stage).toBe('flowering');
  });
});
