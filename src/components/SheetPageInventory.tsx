import { useCharacterStore } from '../store';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/useIsMobile';

const sheetStyle: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  backgroundColor: 'var(--bg)',
  color: 'var(--text)',
  margin: '0 auto',
  padding: '10mm',
  border: '3px solid var(--border)',
  boxSizing: 'border-box',
  fontFamily: "'Georgia', 'Times New Roman', 'Noto Sans SC', serif",
  display: 'flex',
  flexDirection: 'column',
};

export const SheetPageInventory = () => {
  const { t } = useTranslation();
  const character = useCharacterStore(s => s.getActive());
  const updateField = useCharacterStore(s => s.updateField);
  const isMobile = useIsMobile();

  return (
    <div
      id="character-sheet-inventory"
      className="sheet-page"
      style={{ ...sheetStyle, width: isMobile ? '100%' : 'min(210mm, 100%)' }}
    >
      <h1 style={{
        margin: '0 0 12px',
        fontSize: '16px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        textAlign: 'center',
        fontFamily: "'Georgia', 'Noto Sans SC', serif",
        flexShrink: 0,
      }}>
        {t('ui.inventory')}
      </h1>
      <textarea
        value={character.inventoryText || ''}
        onChange={(e) => updateField('inventoryText', e.target.value)}
        placeholder={t('placeholders.inventory')}
        style={{
          flex: 1,
          width: '100%',
          minHeight: '200px',
          background: 'var(--input-bg)',
          border: '1px solid var(--border)',
          padding: '10px',
          fontSize: '12px',
          color: 'var(--text)',
          fontFamily: "'Georgia', 'Noto Sans SC', serif",
          outline: 'none',
          resize: 'none',
          boxSizing: 'border-box',
          lineHeight: 1.5,
        }}
      />
    </div>
  );
};
