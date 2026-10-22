import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CharacterSheet, SKILLS_LIST, CLAN_DATA, VAMPIRE_TYPES, NOSTALGIA_DECADES, GENERATION_TO_MODIFIER, VAMPIRE_TYPE_TO_GENERATION, SIRE_TYPE_TO_DISCIPLINE, NATURE_TO_FLASH, MORTAL_LIFE_PATHS, VAMPIRE_LIFE_PATHS } from './types';

const generateId = () => crypto.randomUUID();

const initialSkills: Record<string, { dots: number; specifications: [string, string, string] }> =
  SKILLS_LIST.reduce((acc, skill) => ({ ...acc, [skill]: { dots: 0, specifications: ['', '', ''] } }), {});

const normalizeDiscipline = (d: any) => ({
  id: d.id || generateId(),
  name: d.name || '',
  dots: d.dots || 0,
  powersList: (d.powersList || (d.powers ? [d.powers, '', '', '', ''] : ['', '', '', '', ''])) as [string, string, string, string, string],
});

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
  disciplines: Array.from({ length: 6 }).map((_, i) => ({ id: generateId(), name: '', dots: 0, powersList: ['', '', '', '', ''] as [string, string, string, string, string] })),
  lifePaths: [], clanTraits: '', merits: '', flaws: '', notes: '',
  nature: { indulgence: '', flash: '' },
  beast: { clanBeast: '', rage: '' },
  appliedLifePaths: [null, null, null, null, null, null, null, null],
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
  updateDisciplinePower: (index: number, lineIndex: 0 | 1 | 2 | 3 | 4, value: string) => void;
  removeDiscipline: (index: number) => void;
  updateLifePath: (index: number, value: string) => void;
  applyLifePath: (index: number, pathName: string) => void;
  addDiaryEntry: (text: string) => void;
  removeDiaryEntry: (id: string) => void;
  loadCharacter: (data: CharacterSheet) => void;
  loadCharacters: (data: CharacterSheet[]) => void;
  resetActiveCharacter: () => void;
  switchCharacter: (id: string) => void;
  newCharacter: () => void;
  removeCharacter: (id: string) => void;
}

const updateActive = (state: CharacterStore, updater: (c: CharacterSheet) => CharacterSheet) => {
  const activeChar = state.characters.find(c => c.id === state.activeId) || state.characters[0];
  return {
    characters: state.characters.map(c => c.id === activeChar.id ? updater(c) : c)
  };
};

