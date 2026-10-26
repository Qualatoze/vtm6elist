import { t } from './i18n';

export interface InventoryItem {
  id: string;
  name: string;
  qty: string;
  description: string;
}

export interface CharacterSheet {
  id: string;
  meta: {
    name: string;
    visibleAge: string;
    trueAge: string;
    embraceDate: string;
    nostalgia: string;
    type: string;
    clan: string;
    clanBane: string;
    generation: string;
    modifier: string;
    archetype: string;
    sire: string;
    sireType: string;
    sireDiscipline: string;
  };
  attributes: {
    physical: { strength: number; dexterity: number; stamina: number };
    social: { charisma: number; manipulation: number; composure: number };
    mental: { intelligence: number; wits: number; resolve: number };
  };
  vitae: { current: number; max: number };
  willpower: { current: number; max: number };
  bloodSurge: number;
  humanity: {
    path: number; // 1-7
    beast: number; // 0-5
    natureCounter: number; // 0-5
  };
  skills: Record<string, { dots: number; specifications: [string, string, string] }>;
  resources: Array<{ name: string; dots: number; squares: number; notes: string }>;
  items: string;
  notes: string;
  biography: string;
  disciplines: Array<{
    id: string;
    name: string;
    dots: number;
    powersList: [string, string, string, string, string];
  }>;
  inventory: InventoryItem[];
  lifePaths: string[];
  clanTraits: string;
  merits: string;
  flaws: string;
  nature: { indulgence: string; flash: string };
  beast: { clanBeast: string; rage: string };
  appliedLifePaths?: (string | null)[];
  powerPages: PowerPage[];
}

// ============================================================
// Силы Дисциплин — карточки
// ============================================================

export interface PowerData {
  id: string;
  name: string;
  rank: number;
  type: string;
  activation: string;
  trait: string;
  cost: string;
  difficulty: string;
  range: string;
  duration: string;
  description: string;
  upgrade: string;
}

export interface DisciplineCard {
  id: string;
  disciplineId: string;
  powerId: string;
  name: string;
  rank: number;
  type: string;
  activation: string;
  trait: string;
  cost: string;
  difficulty: string;
  range: string;
  duration: string;
  description: string;
  upgrade: string;
}

export interface PowerPage {
  id: string;
  layout?: 4 | 6 | 8 | 10;
  fontSize?: number;
  cards: DisciplineCard[];
}

// ============================================================
// СПРАВОЧНИКИ — массивы {id, label}
// label берётся из i18n при инициализации модуля
// ============================================================

export const SKILLS_LIST: Array<{ id: string; label: string }> = [
  { id: 'athletics', label: 'skills.athletics' },
  { id: 'awareness', label: 'skills.awareness' },
  { id: 'craft', label: 'skills.craft' },
  { id: 'expression', label: 'skills.expression' },
  { id: 'fighting', label: 'skills.fighting' },
  { id: 'investigation', label: 'skills.investigation' },
  { id: 'knowledge', label: 'skills.knowledge' },
  { id: 'medicine', label: 'skills.medicine' },
  { id: 'persuasion', label: 'skills.persuasion' },
  { id: 'sabotage', label: 'skills.sabotage' },
  { id: 'shooting', label: 'skills.shooting' },
  { id: 'subterfuge', label: 'skills.subterfuge' },
  { id: 'survival', label: 'skills.survival' },
];

export const CLANS_LIST: Array<{ id: string; label: string }> = [
  { id: 'brujah', label: 'clans.brujah' },
  { id: 'gangrel', label: 'clans.gangrel' },
  { id: 'lasombra', label: 'clans.lasombra' },
  { id: 'ministry', label: 'clans.ministry' },
  { id: 'nosferatu', label: 'clans.nosferatu' },
  { id: 'toreador', label: 'clans.toreador' },
  { id: 'ventrue', label: 'clans.ventrue' },
  { id: 'banu_haqim', label: 'clans.banu_haqim' },
  { id: 'giovanni', label: 'clans.giovanni' },
  { id: 'malkavian', label: 'clans.malkavian' },
  { id: 'ravnos', label: 'clans.ravnos' },
  { id: 'salubri', label: 'clans.salubri' },
  { id: 'tremere', label: 'clans.tremere' },
  { id: 'tzimisce', label: 'clans.tzimisce' },
  { id: 'caitiff', label: 'clans.caitiff' },
];

