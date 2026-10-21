export interface Theme {
  id: string;
  name: string;
  bg: string;
  panel: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
  headerBg: string;
  dotColor: string;
  cardBorder: string;
  glow: string;
  inputBg: string;
}

export const THEMES: Theme[] = [
  {
    id: 'classic',
    name: 'Классика',
    bg: '#ffffff',
    panel: '#f8f8f8',
    text: '#000000',
    muted: '#555555',
    accent: '#000000',
    border: '#000000',
    headerBg: 'rgba(0, 0, 0, 0.9)',
    dotColor: '#000000',
    cardBorder: '#cccccc',
    glow: 'rgba(0, 0, 0, 0.2)',
    inputBg: '#e6eaff'
  },
  {
    id: 'gothic',
    name: 'Готика',
    bg: '#0a0514',
    panel: '#150d22',
    text: '#c8b8e0',
    muted: '#7a6a9a',
    accent: '#9b6fd4',
    border: '#3a2a5a',
    headerBg: 'rgba(155, 111, 212, 0.15)',
    dotColor: '#9b6fd4',
    cardBorder: '#2a1a4a',
    glow: 'rgba(155, 111, 212, 0.3)',
    inputBg: 'rgba(155, 111, 212, 0.1)'
  },
  {
    id: 'parchment',
    name: 'Пергамент',
    bg: '#f5e6c8',
    panel: '#efe0b8',
    text: '#3a2a10',
    muted: '#7a6a40',
    accent: '#8b6914',
    border: '#c4a86a',
    headerBg: 'rgba(139, 105, 20, 0.1)',
    dotColor: '#8b6914',
    cardBorder: '#d4bc7a',
    glow: 'rgba(139, 105, 20, 0.2)',
    inputBg: '#e6eaff'
  },
  {
    id: 'neon',
    name: 'Неон',
    bg: '#050510',
    panel: '#0a0a18',
    text: '#e0f0ff',
    muted: '#4a6a8a',
    accent: '#00e5c3',
    border: '#1a2a3a',
    headerBg: 'rgba(0, 229, 195, 0.1)',
    dotColor: '#00e5c3',
    cardBorder: '#1a2a3a',
    glow: 'rgba(0, 229, 195, 0.4)',
    inputBg: 'rgba(0, 229, 195, 0.08)'
  },
  {
    id: 'blood',
    name: 'Кровь и Тень',
    bg: '#0d0204',
    panel: '#1a080c',
    text: '#e8d5d5',
    muted: '#8a5a5a',
    accent: '#b31217',
    border: '#4a1a1a',
    headerBg: 'rgba(179, 18, 23, 0.1)',
    dotColor: '#b31217',
    cardBorder: '#2a0f12',
    glow: 'rgba(179, 18, 23, 0.4)',
    inputBg: 'rgba(179, 18, 23, 0.08)'
  },
  {
    id: 'moonlight',
    name: 'Лунный Свет',
    bg: '#0a1020',
    panel: '#121a30',
    text: '#d0e0f5',
    muted: '#6a8aaa',
    accent: '#7ab8e8',
    border: '#2a3a5a',
    headerBg: 'rgba(122, 184, 232, 0.1)',
    dotColor: '#7ab8e8',
    cardBorder: '#1a2a4a',
    glow: 'rgba(122, 184, 232, 0.3)',
    inputBg: 'rgba(122, 184, 232, 0.08)'
  },
  {
    id: 'ember',
    name: 'Огненный',
    bg: '#150800',
    panel: '#2a1000',
    text: '#f0d4b0',
    muted: '#9a6a3a',
    accent: '#e87830',
    border: '#4a2a10',
    headerBg: 'rgba(232, 120, 48, 0.1)',
    dotColor: '#e87830',
    cardBorder: '#2a1505',
    glow: 'rgba(232, 120, 48, 0.3)',
    inputBg: 'rgba(232, 120, 48, 0.08)'
  }
];

export const DEFAULT_THEME_ID = 'classic';
