import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportJSON, importJSONFile } from '../utils/exportImport';
import type { CharacterSheet } from '../types';

const makeValidCharacter = (name = 'Test'): CharacterSheet => ({
  id: 'x',
  meta: {
    name, visibleAge: '', trueAge: '', embraceDate: '', nostalgia: '1980s',
    type: 'vampire_neonate', clan: 'brujah', clanBane: '', generation: '13',
    modifier: '1', archetype: '', sire: '', sireType: '', sireDiscipline: '',
  },
  attributes: {
    physical: { strength: 1, dexterity: 1, stamina: 1 },
    social: { charisma: 1, manipulation: 1, composure: 1 },
    mental: { intelligence: 1, wits: 1, resolve: 1 },
  },
  vitae: { current: 5, max: 11 },
  willpower: { current: 5, max: 7 },
  bloodSurge: 0,
  humanity: { path: 4, beast: 0, natureCounter: 0 },
  skills: {},
  resources: [],
  items: '', notes: '', biography: '',
  disciplines: [], lifePaths: [], clanTraits: '', merits: '', flaws: '',
  nature: { indulgence: '', flash: '' },
  beast: { clanBeast: '', rage: '' },
  powerPages: [],
} as any);

// ---------- exportJSON ----------

describe('exportJSON', () => {
  let createdEl: HTMLAnchorElement;
  let createElementSpy: any;

  beforeEach(() => {
    createdEl = document.createElement('a');
    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'a') return createdEl;
      return document.createElement.bind(document)(tag) as unknown as HTMLElement;
    }) as any);
    createdEl.click = vi.fn();
    if (!(URL as any).createObjectURL) {
      (URL as any).createObjectURL = vi.fn(() => 'blob:mock');
    }
    if (!(URL as any).revokeObjectURL) {
      (URL as any).revokeObjectURL = vi.fn();
    }
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('creates download link with sanitized name', () => {
    exportJSON(makeValidCharacter('Bad<Name>/"'));
    expect(createdEl.download).toBe('VTM6E_Bad_Name_.json');
    expect(createdEl.click).toHaveBeenCalled();
  });

  it('falls back to Character for empty name', () => {
    exportJSON(makeValidCharacter(''));
    expect(createdEl.download).toBe('VTM6E_Character.json');
  });
});

// ---------- importJSONFile ----------

const runImport = (file: File): Promise<{ type: 'success' | 'error'; value: any }> =>
  new Promise((resolve) => {
    importJSONFile(
      file,
      (data) => resolve({ type: 'success', value: data }),
      (msg) => resolve({ type: 'error', value: msg })
    );
  });

describe('importJSONFile — real FileReader (jsdom)', () => {
  it('calls onSuccess with valid single character', async () => {
    const data = makeValidCharacter();
    const file = new File([JSON.stringify(data)], 'test.json', { type: 'application/json' });

    const result = await runImport(file);

    expect(result.type).toBe('success');
    expect(Array.isArray(result.value)).toBe(false);
    expect((result.value as CharacterSheet).meta.name).toBe('Test');
  });

  it('calls onSuccess with valid array of characters', async () => {
    const arr = [makeValidCharacter('A'), makeValidCharacter('B')];
    const file = new File([JSON.stringify(arr)], 'test.json', { type: 'application/json' });

    const result = await runImport(file);

    expect(result.type).toBe('success');
    expect(Array.isArray(result.value)).toBe(true);
    expect((result.value as CharacterSheet[]).length).toBe(2);
  });

  it('calls onError with invalid JSON', async () => {
    const file = new File(['{ not valid json'], 'test.json', { type: 'application/json' });

    const result = await runImport(file);

    expect(result.type).toBe('error');
    expect(typeof result.value).toBe('string');
  });

  it('calls onError with invalid structure', async () => {
    const file = new File(['{"foo":"bar"}'], 'test.json', { type: 'application/json' });

    const result = await runImport(file);

    expect(result.type).toBe('error');
    expect(String(result.value)).toMatch(/листа персонажа/i);
  });
});
