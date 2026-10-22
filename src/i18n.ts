import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import en from './locales/en.json';
import zh from './locales/zh.json';

const storedLang = typeof window !== 'undefined' ? (localStorage.getItem('vtm6e-lang') || 'ru') : 'ru';

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: storedLang,
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

export const t = i18n.t.bind(i18n);

export default i18n;
