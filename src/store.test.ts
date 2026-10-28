import { describe, it, expect } from 'vitest';

import { normalizeHistory } from './utils/migrate';

describe('normalizeHistory (migration)', () => {
  it('drops items without any changes field', () => {
    const out = normalizeHistory([
      { id: 'h1', timestamp: 1 },
      { id: 'h2', timestamp: 2, changes: undefined },
      { id: 'h3', timestamp: 3, changes: [] },
      { id: 'h4', timestamp: 4, changes: ['ok'] },
    ]);
    expect(out.length).toBe(1);
    expect(out[0].id).toBe('h4');
    expect(out[0].changes).toEqual(['ok']);
  });

  it('migrates changes: string → [string]', () => {
    const out = normalizeHistory([
      { id: 'x', timestamp: 1, changes: 'single string' },
    ]);
    expect(out).toEqual([{ id: 'x', timestamp: 1, changes: ['single string'] }]);
  });

  it('migrates old change: string field', () => {
    const out = normalizeHistory([
      { id: 'x', timestamp: 1, change: 'old format' },
    ]);
    expect(out[0].changes).toEqual(['old format']);
  });

  it('migrates old text: string field', () => {
    const out = normalizeHistory([
      { id: 'x', timestamp: 1, text: 'very old format' },
    ]);
    expect(out[0].changes).toEqual(['very old format']);
  });

  it('generates missing id / timestamp', () => {
    const out = normalizeHistory([{ changes: ['a'] }]);
    expect(typeof out[0].id).toBe('string');
    expect(out[0].id.length).toBeGreaterThan(0);
    expect(typeof out[0].timestamp).toBe('number');
  });

  it('respects 50-item limit', () => {
    const many = Array.from({ length: 100 }, (_, i) => ({
      id: `h${i}`, timestamp: i, changes: [`change ${i}`],
    }));
    expect(normalizeHistory(many).length).toBe(50);
  });

  it('returns empty array for non-array input', () => {
    expect(normalizeHistory(null)).toEqual([]);
    expect(normalizeHistory(undefined)).toEqual([]);
    expect(normalizeHistory('not an array')).toEqual([]);
  });

  it('filters non-string entries in changes array', () => {
    const out = normalizeHistory([
      { id: 'x', timestamp: 1, changes: ['ok', 42, null, '', 'ok2'] },
    ]);
    expect(out[0].changes).toEqual(['ok', 'ok2']);
  });
});