export const DISCIPLINES_LIST: Array<{ id: string; label: string }> = [
  { id: 'animalism', label: 'disciplines.animalism' },
  { id: 'auspex', label: 'disciplines.auspex' },
  { id: 'blood_sorcery', label: 'disciplines.blood_sorcery' },
  { id: 'celerity', label: 'disciplines.celerity' },
  { id: 'corruption', label: 'disciplines.corruption' },
  { id: 'dominate', label: 'disciplines.dominate' },
  { id: 'fortitude', label: 'disciplines.fortitude' },
  { id: 'necromancy', label: 'disciplines.necromancy' },
  { id: 'obfuscate', label: 'disciplines.obfuscate' },
  { id: 'oblivion', label: 'disciplines.oblivion' },
  { id: 'potence', label: 'disciplines.potence' },
  { id: 'presence', label: 'disciplines.presence' },
  { id: 'tellurgy', label: 'disciplines.tellurgy' },
  { id: 'vicissitude', label: 'disciplines.vicissitude' },
];

export const NATURES_LIST: Array<{ id: string; label: string }> = [
  { id: 'autocrat', label: 'natures.autocrat' },
  { id: 'bon_vivant', label: 'natures.bon_vivant' },
  { id: 'bravo', label: 'natures.bravo' },
  { id: 'gallant', label: 'natures.gallant' },
  { id: 'perfectionist', label: 'natures.perfectionist' },
  { id: 'romantic', label: 'natures.romantic' },
  { id: 'scientist', label: 'natures.scientist' },
  { id: 'survivor', label: 'natures.survivor' },
];

export const VAMPIRE_TYPES: Array<{ id: string; label: string }> = [
  { id: 'vampire_neonate', label: 'creation_types.vampire_neonate' },
  { id: 'ancilla', label: 'creation_types.ancilla' },
  { id: 'elder', label: 'creation_types.elder' },
  { id: 'duskborn', label: 'creation_types.duskborn' },
  { id: 'thin_blood', label: 'creation_types.thin_blood' },
];

export const SIRE_TYPES_LIST: Array<{ id: string; label: string }> = [
  { id: 'adoptive_sire', label: 'sire_types.adoptive_sire' },
  { id: 'brood_child', label: 'sire_types.brood_child' },
  { id: 'caring_sire', label: 'sire_types.caring_sire' },
  { id: 'cruel_sire', label: 'sire_types.cruel_sire' },
  { id: 'manipulative_sire', label: 'sire_types.manipulative_sire' },
  { id: 'secretive_sire', label: 'sire_types.secretive_sire' },
  { id: 'unknown_sire', label: 'sire_types.unknown_sire' },
  { id: 'vigilant_sire', label: 'sire_types.vigilant_sire' },
];

export const NOSTALGIA_DECADES = [
  { id: '1920s', label: '1920-е' },
  { id: '1930s', label: '1930-е' },
  { id: '1940s', label: '1940-е' },
  { id: '1950s', label: '1950-е' },
  { id: '1960s', label: '1960-е' },
  { id: '1970s', label: '1970-е' },
  { id: '1980s', label: '1980-е' },
  { id: '1990s', label: '1990-е' },
  { id: '2000s', label: '2000-е' },
  { id: '2010s', label: '2010-е' },
  { id: '2020s', label: '2020-е' },
];

// ============================================================
// АВТОЗАПОЛНЕНИЕ — справочники (ключи на английских ID)
// ============================================================

