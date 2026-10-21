import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CharacterSheet, SKILLS_LIST, CLAN_DATA, VAMPIRE_TYPES, NOSTALGIA_DECADES } from './types';

const generateId = () => crypto.randomUUID();

const initialSkills: Record<string, { dots: number; specifications: [string, string, string] }> =
  SKILLS_LIST.reduce((acc, skill) => ({ ...acc, [skill]: { dots: 0, specifications: ['', '', ''] } }), {});

export const createEmptyCharacter = (): CharacterSheet => ({
  id: generateId(),
  meta: {
    name: '', visibleAge: '', trueAge: '', embraceDate: '', nostalgia: '1980-е', type: 'Вампир (неонат)',
    clan: '', clanBane: '', generation: '13-е', modifier: '1', archetype: '', sire: '', sireType: '', sireDiscipline: ''
  },
  attributes: {
    physical: { strength: 1, dexterity: 1, stamina: 1 },
    social: { charisma: 1, manipulation: 1, composure: 1 },
    mental: { intelligence: 1, wits: 1, resolve: 1 }
  },
  vitae: { current: 5, max: 11 },
  willpower: { current: 5, max: 7 },
  bloodSurge: 0,
  humanity: { path: 4, beast: 0, natureCounter: 0 },
  skills: { ...initialSkills },
  resources: [{ name: 'Богатство', dots: 0, squares: 0, notes: '' }],
  items: '',
  disciplines: Array.from({ length: 6 }).map((_, i) => ({ id: generateId(), name: '', dots: 0, powers: '' })),
  lifePaths: [], clanTraits: '', merits: '', flaws: '',
  nature: { indulgence: '', flash: '' },
  beast: { clanBeast: '', rage: '' },
  diary: []
});

interface CharacterStore {
  characters: CharacterSheet[];
  activeId: string;
  getActive: () => CharacterSheet;
  updateField: <K extends keyof CharacterSheet>(field: K, value: CharacterSheet[K]) => void;
  updateNested: <F extends keyof CharacterSheet>(field: F, nested: Partial<CharacterSheet[F]>) => void;
  updateMeta: (field: keyof CharacterSheet['meta'], value: string) => void;
  updateAttribute: (category: keyof CharacterSheet['attributes'], attr: string, value: number) => void;
  updateSkill: (skill: string, dots: number) => void;
  updateSpecification: (skill: string, index: 0 | 1 | 2, value: string) => void;
  updateVitae: (current: number) => void;
  updateWillpower: (current: number) => void;
  updateBloodSurge: (value: number) => void;
  resetBloodSurge: () => void;
  updateHumanity: (field: 'path' | 'beast' | 'natureCounter', value: number) => void;
  addResource: () => void;
  updateResource: (index: number, field: string, value: any) => void;
  removeResource: (index: number) => void;
  addDiscipline: () => void;
  updateDiscipline: (index: number, field: string, value: any) => void;
  removeDiscipline: (index: number) => void;
  updateLifePath: (index: number, value: string) => void;
  addDiaryEntry: (text: string) => void;
  removeDiaryEntry: (id: string) => void;
  loadCharacter: (data: CharacterSheet) => void;
  loadCharacters: (data: CharacterSheet[]) => void;
  resetActiveCharacter: () => void;
  switchCharacter: (id: string) => void;
  newCharacter: () => void;
  removeCharacter: (id: string) => void;
}

