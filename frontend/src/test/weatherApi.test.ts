import { describe, it, expect } from 'vitest';
import { getWeatherCodeDescription } from '../services/weatherApi';

describe('weatherApi - getWeatherCodeDescription', () => {
  it('correctly maps WMO code 0 to Clear Sky in English and Telugu', () => {
    const desc = getWeatherCodeDescription(0);
    expect(desc.textEn).toBe('Clear Sky');
    expect(desc.textTe).toBe('నిర్మలమైన ఆకాశం');
  });

  it('correctly maps WMO code 65 to Heavy Rain', () => {
    const desc = getWeatherCodeDescription(65);
    expect(desc.textEn).toBe('Heavy Rain');
    expect(desc.textTe).toBe('భారీ వర్షం');
  });

  it('correctly maps WMO code 95 to Thunderstorm', () => {
    const desc = getWeatherCodeDescription(95);
    expect(desc.textEn).toBe('Thunderstorm');
    expect(desc.textTe).toBe('ఉరుములతో కూడిన వర్షం');
  });

  it('defaults unknown codes safely to Fair Weather', () => {
    const desc = getWeatherCodeDescription(999);
    expect(desc.textEn).toBe('Fair Weather');
    expect(desc.textTe).toBe('అనుకూల వాతావరణం');
  });
});
