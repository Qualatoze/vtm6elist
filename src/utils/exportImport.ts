import { toCanvas, getFontEmbedCSS } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { CharacterSheet } from '../types';
import { THEMES } from '../themes';

const sanitizeName = (name: string) =>
  (name || 'Character')
    .replace(/[<>:"/\\|?*\x00-\x1F]+/g, '_')
    .replace(/_+/g, '_')
    .trim() || 'Character';

export const exportJSON = (character: CharacterSheet) => {
  const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VTM6E_${sanitizeName(character.meta.name)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importJSONFile = (
  file: File,
  onSuccess: (data: CharacterSheet | CharacterSheet[]) => void,
  onError: (msg: string) => void
) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target?.result as string);
      const isValidCharacter = (c: any) =>
        c && typeof c === 'object' && c.meta && c.attributes
          && c.attributes.physical && c.attributes.social && c.attributes.mental
          && c.skills;
      if (Array.isArray(parsed)) {
        if (!parsed.every(isValidCharacter)) throw new Error('В массиве есть невалидные персонажи');
        onSuccess(parsed);
      } else if (isValidCharacter(parsed)) {
        onSuccess(parsed);
      } else {
        throw new Error('Файл не содержит листа персонажа VTM 6E');
      }
    } catch (err) {
      onError((err as Error).message);
    }
  };
  reader.onerror = () => onError('Не удалось прочитать файл');
  reader.readAsText(file);
};

const getThemeBg = (): string => {
  if (typeof window === 'undefined') return '#ffffff';
  const v = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  return v || '#ffffff';
};

let fontsReadyPromise: Promise<FontFaceSet> | null = null;
let fontEmbedCache: string | null = null;

const isMobileDevice = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

