// ─── Migration helpers (pure functions, no side effects) ─────────
// Extracted from store.ts for testability.

import { HistoryItem } from '../types';

// ─── Migration: history from old saves ────────────────────────────
// Принимает всё, что угодно (undefined, string, number, массив строк,
// массив объектов, старые поля change/text), возвращает чистый HistoryItem[].
export const normalizeHistory = (raw: any): HistoryItem[] => {
  if (!Array.isArray(raw)) return [];
  const out: HistoryItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;

    const id = typeof item.id === 'string' && item.id
      ? item.id
      : (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `h-${Math.random().toString(36).slice(2)}`);

    const timestamp = typeof item.timestamp === 'number' && isFinite(item.timestamp)
      ? item.timestamp
      : Date.now();

    // Поддерживаем все известные формы:
    // - changes: string[]  (актуальная)
    // - changes: string    (возможно когда-то был singular)
    // - change:  string    (очень старый)
    // - text:    string    (совсем старый)
    let changes: string[] = [];
    if (Array.isArray(item.changes)) {
      changes = item.changes
        .filter((c: any) => typeof c === 'string' && c.trim().length > 0);
    } else if (typeof item.changes === 'string' && item.changes.trim()) {
      changes = [item.changes];
    } else if (typeof item.change === 'string' && item.change.trim()) {
      changes = [item.change];
    } else if (typeof item.text === 'string' && item.text.trim()) {
      changes = [item.text];
    }

    // Полностью пустые записи выкидываем — от них нет пользы, только шум.
    if (changes.length === 0) continue;

    out.push({ id, timestamp, changes });
  }
  // Лимит 50 — как в pushHistory
  return out.slice(0, 50);
};
