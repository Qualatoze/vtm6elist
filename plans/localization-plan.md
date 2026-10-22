# План локализации VTM 6E (ru / en / zh)

## Архитектура решения

```mermaid
graph TD
    A[localStorage] -->|default lang| B[i18next init]
    B --> C[src/i18n.ts]
    C --> D[main.tsx import]
    
    E[types.ts] -->|English IDs| F[store.ts logic]
    G[locales/ru.json] --> H[i18next]
    I[locales/en.json] --> H
    J[locales/zh.json] --> H
    H --> K[t() in components]
    
    L[translateKey utility] --> M[normalize old saves]
    M --> F
    
    N[Noto Sans SC] --> O[index.css]
    O --> P[html-to-image PDF export]
```

## Ключевой принцип

**В стейте хранятся английские ID (канонические имена), на экран выводится перевод.**

Пример:
- В `character.meta.clan` хранится `'brujah'`
- В UI отображается `t('clans.brujah')` → 'Бруха' / 'Brujah' / '布鲁赫'
- Автозаполнение работает через `CLAN_DATA['brujah']` — независимо от языка

## Пошаговый план

### Шаг 1: Установка и настройка i18next

**Команды:**
```bash
npm install i18next react-i18next
```

**Файл [`src/i18n.ts`](src/i18n.ts):**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import en from './locales/en.json';
import zh from './locales/zh.json';

const storedLang = localStorage.getItem('vtm6e-lang') || 'ru';

