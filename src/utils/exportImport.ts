import { toCanvas } from 'html-to-image';
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

const renderPageToCanvas = async (elementId: string, forceClassic: boolean): Promise<HTMLCanvasElement | null> => {
  const original = document.getElementById(elementId);
  if (!original) return null;

  const width = 794;

  const container = document.createElement('div');
  container.style.cssText = `position:fixed;top:0;left:-9999px;width:${width}px;z-index:-9999;`;
  document.body.appendChild(container);

  const clone = original.cloneNode(true) as HTMLElement;

  // ПРИМЕНЯЕМ КЛАССИЧЕСКУЮ ТЕМУ (если включено)
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

  const bgColor = forceClassic ? '#ffffff' : getThemeBg();

  // ВАЖНО: Синхронизация ДО удаления .no-print
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
    padding: '37.8px',
    border: 'none',
    boxSizing: 'border-box',
    backgroundColor: bgColor,
    overflow: 'visible',
  });

  container.appendChild(clone);

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
    sel.parentNode?.replaceChild(div, sel);
  });

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

  try {
    await document.fonts.ready;
    void clone.offsetHeight; // Форсируем перерасчет

    // Замеряем реальную высоту отрендеренного блока
    const actualHeight = Math.ceil(clone.getBoundingClientRect().height);

    return await toCanvas(clone, {
      pixelRatio: 3,
      backgroundColor: bgColor,
      width,
      height: actualHeight,
    });
  } finally {
    document.body.removeChild(container);
  }
};

export const exportAllPDFs = async (
  charName: string,
  onProgress?: (current: number, total: number) => void,
  forceClassic: boolean = false
) => {
  try {
    const sheetElements = Array.from(document.querySelectorAll<HTMLElement>('.sheet-page'));
    if (sheetElements.length === 0) throw new Error('Не удалось найти страницы персонажа');

    const total = sheetElements.length;
    const canvases: (HTMLCanvasElement | null)[] = [];

    for (let i = 0; i < total; i++) {
      const el = sheetElements[i];
      canvases.push(await renderPageToCanvas(el.id, forceClassic));
      if (onProgress) onProgress(i + 1, total);
    }

    const valid = canvases.filter((c): c is HTMLCanvasElement => !!c);
    if (valid.length === 0) throw new Error('Не удалось захватить страницы');

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    valid.forEach((canvas, idx) => {
      if (idx > 0) pdf.addPage();

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Рассчитываем пропорции, чтобы картинка влезла целиком
      const canvasW = canvas.width;
      const canvasH = canvas.height;
      const scale = Math.min(pdfW / canvasW, pdfH / canvasH);

      const renderW = canvasW * scale;
      const renderH = canvasH * scale;

      // Центрируем по горизонтали, прижимаем к верху по вертикали
      const offsetX = (pdfW - renderW) / 2;
      const offsetY = 0;

      pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderW, renderH);

      canvas.width = 0;
      canvas.height = 0;
    });

    pdf.save(`VTM6E_${sanitizeName(charName)}_Full.pdf`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
