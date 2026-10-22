import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CharacterSheet } from '../types';

export const exportJSON = (character: CharacterSheet) => {
  const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VTM6E_${character.meta.name || 'Character'}.json`;
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

// A4 при 96 DPI — сохраняем пропорции при рендере в canvas
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

const getThemeBg = (): string => {
  if (typeof window === 'undefined') return '#ffffff';
  const v = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  return v || '#ffffff';
};

const renderPageToCanvas = async (elementId: string) => {
  const original = document.getElementById(elementId);
  if (!original) return null;

  const bgColor = getThemeBg();

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${A4_WIDTH_PX}px`;
  container.style.backgroundColor = bgColor;

  const clone = original.cloneNode(true) as HTMLElement;
  clone.style.display = 'block';
  clone.style.width = `${A4_WIDTH_PX}px`;
  clone.style.minHeight = `${A4_HEIGHT_PX}px`;
  clone.style.margin = '0';
  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: bgColor,
      useCORS: true,
      logging: false,
      windowWidth: A4_WIDTH_PX,
      onclone: (doc) => {
        (doc.querySelectorAll('input, textarea') as NodeListOf<HTMLElement>).forEach((el) => {
          el.style.background = 'var(--panel)';
          el.style.color = 'var(--text)';
          el.style.border = '1px solid var(--border)';
        });
      },
    });
    return canvas;
  } finally {
    document.body.removeChild(container);
  }
};

const addPageWithFit = (pdf: jsPDF, canvas: HTMLCanvasElement) => {
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  const img = canvas.toDataURL('image/png');
  const scale = Math.min(pdfW / canvas.width, pdfH / canvas.height);
  const w = canvas.width * scale;
  const h = canvas.height * scale;
  pdf.addImage(img, 'PNG', 0, 0, w, h);
};

export const exportAllPDFs = async (charName: string) => {
  toggleNoPrint(true);
  try {
    const page1 = await renderPageToCanvas('character-sheet');
    const page2 = await renderPageToCanvas('character-sheet-2');

    if (!page1 && !page2) throw new Error('Не удалось захватить страницы');

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4', hotfixes: ['px_scaling'] });

    if (page1) addPageWithFit(pdf, page1);
    if (page2) { pdf.addPage(); addPageWithFit(pdf, page2); }

    pdf.save(`VTM6E_${charName || 'Character'}_Full.pdf`);
  } catch (error) {
    console.error(error);
    alert('Ошибка экспорта PDF: ' + (error as Error).message);
  } finally {
    toggleNoPrint(false);
  }
};
