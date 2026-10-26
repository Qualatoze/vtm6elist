import { useCharacterStore } from '../store';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus } from 'lucide-react';
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
  const { addInventoryItem, updateInventoryItem, removeInventoryItem } = useCharacterStore();
  const isMobile = useIsMobile();

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--border)',
    outline: 'none',
    padding: '4px 6px',
    fontSize: '12px',
    color: 'var(--text)',
    fontFamily: "'Georgia', serif",
    boxSizing: 'border-box',
  };

  return (
    <div id="character-sheet-inventory" className="sheet-page" style={{ ...sheetStyle, width: isMobile ? '100%' : 'min(210mm, 100%)' }}>
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Шапка таблицы */}
        <div style={{ display: 'flex', gap: '8px', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', borderBottom: '2px solid var(--border)', paddingBottom: '4px', paddingLeft: '28px' }}>
          <div style={{ flex: 2 }}>{t('ui.item_name')}</div>
          <div style={{ flex: 0.5, textAlign: 'center' }}>{t('ui.item_qty')}</div>
          <div style={{ flex: 3 }}>{t('ui.item_desc')}</div>
        </div>

        {/* Список предметов */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(!character.inventory || character.inventory.length === 0) && (
            <div className="no-print" style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '20px', fontSize: '12px' }}>
              {t('placeholders.empty_inventory')}
            </div>
          )}

          {character.inventory?.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              {/* Кнопка удаления (НЕ ПОПАДЕТ В PDF) */}
              <button
                className="no-print"
                onClick={() => removeInventoryItem(item.id)}
                style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '4px 0', flexShrink: 0, width: '20px' }}
                title={t('common.delete')}
              >
                <Trash2 size={14} />
              </button>

              {/* Название */}
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateInventoryItem(item.id, 'name', e.target.value)}
                style={{ ...inputStyle, flex: 2 }}
                placeholder={t('placeholders.item_name')}
              />

              {/* Количество */}
              <input
                type="text"
                value={item.qty}
                onChange={(e) => updateInventoryItem(item.id, 'qty', e.target.value)}
                style={{ ...inputStyle, flex: 0.5, textAlign: 'center' }}
                placeholder="1"
              />

              {/* Описание */}
              <textarea
                value={item.description}
                onChange={(e) => updateInventoryItem(item.id, 'description', e.target.value)}
                style={{ ...inputStyle, flex: 3, minHeight: '36px', resize: 'none' }}
                placeholder={t('placeholders.item_desc')}
                rows={2}
              />
            </div>
          ))}
        </div>

        {/* Кнопка добавления (НЕ ПОПАДЕТ В PDF) */}
        <button
          className="no-print"
          onClick={addInventoryItem}
          style={{
            marginTop: '10px',
            padding: '8px',
            background: 'var(--panel)',
            border: '1px dashed var(--border)',
            color: 'var(--text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '4px',
            flexShrink: 0
          }}
        >
          <Plus size={16} /> {t('ui.add_item')}
        </button>
      </div>
    </div>
  );
};