const updateActive = (state: CharacterStore, updater: (c: CharacterSheet) => CharacterSheet) => ({
  characters: state.characters.map(c => c.id === state.activeId ? updater(c) : c)
});

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      characters: [createEmptyCharacter()],
      activeId: '',

      getActive: () => {
        const { characters, activeId } = get();
        return characters.find(c => c.id === activeId) || characters[0];
      },

      updateField: (field, value) => set(state => updateActive(state, c => ({ ...c, [field]: value }))),

      updateNested: (field, nested) => set(state => updateActive(state, c => ({
        ...c, [field]: { ...((c[field] as any) || {}), ...nested }
      }))),

      // FIX: clan update — все мутации newMeta до создания newChar
      updateMeta: (field, value) => set(state => updateActive(state, c => {
        let newMeta = { ...c.meta, [field]: value };
        let newChar = { ...c, meta: newMeta };

        if (field === 'clan' && CLAN_DATA[value]) {
          const data = CLAN_DATA[value];
          // Мутация ДО создания newChar — гарантирует корректное значение в meta
          newMeta.clanBane = data.bane;
          newChar = { ...newChar, meta: newMeta };

          if (!newChar.beast.clanBeast || !newChar.beast.rage) {
            newChar.beast = { ...newChar.beast, clanBeast: data.beast, rage: data.rage };
          }

          if (c.disciplines.every(d => !d.name) && data.disciplines.length > 0) {
            newChar.disciplines = data.disciplines.map(name => ({ id: generateId(), name, dots: 0, powers: '' }));
          }
        }

        return newChar;
      })),

      updateAttribute: (category, attr, value) => set(state => updateActive(state, c => {
        const clampedValue = Math.max(0, Math.min(value, 10));
        const newAttrs = {
          ...c.attributes,
          [category]: { ...c.attributes[category], [attr]: clampedValue }
        };

        const stamina = newAttrs.physical.stamina;
        const composure = newAttrs.social.composure;
        const resolve = newAttrs.mental.resolve;
        const newMaxVitae = 10 + stamina;
        const newMaxWillpower = 5 + composure + resolve;

        return {
          ...c,
          attributes: newAttrs,
          vitae: { max: newMaxVitae, current: Math.min(c.vitae.current, newMaxVitae) },
          willpower: { max: newMaxWillpower, current: Math.min(c.willpower.current, newMaxWillpower) }
        };
      })),

      updateSkill: (skill, dots) => set(state => updateActive(state, c => ({
        ...c, skills: { ...c.skills, [skill]: { ...c.skills[skill], dots: Math.max(0, Math.min(dots, 5)) } }
      }))),

      updateSpecification: (skill, index, value) => set(state => updateActive(state, c => {
        const newSpecs = [...c.skills[skill].specifications];
        newSpecs[index] = value;
        return { ...c, skills: { ...c.skills, [skill]: { ...c.skills[skill], specifications: newSpecs as [string, string, string] } } };
      })),

      updateVitae: (current) => set(state => updateActive(state, c => ({
        ...c, vitae: { ...c.vitae, current: Math.max(0, Math.min(current, 20)) }
      }))),
      
      updateWillpower: (current) => set(state => updateActive(state, c => ({
        ...c, willpower: { ...c.willpower, current: Math.max(0, Math.min(current, 20)) }
      }))),

      updateBloodSurge: (value) => set(state => updateActive(state, c => ({
        ...c, bloodSurge: Math.max(0, Math.min(value, 5))
      }))),

      resetBloodSurge: () => set(state => updateActive(state, c => ({ ...c, bloodSurge: 0 }))),

      updateHumanity: (field, value) => set(state => updateActive(state, c => {
        let val = value;
        if (field === 'path') val = Math.max(0, Math.min(value, 7));
        else val = Math.max(0, Math.min(value, 5));
        return { ...c, humanity: { ...c.humanity, [field]: val } };
      })),

      addResource: () => set(state => updateActive(state, c => ({
        ...c, resources: [...c.resources, { name: '', dots: 0, squares: 0, notes: '' }]
      }))),

      updateResource: (index, field, value) => set(state => updateActive(state, c => {
        const r = [...c.resources];
        r[index] = { ...r[index], [field]: value };
        return { ...c, resources: r };
      })),

      removeResource: (index) => set(state => updateActive(state, c => ({
        ...c, resources: c.resources.filter((_, i) => i !== index)
      }))),

      addDiscipline: () => set(state => updateActive(state, c => ({
        ...c, disciplines: [...c.disciplines, { id: generateId(), name: '', dots: 0, powers: '' }]
      }))),

      updateDiscipline: (index, field, value) => set(state => updateActive(state, c => {
        const d = [...c.disciplines];
        d[index] = { ...d[index], [field]: value };
        return { ...c, disciplines: d };
      })),

      removeDiscipline: (index) => set(state => updateActive(state, c => ({
        ...c, disciplines: c.disciplines.filter((_, i) => i !== index)
      }))),

      updateLifePath: (index, value) => set(state => updateActive(state, c => {
        const lp = [...(c.lifePaths || [])];
        while (lp.length <= index) lp.push('');
        lp[index] = value;
        return { ...c, lifePaths: lp };
      })),

      addDiaryEntry: (text) => set(state => updateActive(state, c => ({
        ...c, diary: [{ id: generateId(), timestamp: Date.now(), text }, ...c.diary]
      }))),

      removeDiaryEntry: (id) => set(state => updateActive(state, c => ({
        ...c, diary: c.diary.filter(e => e.id !== id)
      }))),

      loadCharacter: (data) => set(state => {
        const withId = { ...data, id: data.id || generateId() };
        const exists = state.characters.find(c => c.id === withId.id);
        if (exists) {
          return { characters: state.characters.map(c => c.id === withId.id ? withId : c), activeId: withId.id };
        }
        return { characters: [...state.characters, withId], activeId: withId.id };
      }),

      loadCharacters: (data) => set(state => {
        const withIds = data.map(c => ({ ...c, id: c.id || generateId() }));
        return { characters: [...state.characters, ...withIds], activeId: withIds[0]?.id || state.activeId };
      }),

      resetActiveCharacter: () => set(state => updateActive(state, c => ({ ...createEmptyCharacter(), id: c.id }))),

      switchCharacter: (id) => set({ activeId: id }),

      newCharacter: () => {
        const c = createEmptyCharacter();
        set(state => ({ characters: [...state.characters, c], activeId: c.id }));
      },

      removeCharacter: (id) => set(state => {
        const remaining = state.characters.filter(c => c.id !== id);
        if (remaining.length === 0) {
          const c = createEmptyCharacter();
          return { characters: [c], activeId: c.id };
        }
        return { characters: remaining, activeId: state.activeId === id ? remaining[0].id : state.activeId };
      })
    }),
    {
      name: 'vtm6e-alpha-storage',
      onRehydrateStorage: () => (state) => {
        if (state && (!state.characters || state.characters.length === 0)) {
          const c = createEmptyCharacter();
          state.characters = [c];
          state.activeId = c.id;
        } else if (state && !state.characters.find(c => c.id === state.activeId)) {
          state.activeId = state.characters[0].id;
        }
      }
    }
  )
);
