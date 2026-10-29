// Хоткейсы Ctrl+S (JSON) / Ctrl+P (PDF) — активны ТОЛЬКО на странице листа.
// Хук монтируется внутри SheetPage, поэтому при переходе на /account или /master
// слушатель удаляется и хоткейсы не срабатывают.
import { useEffect, useRef } from 'react';
import { useCharacterStore } from '../store';
import { exportJSON } from '../utils/exportImport';

export function useSheetHotkeys(handleExportPdf: () => void) {
  const pdfRef = useRef(handleExportPdf);
  useEffect(() => {
    pdfRef.current = handleExportPdf;
  }, [handleExportPdf]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportJSON(useCharacterStore.getState().getActive());
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        pdfRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
