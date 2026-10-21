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
  disciplines: Array<{ id: string; name: string; dots: number; powers: string }>;
  lifePaths: string[];
  clanTraits: string;
  merits: string;
  flaws: string;
  nature: { indulgence: string; flash: string };
  beast: { clanBeast: string; rage: string };
  diary: Array<{ id: string; timestamp: number; text: string }>;
}

export const SKILLS_LIST = [
  "Атлетика", "Наблюдательность", "Ремесло", "Самовыражение", "Бой",
  "Расследование", "Знания", "Медицина", "Убеждение", "Стрельба",
  "Саботаж", "Хитрость", "Выживание"
];

export const CLANS_LIST = [
  "Бруха", "Гангрел", "Ласомбра", "Министри", "Носферату",
  "Тореадор", "Вентру", "Бану Хаким", "Джованни", "Малкавиан",
  "Равнос", "Салобри", "Тремер", "Цимисхи", "Каитиф"
];

export const VAMPIRE_TYPES = [
  "Вампир (неонат)", "Анцилла", "Старейшина", "Веспер", "Тонкий"
];

export const NOSTALGIA_DECADES = [
  "1920-е", "1930-е", "1940-е", "1950-е", "1960-е", "1970-е",
  "1980-е", "1990-е", "2000-е", "2010-е", "2020-е"
];

export const CLAN_DATA: Record<string, { bane: string; beast: string; rage: string; disciplines: string[] }> = {
  "Бруха": { bane: "Кипящая страсть", beast: "Неприятие власти", rage: "Бунт", disciplines: ["Стремительность", "Мощь", "Величие"] },
  "Гангрел": { bane: "Принятый Зверь", beast: "Звериное начало", rage: "Животные Порывы", disciplines: ["Анимализм", "Стремительность", "Стойкость"] },
  "Ласомбра": { bane: "Теневое присутствие", beast: "Каратель", rage: "Безжалостность", disciplines: ["Доминирование", "Мощь", "Забвение"] },
  "Министри": { bane: "Изъян солнечного света", beast: "Соблазнитель", rage: "Прегрешение", disciplines: ["Порча", "Сокрытие", "Величие"] },
  "Носферату": { bane: "Внешний Зверь", beast: "Скрытный", rage: "Криптомания", disciplines: ["Анимализм", "Сокрытие", "Мощь"] },
  "Тореадор": { bane: "Жажда красоты", beast: "Идол", rage: "Восхищение", disciplines: ["Ясновидение", "Стремительность", "Величие"] },
  "Вентру": { bane: "Изысканный вкус", beast: "Властитель", rage: "Превосходство", disciplines: ["Доминирование", "Стойкость", "Величие"] },
  "Бану Хаким": { bane: "В разработке", beast: "В разработке", rage: "В разработке", disciplines: ["Кровавое Чародейство", "Стремительность", "Сокрытие"] },
  "Джованни": { bane: "В разработке", beast: "В разработке", rage: "В разработке", disciplines: ["Ясновидение", "Мощь", "Некромантия"] },
  "Малкавиан": { bane: "В разработке", beast: "В разработке", rage: "В разработке", disciplines: ["Ясновидение", "Доминирование", "Сокрытие"] },
  "Равнос": { bane: "В разработке", beast: "В разработке", rage: "В разработке", disciplines: ["Сокрытие", "Величие", "Теллургия"] },
  "Салобри": { bane: "В разработке", beast: "В разработке", rage: "В разработке", disciplines: ["Ясновидение", "Стойкость", "Сокрытие"] },
  "Тремер": { bane: "В разработке", beast: "В разработке", rage: "В разработке", disciplines: ["Ясновидение", "Доминирование", "Кровавое Чародейство"] },
  "Цимисхи": { bane: "В разработке", beast: "В разработке", rage: "В разработке", disciplines: ["Анимализм", "Доминирование", "Изменчивость"] },
  "Каитиф": { bane: "В разработке", beast: "В разработке", rage: "В разработке", disciplines: [] }
};

export const DISCIPLINES_LIST = [
  "Анимализм", "Ясновидение", "Кровавое Чародейство", "Стремительность",
  "Доминирование", "Стойкость", "Сокрытие", "Забвение", "Мощь", "Величие",
  "Изменчивость", "Теллургия", "Некромантия", "Порча"
];