export const CLAN_DATA: Record<string, { bane: string; beast: string; rage: string; disciplines: string[] }> = {
  'brujah': { bane: 'clans.brujah_bane', beast: 'clans.brujah_beast', rage: 'clans.brujah_rage', disciplines: ['celerity', 'potence', 'presence'] },
  'gangrel': { bane: 'clans.gangrel_bane', beast: 'clans.gangrel_beast', rage: 'clans.gangrel_rage', disciplines: ['animalism', 'celerity', 'fortitude'] },
  'lasombra': { bane: 'clans.lasombra_bane', beast: 'clans.lasombra_beast', rage: 'clans.lasombra_rage', disciplines: ['dominate', 'potence', 'oblivion'] },
  'ministry': { bane: 'clans.ministry_bane', beast: 'clans.ministry_beast', rage: 'clans.ministry_rage', disciplines: ['corruption', 'obfuscate', 'presence'] },
  'nosferatu': { bane: 'clans.nosferatu_bane', beast: 'clans.nosferatu_beast', rage: 'clans.nosferatu_rage', disciplines: ['animalism', 'obfuscate', 'potence'] },
  'toreador': { bane: 'clans.toreador_bane', beast: 'clans.toreador_beast', rage: 'clans.toreador_rage', disciplines: ['auspex', 'celerity', 'presence'] },
  'ventrue': { bane: 'clans.ventrue_bane', beast: 'clans.ventrue_beast', rage: 'clans.ventrue_rage', disciplines: ['dominate', 'fortitude', 'presence'] },
  'banu_haqim': { bane: 'clans.banu_haqim_bane', beast: 'clans.banu_haqim_beast', rage: 'clans.banu_haqim_rage', disciplines: ['blood_sorcery', 'celerity', 'obfuscate'] },
  'giovanni': { bane: 'clans.giovanni_bane', beast: 'clans.giovanni_beast', rage: 'clans.giovanni_rage', disciplines: ['auspex', 'potence', 'necromancy'] },
  'malkavian': { bane: 'clans.malkavian_bane', beast: 'clans.malkavian_beast', rage: 'clans.malkavian_rage', disciplines: ['auspex', 'dominate', 'obfuscate'] },
  'ravnos': { bane: 'clans.ravnos_bane', beast: 'clans.ravnos_beast', rage: 'clans.ravnos_rage', disciplines: ['obfuscate', 'presence', 'tellurgy'] },
  'salubri': { bane: 'clans.salubri_bane', beast: 'clans.salubri_beast', rage: 'clans.salubri_rage', disciplines: ['auspex', 'fortitude', 'obfuscate'] },
  'tremere': { bane: 'clans.tremere_bane', beast: 'clans.tremere_beast', rage: 'clans.tremere_rage', disciplines: ['auspex', 'dominate', 'blood_sorcery'] },
  'tzimisce': { bane: 'clans.tzimisce_bane', beast: 'clans.tzimisce_beast', rage: 'clans.tzimisce_rage', disciplines: ['animalism', 'dominate', 'vicissitude'] },
  'caitiff': { bane: '', beast: '', rage: '', disciplines: [] },
};

export const NATURE_TO_FLASH: Record<string, string> = {
  'autocrat': 'natures.autocrat_flash',
  'bon_vivant': 'natures.bon_vivant_flash',
  'bravo': 'natures.bravo_flash',
  'gallant': 'natures.gallant_flash',
  'perfectionist': 'natures.perfectionist_flash',
  'romantic': 'natures.romantic_flash',
  'scientist': 'natures.scientist_flash',
  'survivor': 'natures.survivor_flash',
};

export const SIRE_TYPE_TO_DISCIPLINE: Record<string, string> = {
  'adoptive_sire': 'celerity',
  'brood_child': 'potence',
  'caring_sire': 'fortitude',
  'cruel_sire': 'dominate',
  'manipulative_sire': 'dominate',
  'secretive_sire': 'auspex',
  'unknown_sire': 'celerity',
  'vigilant_sire': 'auspex',
};

export const SIRE_TYPE_TO_DISCIPLINES: Record<string, string[]> = {
  'adoptive_sire': ['celerity'],
  'brood_child': ['potence'],
  'caring_sire': ['fortitude'],
  'cruel_sire': ['dominate'],
  'manipulative_sire': ['dominate'],
  'secretive_sire': ['auspex'],
  'unknown_sire': ['celerity'],
  'vigilant_sire': ['auspex'],
};