i18n.use(initReactI18next).init({
  resources: { ru, en, zh },
  lng: storedLang,
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

export default i18n;
```

**[`src/main.tsx`](src/main.tsx):** добавить `import './i18n';` в начале файла.

---

### Шаг 2: Файлы локализации

Создать папку [`src/locales/`](src/locales/) с тремя файлами.

Структура ключей (плоская, i18next-совместимая):

| Ключ | Пример |
|------|--------|
| `ui.name` | "Имя" / "Name" / "名字" |
| `attributes.strength` | "Сила" / "Strength" / "力量" |
| `skills.athletics` | "Атлетика" / "Athletics" / "运动" |
| `clans.brujah` | "Бруха" / "Brujah" / "布鲁赫" |
| `disciplines.celerity` | "Стремительность" / "Celerity" / "迅捷术" |
| `natures.autocrat` | "Автократ" / "Autocrat" / "独裁者" |
| `creation_types.vampire_neonate` | "Вампир (неонат)" / "Vampire (Neonate)" / "吸血鬼（新生）" |
| `lifepaths.artist` | "Художник" / "Artist" / "艺术家" |
| `sire_types.adoptive_sire` | "Приёмный сир" / "Adoptive Sire" / "养父/养母" |
| `summary_panel.title` | "Создание: {{type}}" / "Creation: {{type}}" / "创建：{{type}}" |

**[`src/locales/ru.json`](src/locales/ru.json)** — все значения по ключу `"ru"` из предоставленного словаря.
**[`src/locales/en.json`](src/locales/en.json)** — все значения по ключу `"en"`.
**[`src/locales/zh.json`](src/locales/zh.json)** — все значения по ключу `"zh"`.

Дополнительные ключи, которых нет в предоставленном JSON:
```json
{
  "placeholders": {
    "items": "Список предметов...",
    "discipline_name": "Название...",
    "power": "Способность..."
  },
  "common": {
    "delete_discipline": "Удалить дисциплину",
    "add_discipline": "+ Добавить дисциплину",
    "limit_reached": "Достигнут лимит",
    "new_character": "Новый персонаж",
    "nameless": "Безымянный",
    "delete_confirm": "Удалить \"{{name}}\"?"
  },
  "dice": {
    "attribute_prompt": "Атрибут:\n1. Сила\n2. Ловкость\n3. Выносливость\n4. Обаяние\n5. Манипуляция\n6. Самообладание\n7. Интеллект\n8. Смекалка\n9. Упорство",
    "skill_prompt": "Навык:\n{{skills}}",
    "title": "Бросить кубики (d10 пул)"
  },
  "attributes_groups": {
    "physical": "ФИЗИЧЕСКИЕ",
    "social": "СОЦИАЛЬНЫЕ",
    "mental": "МЕНТАЛЬНЫЕ"
  }
}
```

---

### Шаг 3: Рефакторинг types.ts

**3.1 Замена массивов на объекты:**

Было:
```typescript
export const SKILLS_LIST = [
  "Атлетика", "Наблюдательность", ...
];
```

Стало:
```typescript
import { t } from './i18n'; // или использовать i18next напрямую

export const SKILLS_LIST = [
  { id: 'athletics', label: t('skills.athletics') },
  { id: 'awareness', label: t('skills.awareness') },
  // ... остальные 13 шт
];
```

Аналогично для `CLANS_LIST`, `DISCIPLINES_LIST`, `NATURES_LIST`, `SIRE_TYPES_LIST`, `VAMPIRE_TYPES`.

**3.2 Переключение ключей справочников на ID:**

Было:
```typescript
export const CLAN_DATA: Record<string, {...}> = {
  "Бруха": { bane: "Кипящая страсть", ... },
};
```

Стало:
```typescript
export const CLAN_DATA: Record<string, {...}> = {
  'brujah': { 
    bane: t('clans.brujah_bane'), // или хранить ID и переводить в UI
    beast: t('clans.brujah_beast'),
    rage: t('clans.brujah_rage'),
    disciplines: ['celerity', 'potence', 'presence']
  },
  // ... остальные 15 шт
};
```

**3.3 Утилита нормализации:**

```typescript
// src/utils/normalize.ts
import { t } from '../i18n';

const RU_TO_ID: Record<string, string> = {
  'Бруха': 'brujah', 'Гангрел': 'gangrel', // ... все 15 кланов
  'Атлетика': 'athletics', 'Наблюдательность': 'awareness', // ... все 13 навыков
  // ... остальные справочники
};

export function normalizeId(value: string): string {
  if (!value) return value;
  // Если уже ID (lowercase, без пробелов/кириллицы) — возвращаем как есть
  if (/^[a-z_]+$/.test(value)) return value;
  // Иначе пробуем найти по русскому названию
  const found = RU_TO_ID[value];
  return found || value;
}
```

**3.4 NATURE_TO_FLASH, MORTAL_LIFE_PATHS, VAMPIRE_LIFE_PATHS, SIRE_TYPE_TO_DISCIPLINE** — все ключи и значения заменить на ID.

---

### Шаг 4: Обновление store.ts

**4.1 createEmptyCharacter:**
```typescript
// Было: type: 'Вампир (неонат)', nostalgia: '1980-е'
// Стало: type: 'vampire_neonate', nostalgia: '1980s'
const defaultType = 'vampire_neonate';
const defaultNostalgia = '1980s';

resources: [{ name: t('resources.wealth'), dots: 0, squares: 0, notes: '' }]
```

**4.2 updateMeta — автозаполнение клана:**
```typescript
// Было: if (field === 'clan' && CLAN_DATA[value]) {
// Стало:
if (field === 'clan') {
  const normalized = normalizeId(value);
  const data = CLAN_DATA[normalized];
  if (data) { ... }
}
```

**4.3 updateNested — автозаполнение натуры:**
```typescript
// Было: NATURE_TO_FLASH[c.nature?.indulgence]
// Стало:
const normalizedNature = normalizeId(c.nature?.indulgence);
const oldAutoFlash = NATURE_TO_FLASH[normalizedNature];
```

**4.4 loadCharacter / onRehydrateStorage — миграция:**
```typescript
const normalizeCharacter = (c: CharacterSheet): CharacterSheet => ({
  ...c,
  meta: {
    ...c.meta,
    clan: normalizeId(c.meta.clan),
    type: normalizeId(c.meta.type),
    // ... другие поля с нормализацией
  },
  skills: Object.fromEntries(
    SKILLS_LIST.map(({ id }) => {
      const s = c.skills?.[id] || c.skills?.[t('skills.' + id)];
      return [id, { dots: s?.dots ?? 0, specifications: [...] }];
    })
  ),
  // ...
});
```

---

### Шаг 5: Локализация SheetPage1.tsx

**Замена всех хардкод-строк:**

| Было | Стало |
|------|-------|
| `label="Имя"` | `label={t('ui.name')}` |
| `label="Видимый возраст"` | `label={t('ui.visible_age')}` |
| `ATTR_GROUPS` title: `'ФИЗИЧЕСКИЕ'` | `t('attributes_groups.physical')` |
| `ATTR_LABELS` values | `t('attributes.strength')` и т.д. |
| `<div>Навыки (Специализации на 1, 3 и 5)</div>` | `{t('ui.skills')} ({t('ui.specializations')})` |
| `<div>Ресурсы</div>` | `{t('ui.resources')}` |
| `<div>Предметы</div>` | `{t('ui.items')}` |
| `placeholder="Список предметов..."` | `placeholder={t('placeholders.items')}` |

**Замена опций в <select>:**
```tsx
// Было: options={CLANS_LIST} (массив строк)
// Стало:
{CLANS_LIST.map(clan => (
  <option key={clan.id} value={clan.id}>{clan.label}</option>
))}
```

---

### Шаг 6: Локализация SheetPage2.tsx

| Было | Стало |
|------|-------|
| `<h1>Дисциплины</h1>` | `{t('ui.disciplines')}` |
| `placeholder="Название..."` | `placeholder={t('placeholders.discipline_name')}` |
| `placeholder="Способность..."` | `placeholder={t('placeholders.power')}` |
| `<h3>Жизненные пути</h3>` | `{t('ui.life_paths')}` |
| `<h3>Клановые черты</h3>` | `{t('ui.clan_traits')}` |
| `<h3>Достоинства</h3>` | `{t('ui.merits')}` |
| `<h3>Недостатки</h3>` | `{t('ui.flaws')}` |
| `<h3>Натура</h3>` | `{t('ui.nature')}` |
| `<h3>Зверь</h3>` | `{t('ui.beast')}` |
| `<h3>Заметки</h3>` | `{t('ui.notes')}` |
| `+ Добавить дисциплину` | `{t('common.add_discipline')}` |
| `Достигнут лимит` | `{t('common.limit_reached')}` |

**datalist для жизненных путей и натур — отображать label из i18n:**
```tsx
{ALL_LIFE_PATHS.map(lp => (
  <option key={lp.id} value={lp.id}>{lp.label}</option>
))}
```

---

### Шаг 7: Локализация App.tsx

**7.1 CREATION_RULES — ключи на ID:**
```typescript
const CREATION_RULES: Record<string, any> = {
  'vampire_neonate': { paths: 2, attrs: '7/5/3', disc: '3+1', powers: 4, merits: 1, traits: 2, skills: 8, resources: 3, maxDisc: 5, maxAttr: 5 },
  'ancilla': { paths: 3, attrs: '8/6/4', disc: '5+1', powers: 6, merits: 2, traits: 3, skills: 8, resources: 5, maxDisc: 6, maxAttr: 6 },
  // ... остальные
};
```

**7.2 Панель Сводка правил:**
Все строки заменить на `t('summary_panel.*')`:
```tsx
<h3>{t('summary_panel.title', { type: t('creation_types.' + normalizeId(character.meta.type)) })}</h3>
<span>{t('summary_panel.paths')}:</span> <b>{rules.paths}</b>
// ... и т.д.
```

**7.3 Prompt для кубиков:**
```typescript
const attrInput = prompt(t('dice.attribute_prompt'), '1');
const skillInput = prompt(t('dice.skill_prompt', { skills: SKILLS_LIST.map((s, i) => `${i + 1}. ${s.label}`).join('\n') }), '5');
```

**7.4 Title-атрибуты кнопок:**
```tsx
title={t('common.summary_rules')} // "Сводка правил создания"
title={t('common.export_json')}   // "Экспорт JSON"
// ...
```

---

### Шаг 8: Локализация CharacterSelector.tsx

| Было | Стало |
|------|-------|
| `'Безымянный'` | `t('common.nameless')` |
| `'Новый персонаж'` | `t('common.new_character')` |
| `confirm(\`Удалить "${c.meta.name}"?\`)` | `confirm(t('common.delete_confirm', { name: c.meta.name || t('common.nameless') }))` |

---

### Шаг 9: Переключатель языка в Header

**В [`App.tsx`](src/App.tsx) — Group 5 (рядом с темой):**
```tsx
import { Globe } from 'lucide-react';
import i18n from './i18n';

const [lang, setLang] = useState<string>(localStorage.getItem('vtm6e-lang') || 'ru');

// В header:
<div style={{ display: 'flex', gap: '8px' }}>
  <select value={themeId} onChange={(e) => setThemeId(e.target.value)} ...>
    {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
  </select>

  {/* Переключатель языка */}
  <button className="icon-btn" onClick={() => handleLangChange('ru')} title={t('common.language_ru')}>RU</button>
  <button className="icon-btn" onClick={() => handleLangChange('en')} title={t('common.language_en')}>EN</button>
  <button className="icon-btn" onClick={() => handleLangChange('zh')} title={t('common.language_zh')}>ZH</button>
</div>

const handleLangChange = (lang: string) => {
  i18n.changeLanguage(lang);
  localStorage.setItem('vtm6e-lang', lang);
  setLang(lang);
};
```

---

### Шаг 10: Шрифт Noto Sans SC для PDF

**[`src/index.css`](src/index.css):**
```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600&family=Noto+Sans+SC:wght@400;700&display=swap');
```

**Для CJK-текста в компонентах:**
```css
/* В index.css */
.cjk-text {
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
```

В `html-to-image` — убедиться что при экспорте PDF шрифт загружен до рендера (можно добавить `await document.fonts.ready` перед экспортом).

---

### Шаг 11: Проверка тестов

```bash
npm test
```

Проверить:
- [`src/__tests__/store.test.ts`](src/__tests__/store.test.ts) — после рефакторинга CLAN_DATA ключей
- [`src/__tests__/DotRating.test.tsx`](src/__tests__/DotRating.test.tsx) — не зависит от языка
- Ручная проверка: создать персонажа на RU → переключить на EN → проверить что "Brujah" отображается и автозаполнение работает

## Критерии приёмки

1. В правом верхнем углу есть переключатель RU / EN / ZH
2. При смене языка весь интерфейс, выпадающие списки и сводка правил мгновенно переводятся
3. Персонаж с кланом "Бруха" на русском → при смене на английский отображается "Brujah", автозаполнение (Проклятие, Дисциплины) работает
4. Экспорт в PDF работает на всех трёх языках без "кракозябр"
5. Верстка не ломается при переключении на китайский (проверить фиксированные ширины в SheetPage1.tsx — `width: isMobile ? '80px' : '160px'` для навыков)

## Риски и решения

| Риск | Решение |
|------|---------|
| Старые сохранения с русскими ключами | Миграция через normalizeId при загрузке (onRehydrateStorage + loadCharacter) |
| Фиксированные ширины в SheetPage1.tsx при CJK | Использовать `min-width` вместо фиксированного `width`, или увеличить значения для zh |
| html-to-image не подгружает web-шрифты | Добавить `await document.fonts.ready` перед экспортом; как fallback — системные шрифты CJK |
| i18next в store.ts (не React) | Использовать `i18n.t()` напрямую из i18next, а не хук `useTranslation` |
