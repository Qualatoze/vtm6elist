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
  elements.forEach(el => { el.style.display = hide ? 'none' : ''; });
};

const renderPageToCanvas = async (elementId: string, width: number) => {
  const original = document.getElementById(elementId);
  if (!original) return null;

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${width}px`;
  container.style.backgroundColor = '#1a1a1a';

  const clone = original.cloneNode(true) as HTMLElement;
  clone.style.display = 'block';
  clone.style.width = `${width}px`;
  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#1a1a1a',
      useCORS: true,
      logging: false,
      windowWidth: width,
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

export const exportAllPDFs = async (charName: string) => {
  toggleNoPrint(true);
  try {
    const width = 1024;
    const page1 = await renderPageToCanvas('character-sheet', width);
    const page2 = await renderPageToCanvas('character-sheet-2', width);

    if (!page1 && !page2) throw new Error('Не удалось захватить страницы');

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4', hotfixes: ['px_scaling'] });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    if (page1) {
      const img1 = page1.toDataURL('image/png');
      const ratio = pdfWidth / page1.width;
      const imgHeight = page1.height * ratio;
      pdf.addImage(img1, 'PNG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
    }

    if (page2) {
      pdf.addPage();
      const img2 = page2.toDataURL('image/png');
      const ratio = pdfWidth / page2.width;
      const imgHeight = page2.height * ratio;
      pdf.addImage(img2, 'PNG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
    }

    pdf.save(`VTM6E_${charName || 'Character'}_Full.pdf`);
  } catch (error) {
    console.error(error);
    alert('Ошибка экспорта PDF: ' + (error as Error).message);
  } finally {
    toggleNoPrint(false);
  }
};
