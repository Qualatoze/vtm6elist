import { safeStorage } from './storage';

interface DebouncedStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const DEBOUNCE_MS = 400;

export const debouncedStorage: DebouncedStorage = (() => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingKey: string | null = null;
  let pendingValue: string | null = null;

  const flush = () => {
    if (pendingKey !== null && pendingValue !== null) {
      safeStorage.set(pendingKey, pendingValue);
    }
    pendingKey = null;
    pendingValue = null;
    timer = null;
  };

  return {
    getItem(key: string): Promise<string | null> {
      return Promise.resolve(safeStorage.get(key));
    },
    setItem(key: string, value: string): Promise<void> {
      pendingKey = key;
      pendingValue = value;
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, DEBOUNCE_MS);
      return Promise.resolve();
    },
    removeItem(key: string): Promise<void> {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      pendingKey = null;
      pendingValue = null;
      safeStorage.remove(key);
      return Promise.resolve();
    },
  };
})();
