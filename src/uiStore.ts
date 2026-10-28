// Глобальный UI-стор: мобильный вид (ручной тумблер) и разблокировка лимитов.
// unlockAttributes — для Характеристик (поколение), unlockSkills — для Навыков (неонат).
// Оба флага persist в localStorage. Не путать mobileMode с определением
// реального мобильного устройства — для PDF pixelRatio остаётся isMobileDevice() (T4).

import { create } from 'zustand';
import { safeStorage } from './utils/storage';

interface UIStore {
  mobileMode: boolean;
  unlockAttributes: boolean;
  unlockSkills: boolean;
  setMobileMode: (v: boolean) => void;
  setUnlockAttributes: (v: boolean) => void;
  setUnlockSkills: (v: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  mobileMode: safeStorage.get('vtm6e-mobile') === 'true',
  unlockAttributes: safeStorage.get('vtm6e-unlock-attrs') === 'true',
  unlockSkills: safeStorage.get('vtm6e-unlock-skills') === 'true',

  setMobileMode: (v) => {
    safeStorage.set('vtm6e-mobile', String(v));
    set({ mobileMode: v });
  },
  setUnlockAttributes: (v) => {
    safeStorage.set('vtm6e-unlock-attrs', String(v));
    set({ unlockAttributes: v });
  },
  setUnlockSkills: (v) => {
    safeStorage.set('vtm6e-unlock-skills', String(v));
    set({ unlockSkills: v });
  },
}));