export const MORTAL_LIFE_PATHS: Record<string, string[]> = {
  'artist': ['awareness', 'craft', 'expression', 'knowledge', 'persuasion'],
  'corporate_executive': ['awareness', 'investigation', 'knowledge', 'persuasion', 'subterfuge'],
  'criminal': ['athletics', 'awareness', 'fighting', 'sabotage', 'subterfuge'],
  'holy_person': ['awareness', 'expression', 'knowledge', 'medicine', 'persuasion'],
  'hunter': ['awareness', 'craft', 'fighting', 'shooting', 'survival'],
  'military': ['athletics', 'fighting', 'medicine', 'shooting', 'survival'],
  'politician': ['awareness', 'investigation', 'knowledge', 'persuasion', 'subterfuge'],
  'technician': ['athletics', 'craft', 'fighting', 'sabotage', 'subterfuge'],
};

export const VAMPIRE_LIFE_PATHS: Record<string, string[]> = {
  'blood_deliverer': ['athletics', 'awareness', 'persuasion', 'sabotage', 'subterfuge'],
  'clean_up_crew': ['athletics', 'fighting', 'investigation', 'sabotage', 'subterfuge'],
  'hound': ['fighting', 'investigation', 'shooting', 'subterfuge', 'survival'],
  'diplomat': ['awareness', 'expression', 'investigation', 'persuasion', 'subterfuge'],
  'harpy': ['awareness', 'expression', 'knowledge', 'persuasion', 'subterfuge'],
  'sheriff': ['awareness', 'investigation', 'knowledge', 'persuasion', 'survival'],
};

export const ALL_LIFE_PATHS = [
  ...Object.keys(MORTAL_LIFE_PATHS),
  ...Object.keys(VAMPIRE_LIFE_PATHS),
];

// --- Поколение → Модификатор ---
export const GENERATION_TO_MODIFIER = (generation: string): string => {
  const num = parseInt(generation, 10);
  if (isNaN(num)) return '1';
  if (num >= 11) return '1';   // Неонаты / Весперы
  if (num >= 9)  return '2';   // Анциллы
  if (num >= 6)  return '3';   // Старейшины
  if (num >= 4)  return '4';   // Мафусаилы
  return '4';
};

// --- Вид вампира → Поколение по умолчанию ---
export const VAMPIRE_TYPE_TO_GENERATION: Record<string, string> = {
  'vampire_neonate': '13',
  'ancilla':         '10',
  'elder':          '8',
  'duskborn':       '15',
  'thin_blood':     '15',
};

// ============================================================
// УТИЛИТА НОРМАЛИЗАЦИИ — для миграции старых сохранений
// Превращает русские названия в канонические ID
// ============================================================