const renderPageToCanvas = async (
  elementId: string,
  forceClassic: boolean,
  removeBackground: boolean
): Promise<HTMLCanvasElement | null> => {
  const original = document.getElementById(elementId);
  if (!original) return null;

  const width = 794;

  const container = document.createElement('div');
  container.style.cssText = `position:fixed;top:0;left:-9999px;width:${width}px;z-index:-9999;`;
  document.body.appendChild(container);

  const clone = original.cloneNode(true) as HTMLElement;

  // 1. Считываем ВСЕ текущие переменные темы из корня документа
  const rootStyle = getComputedStyle(document.documentElement);
  const themeVars = {
    bg: rootStyle.getPropertyValue('--bg').trim() || '#ffffff',
    panel: rootStyle.getPropertyValue('--panel').trim() || '#f8f8f8',
    text: rootStyle.getPropertyValue('--text').trim() || '#000000',
    muted: rootStyle.getPropertyValue('--muted').trim() || '#555555',
    accent: rootStyle.getPropertyValue('--accent').trim() || '#000000',
    border: rootStyle.getPropertyValue('--border').trim() || '#000000',
    'header-bg': rootStyle.getPropertyValue('--header-bg').trim() || 'rgba(0,0,0,0.08)',
    'header-text': rootStyle.getPropertyValue('--header-text').trim() || '#000000',
    'dot-color': rootStyle.getPropertyValue('--dot-color').trim() || '#000000',
    'card-border': rootStyle.getPropertyValue('--card-border').trim() || '#cccccc',
    glow: rootStyle.getPropertyValue('--glow').trim() || 'transparent',
    'input-bg': rootStyle.getPropertyValue('--input-bg').trim() || '#ffffff',
  };

  // Применяем их явно к клону, чтобы html-to-image их "увидел"
  Object.entries(themeVars).forEach(([k, v]) => {
    clone.style.setProperty(`--${k}`, v);
  });

  // 2. Принудительно применяем Classic (если выбрано)
  if (forceClassic) {
    const classic = THEMES.find(t => t.id === 'classic')!;
    clone.style.setProperty('--bg', classic.bg);
    clone.style.setProperty('--text', classic.text);
    clone.style.setProperty('--panel', classic.panel);
    clone.style.setProperty('--muted', classic.muted);
    clone.style.setProperty('--accent', classic.accent);
    clone.style.setProperty('--border', classic.border);
    clone.style.setProperty('--header-bg', classic.headerBg);
    clone.style.setProperty('--header-text', classic.headerText);
    clone.style.setProperty('--dot-color', classic.dotColor);
    clone.style.setProperty('--card-border', classic.cardBorder);
    clone.style.setProperty('--input-bg', classic.inputBg);
  }

  // 3. Убираем фон (экономия чернил)
  if (removeBackground) {
    // Переопределяем ТОЛЬКО фон и текст, чтобы экономить чернила.
    // Акцентные цвета (--accent, --border, --dot-color, --header-bg, --card-border) НЕ ТРОГАЕМ,
    // чтобы лист сохранил свою цветовую идентичность.
    clone.style.setProperty('--bg', '#ffffff');
    clone.style.setProperty('--panel', '#ffffff');
    clone.style.setProperty('--input-bg', '#ffffff');
    clone.style.setProperty('--text', themeVars.accent);
    clone.style.setProperty('--header-text', themeVars.accent);
    clone.style.setProperty('--muted', '#555555');

    const style = document.createElement('style');
    style.textContent = `
      .sheet-page { background-color: #ffffff !important; }
      textarea, input, select { background-color: #ffffff !important; }
      * { box-shadow: none !important; text-shadow: none !important; }
    `;
    clone.appendChild(style);
  }

  const bgColor = removeBackground ? '#ffffff' : (forceClassic ? '#ffffff' : getThemeBg());

  // Синхронизация форм
  const origInputs = original.querySelectorAll('input, textarea, select');
  const cloneInputs = clone.querySelectorAll('input, textarea, select');
  origInputs.forEach((origEl, i) => {
    const cloneEl = cloneInputs[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!cloneEl) return;
    if (origEl instanceof HTMLInputElement) {
      cloneEl.value = origEl.value;
      if (origEl.type === 'checkbox') (cloneEl as HTMLInputElement).checked = origEl.checked;
    } else if (origEl instanceof HTMLTextAreaElement) {
      cloneEl.value = origEl.value;
    } else if (origEl instanceof HTMLSelectElement) {
      cloneEl.value = origEl.value;
    }
  });

  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  clone.querySelectorAll('.no-print, [class*="no-print"]').forEach(n => n.remove());

  Object.assign(clone.style, {
    width: `${width}px`,
    height: 'auto',
    minHeight: 'auto',
    maxHeight: 'none',
    margin: '0',
    padding: '10mm',
    border: 'none',
    boxSizing: 'border-box',
    backgroundColor: bgColor,
    overflow: 'visible',
  });

  container.appendChild(clone);

  // <select> → div
  clone.querySelectorAll('select').forEach(sel => {
    const text = sel.options[sel.selectedIndex]?.text || '';
    const cs = window.getComputedStyle(sel);
    const div = document.createElement('div');
    div.textContent = text;
    div.style.fontFamily = cs.fontFamily;
    div.style.fontSize = cs.fontSize;
    div.style.color = cs.color;
    div.style.background = 'var(--input-bg)';
    div.style.border = '1px solid var(--border)';
    div.style.padding = '2px 4px';
    div.style.height = '22px';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.boxSizing = 'border-box';
    div.style.whiteSpace = 'nowrap';
    div.style.overflow = 'hidden';
    div.style.textOverflow = 'ellipsis';
    sel.parentNode?.replaceChild(div, sel);
  });

  // Чекбоксы → div
  clone.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    const isChecked = (cb as HTMLInputElement).checked;
    const div = document.createElement('div');
    div.style.width = '13px';
    div.style.height = '13px';
    div.style.border = '1px solid var(--border)';
    div.style.background = isChecked ? 'var(--accent)' : 'transparent';
    div.style.flexShrink = '0';
    cb.parentNode?.replaceChild(div, cb);
  });

  // Текстовые поля <input> → div
  clone.querySelectorAll('input').forEach(inp => {
    if ((inp as HTMLInputElement).type === 'checkbox') return;

    const el = inp as HTMLInputElement;
    const cs = window.getComputedStyle(el);

    const div = document.createElement('div');
    div.textContent = el.value || '';

    div.style.fontFamily = cs.fontFamily;
    div.style.fontSize = cs.fontSize;
    div.style.color = cs.color;
    div.style.padding = cs.padding;
    div.style.backgroundColor = cs.backgroundColor;
    div.style.border = '1px solid var(--border)';
    div.style.boxSizing = 'border-box';

    div.style.width = '100%';
    div.style.height = cs.height;
    div.style.flex = cs.flex || '1';
    div.style.minWidth = '0';

    div.style.whiteSpace = 'nowrap';
    div.style.overflow = 'hidden';
    div.style.textOverflow = 'ellipsis';

    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = cs.textAlign === 'center' ? 'center' : 'flex-start';

    el.parentNode?.replaceChild(div, el);
  });

  // Текстареи → div
  clone.querySelectorAll('textarea').forEach(ta => {
    const el = ta as HTMLTextAreaElement;
    const cs = window.getComputedStyle(el);
    const div = document.createElement('div');
    div.textContent = el.value || '';
    div.style.fontFamily = cs.fontFamily;
    div.style.fontSize = cs.fontSize;
    div.style.lineHeight = cs.lineHeight;
    div.style.color = cs.color;
    div.style.backgroundColor = cs.backgroundColor;
    div.style.padding = cs.padding;
    div.style.border = '1px solid var(--border)';
    div.style.boxSizing = 'border-box';
    div.style.whiteSpace = 'pre-wrap';
    div.style.overflowWrap = 'break-word';
    div.style.overflow = 'hidden';
    div.style.flex = cs.flex || '1';
    div.style.minHeight = '0';
    div.style.minWidth = '0';
    el.parentNode?.replaceChild(div, el);
  });

  // Убираем нативные артефакты кнопок и инпутов
  const styleReset = document.createElement('style');
  styleReset.textContent = `
    * {
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      outline: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
  `;
  clone.appendChild(styleReset);

  try {
    if (!fontsReadyPromise) fontsReadyPromise = document.fonts.ready;
    await fontsReadyPromise;

    if (fontEmbedCache === null) {
      try {
        fontEmbedCache = await getFontEmbedCSS(clone);
      } catch {
        fontEmbedCache = '';
      }
    }

    const actualHeight = Math.ceil(clone.getBoundingClientRect().height);
    const pixelRatio = isMobileDevice() ? 2 : 3;

    const options: Parameters<typeof toCanvas>[1] = {
      pixelRatio,
      backgroundColor: bgColor,
      width,
      height: actualHeight,
    };
    if (fontEmbedCache !== null) {
      options.fontEmbedCSS = fontEmbedCache;
    }

    return await toCanvas(clone, options);
  } finally {
    document.body.removeChild(container);
  }
};

