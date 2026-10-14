import { describe, it, expect } from 'vitest';
import { en } from '../i18n/en';
import { te } from '../i18n/te';

describe('i18n Translation Dictionary Completeness', () => {
  it('Telugu dictionary has all keys defined in English dictionary', () => {
    const enKeys = Object.keys(en);
    const teKeys = Object.keys(te);

    const missingInTe = enKeys.filter(k => !(k in te));
    expect(missingInTe).toEqual([]);
  });

  it('No empty strings exist for critical agricultural terms in Telugu', () => {
    expect(te.appName).toBe('జై కిసాన్');
    expect(te.appName.length).toBeGreaterThan(0);
    expect(te.navForecast).toBe('వాతావరణ సూచన');
    expect(te.navAdvisories).toBe('పంట సలహాలు');
    expect(te.navCrops).toBe('నా పంటలు');
  });
});
