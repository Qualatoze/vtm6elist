import { useMasterStore } from '../masterStore';
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
  fontFamily: "'Georgia', 'Times New Roman', serif",
  display: 'flex',
  flexDirection: 'column'
};

const inputStyle: React.CSSProperties = {
  background: 'var(--input-bg)',
  border: `1px solid var(--border)`,
  outline: 'none',
  padding: '2px 4px',
  fontSize: '12px',
  color: 'var(--text)',
  width: '100%',
  fontFamily: "'Georgia', serif",
  position: 'relative',
  zIndex: 10,
  boxSizing: 'border-box'
};

const sectionHeaderStyle: React.CSSProperties = {
  background: 'var(--headerBg)',
  color: 'var(--header-text, var(--text))',
  padding: '2px 4px',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '0.1em',
  textAlign: 'center',
  marginBottom: '4px',
  fontFamily: "'Georgia', serif"
};

export const MasterPage2 = () => {
  const { t } = useTranslation();
  const master = useMasterStore(s => s.master);
  const { updateNpcText } = useMasterStore();
  const isMobile = useIsMobile();

  return (
    <div className="master-page" style={{ ...sheetStyle, width: isMobile ? '100%' : '210mm' }}>
      {/* ===== НПС ===== */}
      <div style={{ ...sectionHeaderStyle }}>{t('master.npcs')}</div>
      <textarea
        value={master.npcText}
        onChange={(e) => updateNpcText(e.target.value)}
        placeholder={t('master.npc_text_placeholder')}
        style={{
          flex: 1,
          width: '100%',
          minHeight: '250mm',
          background: 'var(--input-bg)',
          border: '1px solid var(--border)',
          padding: '10px',
          fontSize: '12px',
          color: 'var(--text)',
          fontFamily: "'Georgia', serif",
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
          lineHeight: 1.6,
        }}
      />
    </div>
  );
};
