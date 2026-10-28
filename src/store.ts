import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CharacterSheet, SKILLS_LIST, CLAN_DATA, VAMPIRE_TYPES, NOSTALGIA_DECADES, GENERATION_TO_MODIFIER, VAMPIRE_TYPE_TO_GENERATION, SIRE_TYPE_TO_DISCIPLINE, SIRE_TYPE_TO_DISCIPLINES, NATURE_TO_FLASH, MORTAL_LIFE_PATHS, VAMPIRE_LIFE_PATHS, normalizeId, DisciplineCard, PowerPage, HistoryItem } from './types';
import { t } from './i18n';
import { DISCIPLINE_POWERS } from './data/disciplinePowers';
import { debouncedStorage } from './utils/debouncedStorage';
import { useUIStore } from './uiStore';
import { getAttributeCap, getSkillCap } from './utils/limits';
import { normalizeHistory } from './utils/migrate';

const generateId = () => crypto.randomUUID();

const initialSkills: Record<string, { dots: number; specifications: [string, string, string] }> =
  SKILLS_LIST.reduce((acc, skill) => ({ ...acc, [skill.id]: { dots: 0, specifications: ['', '', ''] } }), {});

const normalizeDiscipline = (d: any) => ({
  id: d?.id || generateId(),
  name: normalizeId(d?.name || ''),
  dots: Math.max(0, Math.min(d?.dots || 0, 5)),
  powersList: Array.from({ length: 5 }, (_, i) => {
    if (Array.isArray(d?.powersList)) return d.powersList[i] || '';
    if (typeof d?.powers === 'string') return d.powers.split('\n')[i] || '';
    return '';
  }) as [string, string, string, string, string],
});

