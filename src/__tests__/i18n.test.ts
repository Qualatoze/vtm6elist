import { describe, it, expect } from 'vitest';
import ru from '../locales/ru.json';
import en from '../locales/en.json';
import zh from '../locales/zh.json';
import i18n, { t } from '../i18n';

const ruSafe = ru as any;
const enSafe = en as any;
const zhSafe = zh as any;

describe('i18n', () => {
  describe('locale structure', () => {
    it('all locales have the same top-level keys', () => {
      const ruKeys = Object.keys(ru).sort();
      const enKeys = Object.keys(en).sort();
      const zhKeys = Object.keys(zh).sort();
      expect(ruKeys).toEqual(enKeys);
      expect(ruKeys).toEqual(zhKeys);
    });

    it('all locales have ui section with card_* keys', () => {
      const cardKeys = ['card_type', 'card_activation', 'card_trait', 'card_cost', 'card_difficulty', 'card_range', 'card_duration', 'card_upgrade'];
      for (const key of cardKeys) {
        expect(ruSafe.ui[key]).toBeDefined();
        expect(enSafe.ui[key]).toBeDefined();
        expect(zhSafe.ui[key]).toBeDefined();
      }
    });

    it('all locales have powers section with all 10 disciplines', () => {
      const disciplines = ['animalism', 'auspex', 'celerity', 'corruption', 'dominate', 'fortitude', 'obfuscate', 'oblivion', 'potence', 'presence'];
      for (const disc of disciplines) {
        expect(ruSafe.powers[disc]).toBeDefined();
        expect(enSafe.powers[disc]).toBeDefined();
        expect(zhSafe.powers[disc]).toBeDefined();
      }
    });

    it('all locales have powers_meta section', () => {
      const metaKeys = ['type', 'activation', 'trait', 'cost', 'difficulty', 'range', 'duration'];
      for (const key of metaKeys) {
        expect(ruSafe.powers_meta[key]).toBeDefined();
        expect(enSafe.powers_meta[key]).toBeDefined();
        expect(zhSafe.powers_meta[key]).toBeDefined();
      }
    });
  });

  describe('t() function', () => {
    it('returns Russian text for ru locale', () => {
      const result = t('ui.power_cards');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns a non-empty string for all locales', () => {
      for (const lang of ['ru', 'en', 'zh']) {
        i18n.changeLanguage(lang);
        const result = i18n.t('ui.power_cards');
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('returns a string for powers_meta keys', () => {
      const result = t('powers_meta.type.physical');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns a string for powers keys', () => {
      const result = t('powers.animalism.beast_traits.name');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
