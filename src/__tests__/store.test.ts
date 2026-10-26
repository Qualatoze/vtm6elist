import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEmptyCharacter, useCharacterStore } from '../store';
import { SKILLS_LIST } from '../types';

describe('createEmptyCharacter', () => {
  it('creates a character with default values', () => {
    const char = createEmptyCharacter();
    expect(char.id).toBeDefined();
    expect(char.meta.name).toBe('');
    expect(char.attributes.physical.strength).toBe(1);
    expect(char.vitae.current).toBe(5);
    expect(char.vitae.max).toBe(11);
    expect(char.willpower.current).toBe(5);
    expect(char.willpower.max).toBe(7);
    expect(char.bloodSurge).toBe(0);
    expect(char.humanity.path).toBe(4);
  });

  it('has all skills initialized with 0 dots', () => {
    const char = createEmptyCharacter();
    expect(char.skills[SKILLS_LIST[0].id]).toBeDefined();
    expect(char.skills[SKILLS_LIST[0].id].dots).toBe(0);
    expect(char.skills[SKILLS_LIST[1].id].specifications[0]).toBe('');
  });
});

describe('loadCharacter — normalizeCharacter migration', () => {
  
  beforeEach(() => {
    // Reset store state between tests
    useCharacterStore.setState({ characters: [], activeId: '' });
  });

  it('migrates old card with Russian text to i18n keys', () => {
    const oldCard: any = {
      disciplineId: 'animalism',
      powerId: 'beast_traits',
      name: 'Beast Traits',
      rank: 1,
      type: 'Act',
      activation: 'Act',
      trait: 'Strength',
      cost: '1',
      difficulty: '2',
      range: 'Close',
      duration: 'Instant',
      description: 'Старые русские описания силы.',
      upgrade: 'Старые русские апгрейды.',
    };

    const char: any = {
      id: 'test-char-1',
      meta: { name: 'Test', type: 'vampire_neonate', clan: '', sireType: '', nostalgia: '1980s' },
      attributes: { physical: { strength: 1, dexterity: 1, stamina: 1 }, social: { charisma: 1, manipulation: 1, composure: 1 }, mental: { intelligence: 1, wits: 1, resolve: 1 } },
      skills: {},
      disciplines: [],
      humanity: { path: 4, beast: 0, natureCounter: 0 },
      beast: {},
      nature: {},
      lifePaths: [],
      resources: [],
      appliedLifePaths: [null, null, null, null, null, null, null, null],
      powerPages: [{ id: 'page-1', layout: 4, fontSize: 11, cards: [oldCard] }],
      vitae: { max: 11, current: 5 },
      willpower: { max: 7, current: 5 },
      bloodSurge: 0,
    };

    useCharacterStore.getState().loadCharacter(char);
    const loaded = useCharacterStore.getState().characters[0];

    const card = loaded.powerPages[0].cards[0];
    // Name should now be an i18n key (starts with 'powers.')
    expect(card.name).toMatch(/^powers\./);
    // Description should be an i18n key
    expect(card.description).toMatch(/^powers\./);
    // Upgrade should be an i18n key
    expect(card.upgrade).toMatch(/^powers\./);
    // Rank should be preserved from DISCIPLINE_POWERS
    expect(card.rank).toBe(1);
  });

  it('does not modify already-migrated card (name starts with powers.)', () => {
    const migratedCard: any = {
      id: 'card-1',
      disciplineId: 'animalism',
      powerId: 'beast_traits',
      name: 'powers.animalism.beast_traits.name',
      rank: 1,
      type: 'Act',
      activation: 'Act',
      trait: 'Strength',
      cost: '1',
      difficulty: '2',
      range: 'Close',
      duration: 'Instant',
      description: 'powers.animalism.beast_traits.description',
      upgrade: 'powers.animalism.beast_traits.upgrade',
    };

    const char: any = {
      id: 'test-char-2',
      meta: { name: 'Test', type: 'vampire_neonate', clan: '', sireType: '', nostalgia: '1980s' },
      attributes: { physical: { strength: 1, dexterity: 1, stamina: 1 }, social: { charisma: 1, manipulation: 1, composure: 1 }, mental: { intelligence: 1, wits: 1, resolve: 1 } },
      skills: {},
      disciplines: [],
      humanity: { path: 4, beast: 0, natureCounter: 0 },
      beast: {},
      nature: {},
      lifePaths: [],
      resources: [],
      appliedLifePaths: [null, null, null, null, null, null, null, null],
      powerPages: [{ id: 'page-1', layout: 4, fontSize: 11, cards: [migratedCard] }],
      vitae: { max: 11, current: 5 },
      willpower: { max: 7, current: 5 },
      bloodSurge: 0,
    };

    useCharacterStore.getState().loadCharacter(char);
    const loaded = useCharacterStore.getState().characters[0];

    const card = loaded.powerPages[0].cards[0];
    // Should remain unchanged
    expect(card.name).toBe('powers.animalism.beast_traits.name');
    expect(card.description).toBe('powers.animalism.beast_traits.description');
    expect(card.upgrade).toBe('powers.animalism.beast_traits.upgrade');
  });

  it('generates id for card without id', () => {
    const oldCard: any = {
      disciplineId: 'animalism',
      powerId: 'beast_traits',
      name: 'Beast Traits',
      rank: 1,
      type: 'Act',
      activation: 'Act',
      trait: 'Strength',
      cost: '1',
      difficulty: '2',
      range: 'Close',
      duration: 'Instant',
      description: 'Old text.',
      upgrade: 'Old upgrade.',
    };

    const char: any = {
      id: 'test-char-3',
      meta: { name: 'Test', type: 'vampire_neonate', clan: '', sireType: '', nostalgia: '1980s' },
      attributes: { physical: { strength: 1, dexterity: 1, stamina: 1 }, social: { charisma: 1, manipulation: 1, composure: 1 }, mental: { intelligence: 1, wits: 1, resolve: 1 } },
      skills: {},
      disciplines: [],
      humanity: { path: 4, beast: 0, natureCounter: 0 },
      beast: {},
      nature: {},
      lifePaths: [],
      resources: [],
      appliedLifePaths: [null, null, null, null, null, null, null, null],
      powerPages: [{ id: 'page-1', layout: 4, fontSize: 11, cards: [oldCard] }],
      vitae: { max: 11, current: 5 },
      willpower: { max: 7, current: 5 },
      bloodSurge: 0,
    };

    useCharacterStore.getState().loadCharacter(char);
    const loaded = useCharacterStore.getState().characters[0];
    
    const card = loaded.powerPages[0].cards[0];
    expect(card.id).toBeDefined();
    expect(card.id.length).toBeGreaterThan(0);
  });

  it('normalizes attributes to valid range', () => {
    const char: any = {
      id: 'test-char-4',
      meta: { name: 'Test', type: 'vampire_neonate', clan: '', sireType: '', nostalgia: '1980s' },
      attributes: { physical: { strength: 99, dexterity: -5, stamina: 3 }, social: { charisma: 10, manipulation: 0, composure: 2 }, mental: { intelligence: 7, wits: 1, resolve: 5 } },
      skills: {},
      disciplines: [],
      humanity: { path: 4, beast: 0, natureCounter: 0 },
      beast: {},
      nature: {},
      lifePaths: [],
      resources: [],
      appliedLifePaths: [null, null, null, null, null, null, null, null],
      powerPages: [{ id: 'page-1', layout: 4, fontSize: 11, cards: [] }],
      vitae: { max: 11, current: 5 },
      willpower: { max: 7, current: 5 },
      bloodSurge: 0,
    };

    useCharacterStore.getState().loadCharacter(char);
    const loaded = useCharacterStore.getState().characters[0];

    expect(loaded.attributes.physical.strength).toBe(10);
    expect(loaded.attributes.physical.dexterity).toBe(0);
    expect(loaded.attributes.social.charisma).toBe(10);
    expect(loaded.attributes.social.manipulation).toBe(0);
  });

  it('clamps vitae and willpower to valid ranges', () => {
    const char: any = {
      id: 'test-char-5',
      meta: { name: 'Test', type: 'vampire_neonate', clan: '', sireType: '', nostalgia: '1980s' },
      attributes: { physical: { strength: 1, dexterity: 1, stamina: 1 }, social: { charisma: 1, manipulation: 1, composure: 1 }, mental: { intelligence: 1, wits: 1, resolve: 1 } },
      skills: {},
      disciplines: [],
      humanity: { path: 4, beast: 0, natureCounter: 0 },
      beast: {},
      nature: {},
      lifePaths: [],
      resources: [],
      appliedLifePaths: [null, null, null, null, null, null, null, null],
      powerPages: [{ id: 'page-1', layout: 4, fontSize: 11, cards: [] }],
      vitae: { max: 99, current: 50 },
      willpower: { max: 99, current: 50 },
      bloodSurge: 99,
    };

    useCharacterStore.getState().loadCharacter(char);
    const loaded = useCharacterStore.getState().characters[0];

    expect(loaded.vitae.max).toBe(20);
    expect(loaded.willpower.max).toBe(15);
    expect(loaded.bloodSurge).toBe(5);
  });
});
