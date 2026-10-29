import { useCharacterStore } from '../store';
import { useTranslation } from 'react-i18next';
import { SheetPage1 } from '../components/SheetPage1';
import { SheetPage2 } from '../components/SheetPage2';
import { SheetPage3 } from '../components/SheetPage3';
import { SheetPageInventory } from '../components/SheetPageInventory';
import { SheetPage4 } from '../components/SheetPage4';
import { useSheetHotkeys } from '../hooks/useSheetHotkeys';

interface SheetPageProps {
  showTips: boolean;
  handleExportPdf: () => void;
}

export const SheetPage = ({ showTips, handleExportPdf }: SheetPageProps) => {
  useSheetHotkeys(handleExportPdf);
  const character = useCharacterStore((s) => s.getActive());
  const addPowerPage = useCharacterStore((s) => s.addPowerPage);
  const { t } = useTranslation();

  return (
    <div style={{ width: '100%', maxWidth: '210mm', margin: '0 auto', overflowX: 'auto' }}>
      <SheetPage1 showTips={showTips} />
      <SheetPage2 />
      <SheetPage3 />
      <SheetPageInventory />

      {character.powerPages?.map((page, idx) => (
        <SheetPage4 key={page.id} page={page} pageIndex={idx} />
      ))}

      <div className="no-print" style={{ marginTop: '20px', marginBottom: '40px', textAlign: 'center' }}>
        <button
          onClick={addPowerPage}
          disabled={character.powerPages?.length >= 5}
          style={{
            padding: '10px 20px',
            background: character.powerPages?.length >= 5 ? 'var(--border)' : 'var(--accent)',
            color: character.powerPages?.length >= 5 ? 'var(--muted)' : 'var(--bg)',
            border: 'none',
            borderRadius: '4px',
            cursor: character.powerPages?.length >= 5 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: "'Cinzel', serif"
          }}
        >
          {t('ui.add_page')}
        </button>
      </div>
    </div>
  );
};