export const exportAllPDFs = async (
  charName: string,
  onProgress?: (current: number, total: number) => void,
  forceClassic: boolean = false,
  removeBackground: boolean = false
) => {
  fontsReadyPromise = null;
  fontEmbedCache = null;

  try {
    const sheetElements = Array.from(document.querySelectorAll<HTMLElement>('.sheet-page'));
    if (sheetElements.length === 0) throw new Error('Не удалось найти страницы персонажа');

    const total = sheetElements.length;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    let pageAdded = 0;

    for (let i = 0; i < total; i++) {
      const canvas = await renderPageToCanvas(sheetElements[i].id, forceClassic, removeBackground);
      if (onProgress) onProgress(i + 1, total);

      if (!canvas) {
        await new Promise(r => setTimeout(r, 0));
        continue;
      }

      if (pageAdded > 0) pdf.addPage();
      const imgData = canvas.toDataURL('image/jpeg', 0.93);

      const scale = Math.min(pdfW / canvas.width, pdfH / canvas.height);
      const renderW = canvas.width * scale;
      const renderH = canvas.height * scale;
      const offsetX = (pdfW - renderW) / 2;

      pdf.addImage(imgData, 'JPEG', offsetX, 0, renderW, renderH);

      canvas.width = 0;
      canvas.height = 0;
      pageAdded++;

      await new Promise(r => setTimeout(r, 0));
    }

    if (pageAdded === 0) throw new Error('Не удалось захватить страницы');
    pdf.save(`VTM6E_${sanitizeName(charName)}_Full.pdf`);
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    fontsReadyPromise = null;
    fontEmbedCache = null;
  }
};
