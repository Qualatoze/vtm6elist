import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/useIsMobile';

// Базовые стили страницы А4
const pageStyle: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  backgroundColor: 'var(--bg)',
  color: 'var(--text)',
  margin: '0 auto 20px auto',
  padding: '10mm',
  border: '3px solid var(--border)',
  boxSizing: 'border-box',
  fontFamily: "'Georgia', 'Times New Roman', serif",
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginBottom: '12px',
  padding: '4px 8px',
  background: 'var(--panel)',
  border: `1px solid var(--border)`,
  borderRadius: '4px',
};

const toolbarBtnStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--input-bg)',
  border: `1px solid var(--border)`,
  color: 'var(--text)',
  fontSize: '16px',
  cursor: 'pointer',
  borderRadius: '4px',
  padding: 0,
};

const pageHeaderStyle: React.CSSProperties = {
  background: 'var(--headerBg)',
  color: 'var(--header-text, var(--text))',
  padding: '6px 10px',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '0.1em',
  textAlign: 'center',
  marginBottom: '8px',
  fontFamily: "'Georgia', serif",
};

const panelTitleStyle: React.CSSProperties = {
  margin: '0 0 4px',
  fontSize: '15px',
  fontWeight: 'bold',
  color: 'var(--accent)',
  fontFamily: "'Georgia', serif",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 6px',
  fontSize: '15px',
  fontWeight: 'bold',
  color: 'var(--accent)',
  fontFamily: "'Georgia', serif",
  marginTop: '12px',
};

const A4Page = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  return (
    <div className="master-page sheet-page" style={{ ...pageStyle, width: isMobile ? '100%' : '210mm' }}>
      {children}
    </div>
  );
};

export const MasterPage4 = () => {
  const { t } = useTranslation();
  const [fontSize, setFontSize] = useState(14);

  // Таблицы
  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: `${fontSize - 1}px`,
    lineHeight: 1.4,
    fontFamily: "'Georgia', serif",
    marginBottom: '10px',
  };

  const tableHeadStyle: React.CSSProperties = {
    background: 'var(--headerBg)',
    color: 'var(--header-text, var(--text))',
    padding: '4px 6px',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: `${fontSize - 2}px`,
    border: `1px solid var(--border)`,
  };

  const tableCellStyle: React.CSSProperties = {
    padding: '4px 6px',
    border: `1px solid var(--border)`,
    color: 'var(--text)',
    verticalAlign: 'top',
  };

  const renderExampleTable = (prefix: string, count: number) => (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={{ ...tableHeadStyle, width: '32px' }}>№</th>
          <th style={tableHeadStyle}>{t('master.ref.example_col')}</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: count }, (_, i) => (
          <tr key={i}>
            <td style={{ ...tableCellStyle, textAlign: 'center', fontWeight: 'bold', color: 'var(--accent)' }}>{i + 1}</td>
            <td style={tableCellStyle}>{t(`${prefix}_${i + 1}`)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderPanelBlock = (n: number) => (
    <div style={{ marginBottom: '12px' }}>
      <h3 style={{ ...panelTitleStyle, fontSize: `${fontSize + 1}px` }}>{t(`master.ref.panel_${n}_title`)}</h3>
      <p style={{ margin: 0, fontSize: `${fontSize}px`, lineHeight: 1.5, color: 'var(--text)', whiteSpace: 'pre-line' }}>
        {t(`master.ref.panel_${n}_text`)}
      </p>
    </div>
  );

  return (
    <>
      {/* Панель управления (не печатается) */}
      <div className="no-print" style={toolbarStyle}>
        <button onClick={() => setFontSize(f => Math.max(10, f - 1))} style={toolbarBtnStyle} title={t('master.ref.font_minus')}>−</button>
        <span style={{ fontSize: `${fontSize}px`, fontWeight: 'bold', color: 'var(--accent)', minWidth: '40px', textAlign: 'center' }}>{fontSize}px</span>
        <button onClick={() => setFontSize(f => Math.min(24, f + 1))} style={toolbarBtnStyle} title={t('master.ref.font_plus')}>+</button>
      </div>

      {/* СТРАНИЦА 1: Текстовые панели (в 2 колонки) */}
      <A4Page>

        <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
          {/* Левая колонка: Панели 1-3 */}
          <div style={{ flex: 1 }}>
            {renderPanelBlock(1)}
            {renderPanelBlock(2)}
            {renderPanelBlock(3)}
          </div>
          {/* Правая колонка: Панели 4-6 */}
          <div style={{ flex: 1 }}>
            {renderPanelBlock(4)}
            {renderPanelBlock(5)}
            {renderPanelBlock(6)}
          </div>
        </div>
      </A4Page>

      {/* СТРАНИЦА 2: Таблицы */}
      <A4Page>

        <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
          {/* Левая колонка таблиц */}
          <div style={{ flex: 1 }}>
            <div style={{ ...sectionTitleStyle, marginTop: 0 }}>◆ {t('master.ref.beast')}</div>
            {renderExampleTable('master.ref.beast', 10)}

            <div style={sectionTitleStyle}>◆ {t('master.ref.drama_examples')}</div>
            {renderExampleTable('master.ref.drama', 10)}
          </div>

          {/* Правая колонка таблиц */}
          <div style={{ flex: 1 }}>
            <div style={{ ...sectionTitleStyle, marginTop: 0 }}>◆ {t('master.ref.nature')}</div>
            {renderExampleTable('master.ref.nature', 10)}

            <div style={sectionTitleStyle}>◆ {t('master.ref.checks')}</div>
            {renderExampleTable('master.ref.check', 10)}
          </div>
        </div>

        {/* Внизу по центру - Конфликты */}
        <div style={{ marginTop: '20px' }}>
          <div style={sectionTitleStyle}>◆ {t('master.ref.conflicts')}</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>{renderExampleTable('master.ref.conflict', 5)}</div>
            <div style={{ flex: 1 }}>{renderExampleTable('master.ref.conflict', 5)}</div>
          </div>
        </div>
      </A4Page>
    </>
  );
};