export const createEmptyCharacter = (): CharacterSheet => ({
  id: generateId(),
  meta: {
    name: '', visibleAge: '', trueAge: '', embraceDate: '', nostalgia: '1980s', type: 'vampire_neonate',
    clan: '', clanBane: '', generation: '13', modifier: '1', archetype: '', sire: '', sireType: '', sireDiscipline: ''
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
  resources: [{ name: t('resources.wealth'), dots: 0, squares: 0, notes: '' }],
  items: '',
  inventoryText: '',       // <-- новое поле
  disciplines: [],
  lifePaths: [], clanTraits: '', merits: '', flaws: '', notes: '', biography: '',
  nature: { indulgence: '', flash: '' },
  beast: { clanBeast: '', rage: '' },
  appliedLifePaths: [null, null, null, null, null, null, null, null],
  powerPages: [{ id: generateId(), layout: 4, fontSize: 11, cards: [] }]
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
  advanceNight: () => void;
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
  loadCharacter: (data: CharacterSheet) => void;
  loadCharacters: (data: CharacterSheet[]) => void;
  resetActiveCharacter: () => void;
  switchCharacter: (id: string) => void;
  newCharacter: () => void;
  removeCharacter: (id: string) => void;
  addPowerPage: () => void;
  removePowerPage: (pageId: string) => void;
  updatePowerPageSettings: (pageId: string, settings: Partial<Pick<PowerPage, 'layout' | 'fontSize'>>) => void;
  addDisciplineCard: (pageId: string, slotIndex?: number) => void;
  updateDisciplineCard: (pageId: string, cardId: string, data: Partial<DisciplineCard>) => void;
  removeDisciplineCard: (pageId: string, cardId: string) => void;
  history: HistoryItem[];
  pushHistory: (changes: string[]) => void;
  clearHistory: () => void;
}

// PDF стр. 20: Витэ ≤ 15, Воля ≤ 15
const MAX_VITAE = 15;
const MAX_WILLPOWER = 15;

const deriveVitae = (stamina: number, current: number) => {
  const max = Math.min(MAX_VITAE, 10 + stamina);
  return { max, current: Math.min(current, max) };
};

const deriveWillpower = (composure: number, resolve: number, current: number) => {
  const max = Math.min(MAX_WILLPOWER, 5 + composure + resolve);
  return { max, current: Math.min(current, max) };
};

const updateActive = (state: CharacterStore, updater: (c: CharacterSheet) => CharacterSheet) => {
  if (!state.characters.length) return state;
  const activeChar = state.characters.find(c => c.id === state.activeId) || state.characters[0];
  return {
    characters: state.characters.map(c => c.id === activeChar.id ? updater(c) : c)
  };
};
const wasI18nKey = (v?: string) => !!v && /^(clans|natures|powers|powers_meta)\.[a-z0-9_]+(\.[a-z0-9_]+)*$/.test(v);

const migrateCard = (card: any): any => {
  if (!card) return null;
  const id = card.id || generateId();

  const disc = DISCIPLINE_POWERS[card.disciplineId];
  const power = disc?.powers.find((p: any) => p.id === card.powerId);

  if (power) {
    return {
      ...card,
      id,
      name: power.name,
      rank: power.rank,
      type: power.type,
      activation: power.activation,
      trait: power.trait,
      cost: power.cost,
      difficulty: power.difficulty,
      range: power.range,
      duration: power.duration,
      // Если описание было кастомным (не начинается с ключа), оставляем его, иначе берем из справочника
      description: (card.description && !card.description.startsWith('powers.')) ? card.description : power.description,
      upgrade: (card.upgrade && !card.upgrade.startsWith('powers.')) ? card.upgrade : power.upgrade,
    };
  }
  return { ...card, id };
};


const normalizeCharacter = (c: CharacterSheet): CharacterSheet => {
  const clamp = (v: number | undefined, min: number, max: number) => Math.max(min, Math.min(v ?? 0, max));

  const normalized: CharacterSheet = {
    ...c,
    id: c.id || generateId(),
    biography: (c as any).biography || '',
    bloodSurge: clamp(c.bloodSurge, 0, 5),
    humanity: {
      path: clamp((c.humanity as any)?.path, 1, 7),
      beast: clamp((c.humanity as any)?.beast, 0, 5),
      natureCounter: clamp((c.humanity as any)?.natureCounter, 0, 5),
    },
    disciplines: Array.isArray(c.disciplines)
      ? c.disciplines.map(normalizeDiscipline)
      : [],
    skills: Object.fromEntries(
      SKILLS_LIST.map(skill => {
        const s = c.skills?.[skill.id];
        return [skill.id, {
          dots: clamp(s?.dots, 0, 5),
          specifications: [
            s?.specifications?.[0] || '',
            s?.specifications?.[1] || '',
            s?.specifications?.[2] || '',
          ] as [string, string, string],
        }];
      })
    ),
    attributes: {
      physical: {
        strength: clamp(c.attributes?.physical?.strength, 0, 10),
        dexterity: clamp(c.attributes?.physical?.dexterity, 0, 10),
        stamina: clamp(c.attributes?.physical?.stamina, 0, 10),
      },
      social: {
        charisma: clamp(c.attributes?.social?.charisma, 0, 10),
        manipulation: clamp(c.attributes?.social?.manipulation, 0, 10),
        composure: clamp(c.attributes?.social?.composure, 0, 10),
      },
      mental: {
        intelligence: clamp(c.attributes?.mental?.intelligence, 0, 10),
        wits: clamp(c.attributes?.mental?.wits, 0, 10),
        resolve: clamp(c.attributes?.mental?.resolve, 0, 10),
      },
    },
    meta: c.meta ? {
      ...c.meta,
      type: normalizeId(c.meta.type || ''),
      clan: normalizeId(c.meta.clan || ''),
      sireType: normalizeId(c.meta.sireType || ''),
      nostalgia: normalizeId(c.meta.nostalgia || ''),
      clanBane: wasI18nKey(c.meta.clanBane) ? t(c.meta.clanBane) : c.meta.clanBane,
    } : c.meta,
    beast: {
      clanBeast: c.beast?.clanBeast ? (wasI18nKey(c.beast.clanBeast) ? t(c.beast.clanBeast) : c.beast.clanBeast) : '',
      rage: c.beast?.rage ? (wasI18nKey(c.beast.rage) ? t(c.beast.rage) : c.beast.rage) : '',
    },
    nature: c.nature ? {
      ...c.nature,
      flash: wasI18nKey(c.nature.flash) ? t(c.nature.flash) : (c.nature.flash || ''),
    } : c.nature,
    lifePaths: c.lifePaths || [],
    resources: c.resources || [],

    // Миграция для старых сейвов: legacy inventory[] конвертируем в строку inventoryText
    inventoryText: c.inventoryText ?? (
      Array.isArray((c as any).inventory)
        ? ((c as any).inventory)
            .map((i: { name?: string; qty?: number | string; description?: string }) => {
              if (!i) return '';
              const name = i.name?.trim() || '';
              if (!name) return '';
              const qty = i.qty ? ` (${i.qty})` : '';
              const desc = i.description?.trim() ? `: ${i.description.trim()}` : '';
              return `${name}${qty}${desc}`;
            })
            .filter(Boolean)
            .join('\n')
        : ''
    ),

    appliedLifePaths: c.appliedLifePaths || [null, null, null, null, null, null, null, null],
    powerPages: Array.isArray(c.powerPages) && c.powerPages.length > 0
      ? c.powerPages.map(page => ({
          id: page.id || generateId(),
          layout: page.layout || 4,
          fontSize: page.fontSize || 11,
          cards: Array.isArray(page.cards)
            ? page.cards.map(migrateCard)
            : []
        }))
      : [{ id: generateId(), layout: 4, fontSize: 11, cards: [] }],
    vitae: (() => {
      const max = clamp(c.vitae?.max, 1, MAX_VITAE);
      return { max, current: clamp(c.vitae?.current, 0, max) };
    })(),
    willpower: (() => {
      const max = clamp(c.willpower?.max, 1, MAX_WILLPOWER);
      return { max, current: clamp(c.willpower?.current, 0, max) };
    })()
  };
  return normalized;
};

const syncClanAndSireDisciplines = (
  char: CharacterSheet,
  oldClanId: string,
  newClanId: string,
  oldSireType: string,
  newSireType: string
) => {
  let newChar = { ...char };

  const oldClanDiscs = CLAN_DATA[oldClanId]?.disciplines || [];
  const newClanDiscs = CLAN_DATA[newClanId]?.disciplines || [];
  const oldSireDiscs = SIRE_TYPE_TO_DISCIPLINES[oldSireType] || [];
  const newSireDiscs = SIRE_TYPE_TO_DISCIPLINES[newSireType] || [];

  // 1. Вычисляем, какие дисциплины нужно удалить (были у старого клана/сира, но нет у нового)
  const toRemove = [...oldClanDiscs, ...oldSireDiscs].filter(d => !newClanDiscs.includes(d) && !newSireDiscs.includes(d));
  
  // Удаляем только пустые дисциплины (если юзер не вкладывал в них точки)
  newChar.disciplines = newChar.disciplines.filter(d => {
    if (toRemove.includes(normalizeId(d.name))) {
      const isEmpty = d.dots === 0 && (!d.powersList || d.powersList.every(p => !p));
      if (isEmpty) return false;
    }
    return true;
  });

  // 2. Удаляем карточки удалённых дисциплин с листа
  newChar.powerPages = newChar.powerPages.map(page => ({
    ...page,
    cards: page.cards.map(card => {
      if (card && toRemove.includes(card.disciplineId)) {
        const discStillExists = newChar.disciplines.some(d => normalizeId(d.name) === card.disciplineId);
        if (!discStillExists) return null;
      }
      return card;
    }).filter((c): c is DisciplineCard => c !== null)
  }));

  // 3. Собираем список ВСЕХ дисциплин, которые ОБЯЗАНЫ быть (от нового клана + нового сира)
  const requiredDiscs = [...newClanDiscs, ...newSireDiscs];
  
  // Проверяем каждую обязательную дисциплину и добавляем, если её нет в листе
  requiredDiscs.forEach(discId => {
    const exists = newChar.disciplines.some(d => normalizeId(d.name) === discId);
    if (!exists && newChar.disciplines.length < 16) {
      newChar.disciplines.push({
        id: crypto.randomUUID(),
        name: discId,
        dots: 0,
        powersList: ['', '', '', '', '']
      });
    }
  });

  // 4. Гарантируем наличие карточек для этих дисциплин
  if (newChar.powerPages.length === 0) {
    newChar.powerPages.push({ id: crypto.randomUUID(), layout: 4, fontSize: 11, cards: [] });
  }
  let page = { ...newChar.powerPages[0] };
  let cards = [...(page.cards || [])];

  requiredDiscs.forEach(discId => {
    const cardExists = cards.some(c => c && c.disciplineId === discId);
    if (!cardExists) {
      let emptyIdx = cards.findIndex(c => !c);
      if (emptyIdx === -1 && cards.length < 10) emptyIdx = cards.length;
      if (emptyIdx !== -1) {
        cards[emptyIdx] = {
          id: crypto.randomUUID(),
          disciplineId: discId,
          powerId: '', name: '', rank: 1,
          type: '', activation: '', trait: '', cost: '', difficulty: '', range: '', duration: '', description: '', upgrade: ''
        };
      }
    }
  });

  page.cards = cards;
  if (page.layout && cards.filter(Boolean).length > page.layout) {
    page.layout = Math.min(10, Math.ceil(cards.filter(Boolean).length / 2) * 2) as 4 | 6 | 8 | 10;
  }
  newChar.powerPages[0] = page;

  return newChar;
};
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
            const normalizedNature = normalizeId(natureNested.indulgence);
            const oldAutoFlash = NATURE_TO_FLASH[normalizeId(c.nature?.indulgence || '')];
            const isUntouched = !c.nature?.flash || c.nature.flash === oldAutoFlash;
            const newFlash = NATURE_TO_FLASH[normalizedNature];
            if (newFlash && isUntouched) {
              updated.flash = t(newFlash);
            }
          }
        }

        return { ...c, [field]: updated };
      })),

      // === АВТОЗАПОЛНЕНИЕ: КЛАН -> БАН, ЗВЕРЬ, ЯРОСТЬ, ДИСЦИПЛИНЫ ===
      updateMeta: (field, value) => set(state => updateActive(state, c => {
        let newMeta = { ...c.meta, [field]: value };
        let newChar = { ...c, meta: newMeta };

        if (field === 'clan') {
          const normalizedClan = normalizeId(value);
          const data = CLAN_DATA[normalizedClan];
          
          if (data) {
            const oldData = CLAN_DATA[normalizeId(c.meta.clan || '')];
            newMeta.clanBane = t(data.bane);
            newChar = { ...newChar, meta: newMeta };

            const oldBeastText = oldData?.beast ? t(oldData.beast) : '';
            const oldRageText = oldData?.rage ? t(oldData.rage) : '';
            const currentBeast = c.beast?.clanBeast || '';
            const currentRage = c.beast?.rage || '';
            const isBeastAuto = currentBeast === '' || currentBeast === oldBeastText || currentBeast === oldData?.beast;
            const isRageAuto = currentRage === '' || currentRage === oldRageText || currentRage === oldData?.rage;

            newChar.beast = {
              ...c.beast,
              clanBeast: isBeastAuto ? (data.beast ? t(data.beast) : '') : currentBeast,
              rage: isRageAuto ? (data.rage ? t(data.rage) : '') : currentRage,
            };
          }
          // Передаём старый клан (c.meta.clan) и новый клан (normalizedClan)
          newChar = syncClanAndSireDisciplines(
            newChar,
            normalizeId(c.meta.clan || ''),
            normalizedClan,
            normalizeId(c.meta.sireType || ''),
            normalizeId(c.meta.sireType || '')
          );
        }

        // === АВТОЗАПОЛНЕНИЕ: ПОКОЛЕНИЕ -> МОДИФИКАТОР ===
        if (field === 'generation') {
          newMeta.modifier = GENERATION_TO_MODIFIER(value);
          newChar = { ...newChar, meta: newMeta };

          const unlock = useUIStore.getState().unlockAttributes;
          const cap = getAttributeCap(value, unlock);
          const A = newChar.attributes;
          const phys = {
            strength: Math.min(A.physical.strength, cap),
            dexterity: Math.min(A.physical.dexterity, cap),
            stamina: Math.min(A.physical.stamina, cap),
          };
          const soc = {
            charisma: Math.min(A.social.charisma, cap),
            manipulation: Math.min(A.social.manipulation, cap),
            composure: Math.min(A.social.composure, cap),
          };
          const men = {
            intelligence: Math.min(A.mental.intelligence, cap),
            wits: Math.min(A.mental.wits, cap),
            resolve: Math.min(A.mental.resolve, cap),
          };
          newChar.attributes = { physical: phys, social: soc, mental: men };
          newChar.vitae = deriveVitae(phys.stamina, newChar.vitae.current);
          newChar.willpower = deriveWillpower(soc.composure, men.resolve, newChar.willpower.current);
        }

        // === АВТОЗАПОЛНЕНИЕ: ВИД -> ПОКОЛЕНИЕ + МОДИФИКАТОР ===
        if (field === 'type') {
          const normalizedType = normalizeId(value);
          const defaultGen = VAMPIRE_TYPE_TO_GENERATION[normalizedType];
          if (defaultGen) {
            const prevDefaultGen = VAMPIRE_TYPE_TO_GENERATION[normalizeId(c.meta.type || '')];
            const isUntouched = !c.meta.generation || c.meta.generation === prevDefaultGen;
            if (isUntouched) {
              newMeta.generation = defaultGen;
              newMeta.modifier = GENERATION_TO_MODIFIER(defaultGen);
              newChar = { ...newChar, meta: newMeta };
            }
          }

          const unlock = useUIStore.getState().unlockSkills;
          const skillCap = getSkillCap(value, unlock);
          const newSkills = { ...newChar.skills };
          Object.keys(newSkills).forEach(sid => {
            if (newSkills[sid].dots > skillCap) {
              newSkills[sid] = { ...newSkills[sid], dots: skillCap };
            }
          });
          newChar.skills = newSkills;
        }

        // === АВТОЗАПОЛНЕНИЕ: СИР -> ДИСЦИПЛИНА ===
        if (field === 'sireType') {
          const normalizedSireType = normalizeId(value);
          const newDiscs = SIRE_TYPE_TO_DISCIPLINES[normalizedSireType];
          
          if (newDiscs && newDiscs.length > 0) {
            const oldAutoDisc = SIRE_TYPE_TO_DISCIPLINES[normalizeId(c.meta.sireType || '')]?.[0];
            if (!c.meta.sireDiscipline || c.meta.sireDiscipline === oldAutoDisc) {
              newMeta.sireDiscipline = newDiscs[0];
              newChar = { ...newChar, meta: newMeta };
            }
          }
          // Передаём старый сир (c.meta.sireType) и новый сир (normalizedSireType)
          newChar = syncClanAndSireDisciplines(
            newChar,
            normalizeId(c.meta.clan || ''),
            normalizeId(c.meta.clan || ''),
            normalizeId(c.meta.sireType || ''),
            normalizedSireType
          );
        }

        return newChar;
      })),

      updateAttribute: (category, attr, value) => set(state => updateActive(state, c => {
        const unlock = useUIStore.getState().unlockAttributes;
        const cap = getAttributeCap(c.meta.generation, unlock);
        const clampedValue = Math.max(1, Math.min(value, cap)); // минимум 1
        const newAttrs = {
          ...c.attributes,
          [category]: { ...c.attributes[category], [attr]: clampedValue }
        };

        const stamina = newAttrs.physical.stamina;
        const composure = newAttrs.social.composure;
        const resolve = newAttrs.mental.resolve;

        return {
          ...c,
          attributes: newAttrs,
          vitae: deriveVitae(stamina, c.vitae.current),
          willpower: deriveWillpower(composure, resolve, c.willpower.current),
        };
      })),

      updateSkill: (skill, dots) => set(state => updateActive(state, c => {
        const unlock = useUIStore.getState().unlockSkills;
        const cap = getSkillCap(c.meta.type, unlock);
        return {
          ...c,
          skills: {
            ...c.skills,
            [skill]: { ...c.skills[skill], dots: Math.max(0, Math.min(dots, cap)) }
          }
        };
      })),

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
        ...c, vitae: { ...c.vitae, current: Math.max(0, Math.min(current, c.vitae.max)) }
      }))),
      
      updateWillpower: (current) => set(state => updateActive(state, c => ({
        ...c, willpower: { ...c.willpower, current: Math.max(0, Math.min(current, c.willpower.max)) }
      }))),

      updateBloodSurge: (value) => set(state => updateActive(state, c => ({
        ...c, bloodSurge: Math.max(0, Math.min(value, 5))
      }))),

      resetBloodSurge: () => set(state => updateActive(state, c => ({ ...c, bloodSurge: 0 }))),

      advanceNight: () => set(state => updateActive(state, c => ({
        ...c,
        humanity: {
          ...c.humanity,
          beast: Math.min(c.humanity.beast + 1, 5),
          natureCounter: Math.min(c.humanity.natureCounter + 1, 5),
        },
      }))),

      updateHumanity: (field, value) => set(state => updateActive(state, c => {
        let val = value;
        if (field === 'path') val = Math.max(1, Math.min(value, 7));
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
        const normalizedNew = normalizeId(value);
        const isKnownPath = MORTAL_LIFE_PATHS[normalizedNew] || VAMPIRE_LIFE_PATHS[normalizedNew];

        const oldApplied = [...(c.appliedLifePaths || [])];
        while (oldApplied.length <= index) oldApplied.push(null);
        const oldPath = oldApplied[index];

        let newSkills = { ...c.skills };

        // Снять бонусы старого пути
        if (oldPath && oldPath !== normalizedNew) {
          const oldSkills = MORTAL_LIFE_PATHS[oldPath] || VAMPIRE_LIFE_PATHS[oldPath] || [];
          oldSkills.forEach(skillName => {
            if (newSkills[skillName]) {
              newSkills[skillName] = { ...newSkills[skillName], dots: Math.max(0, newSkills[skillName].dots - 1) };
            }
          });
        }

        // Начислить бонусы нового (если известный)
        if (isKnownPath && oldPath !== normalizedNew) {
          const pathSkills = MORTAL_LIFE_PATHS[normalizedNew] || VAMPIRE_LIFE_PATHS[normalizedNew] || [];
          pathSkills.forEach(skillName => {
            if (newSkills[skillName]) {
              newSkills[skillName] = { ...newSkills[skillName], dots: Math.min(5, newSkills[skillName].dots + 1) };
            }
          });
          oldApplied[index] = normalizedNew;
        } else if (!isKnownPath) {
          oldApplied[index] = null;
        }

        const lp = [...(c.lifePaths || [])];
        while (lp.length <= index) lp.push('');
        lp[index] = value;

        return { ...c, lifePaths: lp, skills: newSkills, appliedLifePaths: oldApplied };
      })),

      applyLifePath: (index, pathName) => set(state => updateActive(state, c => {
        const lp = [...(c.lifePaths || [])];
        while (lp.length <= index) lp.push('');

        const oldApplied = [...(c.appliedLifePaths || [])];
        while (oldApplied.length <= index) oldApplied.push(null);
        const oldPath = oldApplied[index];

        let newSkills = { ...c.skills };

        const normalizedOldPath = normalizeId(oldPath || '');
        const normalizedNewPath = normalizeId(pathName);
        if (normalizedOldPath && normalizedOldPath !== normalizedNewPath) {
          const oldPathSkills = MORTAL_LIFE_PATHS[normalizedOldPath] || VAMPIRE_LIFE_PATHS[normalizedOldPath] || [];
          oldPathSkills.forEach(skillName => {
            if (newSkills[skillName]) {
              newSkills[skillName] = { ...newSkills[skillName], dots: Math.max(0, newSkills[skillName].dots - 1) };
            }
          });
        }

        lp[index] = normalizedNewPath;
        oldApplied[index] = normalizedNewPath;
        const pathSkills = MORTAL_LIFE_PATHS[normalizedNewPath] || VAMPIRE_LIFE_PATHS[normalizedNewPath] || [];
        if (pathSkills.length > 0) {
          pathSkills.forEach(skillName => {
            if (newSkills[skillName]) {
              newSkills[skillName] = { ...newSkills[skillName], dots: Math.min(5, newSkills[skillName].dots + 1) };
            }
          });
        }

        return { ...c, lifePaths: lp, skills: newSkills, appliedLifePaths: oldApplied };
      })),


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
      }),

      addPowerPage: () => set(state => updateActive(state, c => {
        if (c.powerPages.length >= 5) return c;
        return { ...c, powerPages: [...c.powerPages, { id: generateId(), layout: 4, fontSize: 11, cards: [] }] };
      })),

      removePowerPage: (pageId) => set(state => updateActive(state, c => {
        if (c.powerPages.length <= 1) return c;
        return { ...c, powerPages: c.powerPages.filter(p => p.id !== pageId) };
      })),

      addDisciplineCard: (pageId, slotIndex = -1) => set(state => updateActive(state, c => ({
        ...c,
        powerPages: c.powerPages.map(p => {
          if (p.id !== pageId) return p;
          const newCard = {
            id: generateId(), disciplineId: '', powerId: '', name: '', rank: 1,
            type: '', activation: '', trait: '', cost: '', difficulty: '', range: '', duration: '', description: '', upgrade: ''
          };
          const cards = [...p.cards];
          if (slotIndex >= 0) {
            while (cards.length <= slotIndex) {
              cards.push(null as any);
            }
            cards[slotIndex] = newCard;
          } else {
            cards.push(newCard);
          }
          return { ...p, cards };
        })
      }))),

      updateDisciplineCard: (pageId, cardId, data) => set(state => updateActive(state, c => ({
        ...c,
        powerPages: c.powerPages.map(p => {
          if (p.id !== pageId) return p;
          return {
            ...p,
            cards: p.cards.map(card => card.id === cardId ? { ...card, ...data } : card)
          };
        })
      }))),

      removeDisciplineCard: (pageId, cardId) => set(state => updateActive(state, c => ({
        ...c,
        powerPages: c.powerPages.map(p => {
          if (p.id !== pageId) return p;
          return { ...p, cards: p.cards.filter(card => card.id !== cardId) };
        })
      }))),

      updatePowerPageSettings: (pageId, settings) => set(state => updateActive(state, c => ({
        ...c,
        powerPages: c.powerPages.map(p => p.id === pageId ? { ...p, ...settings } : p)
      }))),

      history: [],
      pushHistory: (changes) => set(state => {
        // Runtime-guard: типы TS не спасают от legacy-вызовов
        if (!Array.isArray(changes) || changes.length === 0) return state;
        const cleaned = changes.filter(c => typeof c === 'string' && c.trim());
        if (cleaned.length === 0) return state;
        const item: HistoryItem = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          changes: cleaned,
        };
        const prev = Array.isArray(state.history) ? state.history : [];
        return { history: [item, ...prev].slice(0, 50) };
      }),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'vtm6e-alpha-storage',
      storage: createJSONStorage(() => debouncedStorage),
      version: 2,
      migrate: (persisted: any, _version: number) => {
        if (persisted?.state) {
          if (persisted.state.history) {
            persisted.state.history = normalizeHistory(persisted.state.history);
          }
          if (Array.isArray(persisted.state.characters)) {
            persisted.state.characters = persisted.state.characters.map(normalizeCharacter);
          }
        }
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        if (state && (!state.characters || state.characters.length === 0)) {
          const c = createEmptyCharacter();
          state.characters = [c];
          state.activeId = c.id;
        } else if (state && !state.characters.find(c => c.id === state.activeId)) {
          state.activeId = state.characters[0].id;
        }
        // Миграция: нормализуем все поля во всех персонажах
        if (state?.characters) {
          state.characters = state.characters.map(normalizeCharacter);
        }
        if (state) {
          state.history = normalizeHistory((state as any).history);
        }
      }
    }
  )
);

// Экспорт для тестов
export const __test_normalizeHistory = normalizeHistory;