const RU_TO_ID: Record<string, string> = {
  // Кланы
  'Бруха': 'brujah', 'Гангрел': 'gangrel', 'Ласомбра': 'lasombra', 'Министри': 'ministry',
  'Носферату': 'nosferatu', 'Тореадор': 'toreador', 'Вентру': 'ventrue', 'Бану Хаким': 'banu_haqim',
  'Джованни': 'giovanni', 'Малкавиан': 'malkavian', 'Равнос': 'ravnos', 'Салобри': 'salubri',
  'Тремер': 'tremere', 'Цимисхи': 'tzimisce', 'Каитиф': 'caitiff',

  // Навыки
  'Атлетика': 'athletics', 'Наблюдательность': 'awareness', 'Ремесло': 'craft', 'Самовыражение': 'expression',
  'Бой': 'fighting', 'Расследование': 'investigation', 'Знания': 'knowledge', 'Медицина': 'medicine',
  'Убеждение': 'persuasion', 'Стрельба': 'shooting', 'Саботаж': 'sabotage', 'Хитрость': 'subterfuge',
  'Выживание': 'survival',

  // Дисциплины
  'Анимализм': 'animalism', 'Ясновидение': 'auspex', 'Кровавое Чародейство': 'blood_sorcery',
  'Стремительность': 'celerity', 'Порча': 'corruption', 'Доминирование': 'dominate',
  'Стойкость': 'fortitude', 'Некромантия': 'necromancy', 'Сокрытие': 'obfuscate',
  'Забвение': 'oblivion', 'Мощь': 'potence', 'Величие': 'presence',
  'Теллургия': 'tellurgy', 'Изменчивость': 'vicissitude',

  // Натуры
  'Автократ': 'autocrat', 'Бонвиван': 'bon_vivant', 'Задира': 'bravo', 'Галант': 'gallant',
  'Перфекционист': 'perfectionist', 'Романтик': 'romantic', 'Учёный': 'scientist', 'Выживший': 'survivor',

  // Виды вампиров
  'Вампир (неонат)': 'vampire_neonate', 'Анцилла': 'ancilla', 'Старейшина': 'elder',
  'Веспер': 'duskborn', 'Тонкий': 'thin_blood',

  // Жизненные пути (мёртвые)
  'Художник': 'artist', 'Руководитель компании': 'corporate_executive', 'Преступник': 'criminal',
  'Служитель веры': 'holy_person', 'Охотник': 'hunter', 'Военный': 'military', 'Политик': 'politician',
  'Техник': 'technician',

  // Жизненные пути (вампиры)
  'Доставщик крови': 'blood_deliverer', 'Группа зачистки': 'clean_up_crew', 'Гончая': 'hound',
  'Дипломат': 'diplomat', 'Гарпия': 'harpy', 'Шериф': 'sheriff',

  // Виды сиров
  'Приёмный сир': 'adoptive_sire', 'Дитя выводка': 'brood_child', 'Заботливый сир': 'caring_sire',
  'Жестокий сир': 'cruel_sire', 'Сир-манипулятор': 'manipulative_sire', 'Скрытный сир': 'secretive_sire',
  'Неизвестный сир': 'unknown_sire', 'Бдительный сир': 'vigilant_sire',

  // Ностальгия (декады)
  '1920-е': '1920s', '1930-е': '1930s', '1940-е': '1940s', '1950-е': '1950s',
  '1960-е': '1960s', '1970-е': '1970s', '1980-е': '1980s', '1990-е': '1990s',
  '2000-е': '2000s', '2010-е': '2010s', '2020-е': '2020s',
};

interface CreationRules {
  paths: number;
  attrs: string;
  disc: string;
  powers: number;
  merits: number;
  traits: number | string;
  skills: number;
  resources: number;
  maxDisc: number;
  maxAttr: number;
}

export const CREATION_RULES: Record<string, CreationRules> = {
  'vampire_neonate': { paths: 2, attrs: '7/5/3', disc: '3+1', powers: 4, merits: 1, traits: 2, skills: 8, resources: 3, maxDisc: 5, maxAttr: 5 },
  'ancilla': { paths: 3, attrs: '8/6/4', disc: '5+1', powers: 6, merits: 2, traits: 3, skills: 8, resources: 5, maxDisc: 6, maxAttr: 6 },
  'elder': { paths: 4, attrs: '9/7/5', disc: '7+1', powers: 8, merits: 3, traits: 4, skills: 8, resources: 7, maxDisc: 8, maxAttr: 8 },
  'duskborn': { paths: 2, attrs: '6/4/3', disc: '2+1', powers: 3, merits: 1, traits: 1, skills: 8, resources: 2, maxDisc: 5, maxAttr: 5 },
  'thin_blood': { paths: 2, attrs: '6/4/3', disc: '1+1', powers: 2, merits: 2, traits: '-', skills: 8, resources: 1, maxDisc: 5, maxAttr: 5 },
};

export function normalizeId(value: string): string {
  if (!value) return value;
  // Если уже ID (lowercase, только латиница/подчёркивания) — возвращаем как есть
  if (/^[a-z0-9_]+$/.test(value)) return value;
  // Иначе пробуем найти по русскому названию
  const found = RU_TO_ID[value];
  return found || value;
}