const normalizeCharacter = (c: CharacterSheet): CharacterSheet => ({
  ...c,
  id: c.id || generateId(),
  disciplines: (c.disciplines || []).map(normalizeDiscipline),
  skills: Object.fromEntries(
    SKILLS_LIST.map(skill => {
      const s = c.skills?.[skill];
      return [skill, {
        dots: s?.dots ?? 0,
        specifications: [
          s?.specifications?.[0] || '',
          s?.specifications?.[1] || '',
          s?.specifications?.[2] || '',
        ] as [string, string, string],
      }];
    })
  ),
  lifePaths: c.lifePaths || [],
  resources: c.resources || [],
  appliedLifePaths: c.appliedLifePaths || [null, null, null, null, null, null, null, null],
  vitae: {
    max: c.vitae?.max ?? 11,
    current: Math.min(c.vitae?.current ?? 0, c.vitae?.max ?? 11)
  },
  willpower: {
    max: c.willpower?.max ?? 7,
    current: Math.min(c.willpower?.current ?? 0, c.willpower?.max ?? 7)
  }
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

      updateNested: (field, nested) => set(state => updateActive(state, c => {
        const updated = { ...((c[field] as any) || {}), ...nested };

        // === АВТОЗАПОЛНЕНИЕ: НАТУРА → ВСПЫШКА ===
        if (field === 'nature') {
          const natureNested = nested as { indulgence?: string };
          if (natureNested.indulgence !== undefined) {
            const oldAutoFlash = NATURE_TO_FLASH[c.nature?.indulgence];
            const isUntouched = !c.nature?.flash || c.nature.flash === oldAutoFlash;
            const newFlash = NATURE_TO_FLASH[natureNested.indulgence];
            if (newFlash && isUntouched) {
              updated.flash = newFlash;
            }
          }
        }

        return { ...c, [field]: updated };
      })),

      // === АВТОЗАПОЛНЕНИЕ: КЛАН / ПОКОЛЕНИЕ / ВИД / СИР ===
      updateMeta: (field, value) => set(state => updateActive(state, c => {
        let newMeta = { ...c.meta, [field]: value };
        let newChar = { ...c, meta: newMeta };

        if (field === 'clan' && CLAN_DATA[value]) {
          const data = CLAN_DATA[value];
          const oldData = CLAN_DATA[c.meta.clan];

          // 1. Проклятие клана — всегда
          newMeta.clanBane = data.bane;
          newChar = { ...newChar, meta: newMeta };

          // 2. Зверь и Ярость — только если пусто или авто от прошлого клана
          if (!c.beast.clanBeast || c.beast.clanBeast === oldData?.beast) {
            newChar.beast = { ...newChar.beast, clanBeast: data.beast };
          }
          if (!c.beast.rage || c.beast.rage === oldData?.rage) {
            newChar.beast = { ...newChar.beast, rage: data.rage };
          }

          // 3. Дисциплины — заменяем ТОЛЬКО если пользователь ничего не трогал
          const cur = c.disciplines || [];
          const oldClanNames: string[] = (oldData?.disciplines as string[]) || [];

          const hasPoints = cur.some((d: any) => (d?.dots || 0) > 0);

          const hasPowers = cur.some((d: any) => {
            if (Array.isArray(d?.powersList)) {
              return d.powersList.some((p: any) => p && String(p).trim());
            }
            if (typeof d?.powers === 'string') return d.powers.trim().length > 0;
            return false;
          });

          // Имя не совпадает с тем, что дал бы прошлый клан → пользователь переименовал
          const hasCustomName = cur.some((d: any, i: number) => {
            const autoName = oldClanNames[i] || '';
            return d?.name && d.name !== autoName;
          });

          if (!hasPoints && !hasPowers && !hasCustomName) {
            newChar.disciplines = data.disciplines.map(name => ({
              id: generateId(),
              name,
              dots: 0,
              powersList: ['', '', '', '', ''] as [string, string, string, string, string],
            }));
          }
        }

        // === АВТОЗАПОЛНЕНИЕ: ПОКОЛЕНИЕ → МОДИФИКАТОР ===
        if (field === 'generation') {
          newMeta.modifier = GENERATION_TO_MODIFIER(value);
          newChar = { ...newChar, meta: newMeta };
        }

        // === АВТОЗАПОЛНЕНИЕ: ВИД → ПОКОЛЕНИЕ + МОДИФИКАТОР ===
        if (field === 'type') {
          const defaultGen = VAMPIRE_TYPE_TO_GENERATION[value];
          if (defaultGen) {
            const prevDefaultGen = VAMPIRE_TYPE_TO_GENERATION[c.meta.type];
            const isUntouched = !c.meta.generation || c.meta.generation === prevDefaultGen;
            if (isUntouched) {
              newMeta.generation = defaultGen;
              newMeta.modifier = GENERATION_TO_MODIFIER(defaultGen);
              newChar = { ...newChar, meta: newMeta };
            }
          }
        }

        // === АВТОЗАПОЛНЕНИЕ: СИР → ДИСЦИПЛИНА ===
        if (field === 'sireType') {
          const newDisc = SIRE_TYPE_TO_DISCIPLINE[value];
          const oldAutoDisc = SIRE_TYPE_TO_DISCIPLINE[c.meta.sireType];
          const isUntouched = !c.meta.sireDiscipline || c.meta.sireDiscipline === oldAutoDisc;
          if (newDisc && isUntouched) {
            newMeta.sireDiscipline = newDisc;
            newChar = { ...newChar, meta: newMeta };
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
        const oldMaxVitae = c.vitae.max;
        const newMaxVitae = 10 + stamina;
        const vitaeDelta = newMaxVitae - oldMaxVitae;
        const newVitaeCurrent = vitaeDelta > 0
          ? Math.min(c.vitae.current + vitaeDelta, newMaxVitae)
          : Math.min(c.vitae.current, newMaxVitae);

        const oldMaxWillpower = c.willpower.max;
        const newMaxWillpower = 5 + composure + resolve;
        const willpowerDelta = newMaxWillpower - oldMaxWillpower;
        const newWillpowerCurrent = willpowerDelta > 0
          ? Math.min(c.willpower.current + willpowerDelta, newMaxWillpower)
          : Math.min(c.willpower.current, newMaxWillpower);

        return {
          ...c,
          attributes: newAttrs,
          vitae: { max: newMaxVitae, current: newVitaeCurrent },
          willpower: { max: newMaxWillpower, current: newWillpowerCurrent }
        };
      })),

      updateSkill: (skill, dots) => set(state => updateActive(state, c => ({
        ...c, skills: { ...c.skills, [skill]: { ...c.skills[skill], dots: Math.max(0, Math.min(dots, 5)) } }
      }))),

      updateSpecification: (skill, index, value) => set(state => updateActive(state, c => {
        const current = c.skills[skill] ?? { dots: 0, specifications: ['', '', ''] };
        const newSpecs: [string, string, string] = [
          current.specifications?.[0] || '',
          current.specifications?.[1] || '',
          current.specifications?.[2] || '',
        ];
        newSpecs[index] = value;
        return { ...c, skills: { ...c.skills, [skill]: { ...current, specifications: newSpecs } } };
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
        while (r.length <= index) r.push({ name: '', dots: 0, squares: 0, notes: '' });
        r[index] = { ...r[index], [field]: value };
        return { ...c, resources: r };
      })),

      removeResource: (index) => set(state => updateActive(state, c => ({
        ...c, resources: c.resources.filter((_, i) => i !== index)
      }))),

      addDiscipline: () => set(state => updateActive(state, c => ({
        ...c, disciplines: [...c.disciplines, { id: generateId(), name: '', dots: 0, powersList: ['', '', '', '', ''] as [string, string, string, string, string] }]
      }))),

      updateDiscipline: (index, field, value) => set(state => updateActive(state, c => {
        const d = [...c.disciplines];
        d[index] = { ...d[index], [field]: value };
        return { ...c, disciplines: d };
      })),

      updateDisciplinePower: (index, lineIndex, value) => set(state => updateActive(state, c => {
        const d = [...c.disciplines];
        while (d.length <= index) d.push({ id: generateId(), name: '', dots: 0, powersList: ['', '', '', '', ''] as [string, string, string, string, string] });
        const currentPowers = d[index].powersList || ['', '', '', '', ''];
        const newPowers: [string, string, string, string, string] = [...currentPowers];
        newPowers[lineIndex] = value;
        d[index] = { ...d[index], powersList: newPowers };
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

      applyLifePath: (index, pathName) => set(state => updateActive(state, c => {
        const lp = [...(c.lifePaths || [])];
        while (lp.length <= index) lp.push('');

        const oldApplied = [...(c.appliedLifePaths || [])];
        while (oldApplied.length <= index) oldApplied.push(null);
        const oldPath = oldApplied[index];

        let newSkills = { ...c.skills };

        if (oldPath && oldPath !== pathName) {
          const oldPathSkills = MORTAL_LIFE_PATHS[oldPath] || VAMPIRE_LIFE_PATHS[oldPath] || [];
          oldPathSkills.forEach(skillName => {
            if (newSkills[skillName]) {
              newSkills[skillName] = { ...newSkills[skillName], dots: Math.max(0, newSkills[skillName].dots - 1) };
            }
          });
        }

        lp[index] = pathName;
        oldApplied[index] = pathName;
        const pathSkills = MORTAL_LIFE_PATHS[pathName] || VAMPIRE_LIFE_PATHS[pathName] || [];
        if (pathSkills.length > 0) {
          pathSkills.forEach(skillName => {
            if (newSkills[skillName]) {
              newSkills[skillName] = { ...newSkills[skillName], dots: Math.min(5, newSkills[skillName].dots + 1) };
            }
          });
        }

        return { ...c, lifePaths: lp, skills: newSkills, appliedLifePaths: oldApplied };
      })),

      addDiaryEntry: (text) => set(state => updateActive(state, c => ({
        ...c, diary: [{ id: generateId(), timestamp: Date.now(), text }, ...c.diary]
      }))),

      removeDiaryEntry: (id) => set(state => updateActive(state, c => ({
        ...c, diary: c.diary.filter(e => e.id !== id)
      }))),

      loadCharacter: (data) => set(state => {
        const normalized = normalizeCharacter(data);
        const exists = state.characters.find(c => c.id === normalized.id);
        if (exists) {
          return { characters: state.characters.map(c => c.id === normalized.id ? normalized : c), activeId: normalized.id };
        }
        return { characters: [...state.characters, normalized], activeId: normalized.id };
      }),

      loadCharacters: (data) => set(state => {
        const withIds = data.map(normalizeCharacter);
        const merged = [...state.characters];
        withIds.forEach(nc => {
          const idx = merged.findIndex(c => c.id === nc.id);
          if (idx >= 0) merged[idx] = nc; else merged.push(nc);
        });
        return { characters: merged, activeId: withIds[0]?.id || state.activeId };
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
        // Миграция: нормализуем disciplines во всех персонажах
        if (state?.characters) {
          state.characters = state.characters.map(c => ({ ...c, disciplines: (c.disciplines || []).map(normalizeDiscipline) }));
        }
      }
    }
  )
);
