import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { CharacterSheet } from '../types';

const sanitizeName = (name: string) => {
  return (name || 'Character').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim() || 'Character';
};

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
          && c.skills && c.disciplines && Array.isArray(c.disciplines)
          && c.resources && Array.isArray(c.resources);

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

const toggleNoPrint = (hide: boolean) => {
  const elements = document.querySelectorAll<HTMLElement>('.no-print');
  elements.forEach(el => {
    if (hide) {
      el.dataset.prevDisplay = el.style.display || '';
      el.style.display = 'none';
    } else {
      el.style.display = el.dataset.prevDisplay || '';
      delete el.dataset.prevDisplay;
    }
  });
};

const getThemeBg = (): string => {
  if (typeof window === 'undefined') return '#ffffff';
  const v = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  return v || '#ffffff';
};

const renderPageToCanvas = async (elementId: string) => {
  const original = document.getElementById(elementId);
  if (!original) return null;

  const bgColor = getThemeBg();
  const width = 794; // 210mm
  const height = 1123; // 297mm

  // Создаем контейнер вне экрана
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-9999px';
  container.style.width = `${width}px`;
  container.style.zIndex = '-9999';

  const clone = original.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));

  // ФИКС: Синхронизируем динамические значения из React в клон
  const origInputs = original.querySelectorAll('input, textarea, select');
  const cloneInputs = clone.querySelectorAll('input, textarea, select');

  origInputs.forEach((origEl, i) => {
    const cloneEl = cloneInputs[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!cloneEl) return;

    if (origEl instanceof HTMLInputElement) {
      cloneEl.value = origEl.value;
      if (origEl.type === 'checkbox') {
        (cloneEl as HTMLInputElement).checked = origEl.checked;
      }
    } else if (origEl instanceof HTMLTextAreaElement) {
      cloneEl.value = origEl.value;
    } else if (origEl instanceof HTMLSelectElement) {
      cloneEl.value = origEl.value;
    }
  });

  // Настраиваем клон
  clone.style.display = 'block';
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minHeight = `${height}px`;
  clone.style.margin = '0';
  clone.style.padding = '37.8px'; // 10mm
  clone.style.border = 'none';
  clone.style.boxSizing = 'border-box';
  clone.style.backgroundColor = bgColor;
  clone.style.overflow = 'hidden';

  // КОСТЫЛЬ ДЛЯ ИДЕАЛЬНОГО РЕНДЕРА: заменяем select на div
  clone.querySelectorAll('select').forEach(sel => {
    const text = sel.options[sel.selectedIndex]?.text || '';
    const div = document.createElement('div');
    div.textContent = text;
    div.style.cssText = window.getComputedStyle(sel).cssText;
    div.style.background = 'var(--input-bg)';
    div.style.border = '1px solid var(--border)';
    div.style.padding = '2px 4px';
    div.style.fontSize = '12px';
    div.style.fontFamily = "'Georgia', serif";
    div.style.height = '22px';
    div.style.boxSizing = 'border-box';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    sel.parentNode?.replaceChild(div, sel);
  });

  // Заменяем чекбоксы на div
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

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // Ждем загрузки шрифтов
    await document.fonts.ready;
    
    const canvas = await toCanvas(clone, {
      pixelRatio: 2,
      backgroundColor: bgColor,
      width: width,
      height: height,
    });
    return canvas;
  } finally {
    document.body.removeChild(container);
  }
};

export const exportAllPDFs = async (charName: string) => {
  toggleNoPrint(true);
  try {
    const page1 = await renderPageToCanvas('character-sheet');
    const page2 = await renderPageToCanvas('character-sheet-2');

    if (!page1 && !page2) throw new Error('Не удалось захватить страницы');

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth(); // 210
    const pdfH = pdf.internal.pageSize.getHeight(); // 297

    const addPage = (canvas: HTMLCanvasElement) => {
      if (!canvas || canvas.width === 0 || canvas.height === 0) return;
      const img = canvas.toDataURL('image/png');
      pdf.addImage(img, 'PNG', 0, 0, pdfW, pdfH);
    };

    if (page1) addPage(page1);
    if (page2) { pdf.addPage(); addPage(page2); }

    pdf.save(`VTM6E_${sanitizeName(charName)}_Full.pdf`);
  } catch (error) {
    console.error(error);
    alert('Ошибка экспорта PDF: ' + (error as Error).message);
  } finally {
    toggleNoPrint(false);
  }
};
