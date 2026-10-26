import { useState, useEffect } from 'react';
import { useCharacterStore } from '../store';
import { DISCIPLINE_POWERS } from '../data/disciplinePowers';
import { DISCIPLINES_LIST } from '../types';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus } from 'lucide-react';
import type { PowerPage, DisciplineCard } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';


export const SheetPage4 = ({ page, pageIndex }: { page: PowerPage; pageIndex: number }) => {
  const { t } = useTranslation();
  const { 
    addDisciplineCard, 
    updateDisciplineCard, 
    removeDisciplineCard, 
    removePowerPage,
    updatePowerPageSettings 
  } = useCharacterStore();
  const isMobile = useIsMobile();

  const resolveText = (key: string): string => {
    if (!key) return '';
    if (key.startsWith('powers.') || key.startsWith('powers_meta.')) {
      return t(key);
    }
    return key;
  };

  const formatDescription = (descKey: string, upgradeKey: string) => {
    const desc = resolveText(descKey);
    const upgrade = resolveText(upgradeKey);
    if (!upgrade || upgrade.trim() === '' || upgrade === 'None.' || upgrade === 'Нет.' || upgrade === '无') {
      return desc;
    }
    return `${desc}\n\n⬆️ ${t('ui.card_upgrade')}: ${upgrade}`;
  };

  const handleDisciplineChange = (card: DisciplineCard, discId: string) => {
    const disc = DISCIPLINE_POWERS[discId];
    const firstPower = disc?.powers[0];
    updateDisciplineCard(page.id, card.id, {
      disciplineId: discId,
      powerId: firstPower ? firstPower.id : '',
      name: firstPower ? firstPower.name : '',
      rank: firstPower ? firstPower.rank : 1,
      type: firstPower ? firstPower.type : '',
      activation: firstPower ? firstPower.activation : '',
      trait: firstPower ? firstPower.trait : '',
      cost: firstPower ? firstPower.cost : '',
      difficulty: firstPower ? firstPower.difficulty : '',
      range: firstPower ? firstPower.range : '',
      duration: firstPower ? firstPower.duration : '',
      description: firstPower ? firstPower.description : '',
      upgrade: firstPower ? firstPower.upgrade : '',
    });
  };

  const handlePowerChange = (card: DisciplineCard, powerId: string) => {
    const disc = DISCIPLINE_POWERS[card.disciplineId];
    const power = disc?.powers.find(p => p.id === powerId);
    if (power) {
      updateDisciplineCard(page.id, card.id, {
        powerId,
        name: power.name,
        rank: power.rank,
        type: power.type,
        activation: power.activation,
        trait: power.trait,
        cost: power.cost,
        difficulty: power.difficulty,
        range: power.range,
        duration: power.duration,
        description: power.description,
        upgrade: power.upgrade,
      });
    }
  };

  const inputStyle = {
    background: 'var(--input-bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    padding: '2px 4px',
    width: '100%',
    outline: 'none',
    fontFamily: "'Georgia', serif",
    boxSizing: 'border-box' as const,
  };

  const layout = page.layout || 4;
  const fontSize = page.fontSize || 11;
  const totalCols = isMobile ? 1 : layout <= 4 ? 2 : layout <= 6 ? 3 : layout <= 8 ? 4 : 5;

  return (
    <div
      id={`character-sheet-${page.id}`}
      className="sheet-page"
      style={{
        width: 'min(210mm, 100%)',
        height: isMobile ? 'auto' : '297mm',
        maxHeight: isMobile ? 'none' : '297mm',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        margin: '0 auto 20px auto',
        padding: isMobile ? '4mm' : '8mm',
        border: '3px solid var(--border)',
        boxSizing: 'border-box',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        overflow: 'hidden',
      }}
    >
      {/* ШАПКА */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border)', paddingBottom: '4px', flexShrink: 0, flexWrap: 'wrap', gap: '8px' }}>
        <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {t('ui.power_cards')}
        </h1>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {t('ui.layout')}:
            <select value={layout} onChange={e => updatePowerPageSettings(page.id, { layout: Number(e.target.value) as any })} style={{ ...inputStyle, width: 'auto', padding: '2px 4px' }}>
              <option value={4}>4 {t('ui.cards')}</option>
              <option value={6}>6 {t('ui.cards')}</option>
              <option value={8}>8 {t('ui.cards')}</option>
              <option value={10}>10 {t('ui.cards')}</option>
            </select>
          </label>
          
          <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {t('ui.font_size')}:
            <select value={fontSize} onChange={e => updatePowerPageSettings(page.id, { fontSize: Number(e.target.value) })} style={{ ...inputStyle, width: 'auto', padding: '2px 4px' }}>
              <option value={9}>9px</option>
              <option value={10}>10px</option>
              <option value={11}>11px</option>
              <option value={12}>12px</option>
              <option value={14}>14px</option>
            </select>
          </label>

          {pageIndex > 0 && (
            <button onClick={() => { if (confirm(t('ui.confirm_delete_page'))) removePowerPage(page.id); }} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
              <Trash2 size={14} /> {t('ui.delete_page')}
            </button>
          )}
        </div>
      </div>

      {/* СЕТКА КАРТОЧЕК */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : `repeat(${layout / 2}, 1fr)`,
        gap: '12px',
        paddingLeft: isMobile ? '0' : '24px',
        paddingRight: isMobile ? '0' : '24px',
        flex: 1,
        minHeight: 0,
        gridAutoRows: 'minmax(0, 1fr)'
      }}>
        {Array.from({ length: layout }).map((_, i) => {
          const card = page.cards[i];
          const colIndex = i % totalCols;
          
          if (!card) {
            return (
              <div
                key={`empty-${i}`}
                className="no-print"
                onClick={() => addDisciplineCard(page.id, i)}
                style={{
                  border: '1px dashed var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '100px',
                  cursor: 'pointer',
                  padding: '10px',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--muted)' }}>
                  <Plus size={16} />
                  <span style={{ fontSize: '10px' }}>{t('ui.add_card')}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={card.id} style={{
              border: '1px solid var(--border)',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              background: 'var(--bg)',
              position: 'relative',
              overflow: 'visible',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              
              {/* Кнопка удаления */}
              <button
                className="no-print"
                onClick={() => removeDisciplineCard(page.id, card.id)}
                style={{
                  position: 'absolute',
                  top: 2,
                  left: (!isMobile && colIndex === 0) ? '-24px' : 'auto',
                  right: (!isMobile && colIndex !== 0) ? '-24px' : 'auto',
                  ...(isMobile ? { right: 2, top: 2 } : {}),
                  background: 'none',
                  border: 'none',
                  color: '#e74c3c',
                  cursor: 'pointer',
                  zIndex: 10,
                  padding: 0,
                }}
              >
                <Trash2 size={14} />
              </button>

              {/* Выбор дисциплины и силы */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <select value={card.disciplineId} onChange={(e) => handleDisciplineChange(card, e.target.value)} style={{ ...inputStyle, fontSize: `${fontSize}px` }}>
                  <option value="">{t('ui.select_discipline')}</option>
                  {DISCIPLINES_LIST.filter(d => DISCIPLINE_POWERS[d.id]).map(d => <option key={d.id} value={d.id}>{t(d.label)}</option>)}
                </select>
                <select value={card.powerId} onChange={(e) => handlePowerChange(card, e.target.value)} style={{ ...inputStyle, fontSize: `${fontSize}px` }} disabled={!card.disciplineId}>
                  <option value="">{t('ui.select_power')}</option>
                  {DISCIPLINE_POWERS[card.disciplineId]?.powers.map(p => (
                    <option key={p.id} value={p.id}>{t(p.name)} ({p.rank})</option>
                  ))}
                </select>
              </div>

              {card.powerId && (
                <>
                  <input 
                    value={resolveText(card.name)}
                    onChange={e => updateDisciplineCard(page.id, card.id, { name: e.target.value })} 
                    style={{ ...inputStyle, fontWeight: 'bold', fontSize: `${fontSize + 1}px`, textAlign: 'center', padding: '4px', marginTop: '2px' }} 
                  />
                  
                  {/* Параметры */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px 6px', fontSize: `${fontSize - 2}px`, marginTop: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span style={{ color: 'var(--muted)', fontSize: '8px', flexShrink: 0 }}>{t('ui.card_activation')}:</span>
                      <input value={resolveText(card.activation)} onChange={e => updateDisciplineCard(page.id, card.id, { activation: e.target.value })} style={{ ...inputStyle, padding: '1px 2px', fontSize: `${fontSize - 2}px`, minWidth: 0 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span style={{ color: 'var(--muted)', fontSize: '8px', flexShrink: 0 }}>{t('ui.card_trait')}:</span>
                      <input value={resolveText(card.trait)} onChange={e => updateDisciplineCard(page.id, card.id, { trait: e.target.value })} style={{ ...inputStyle, padding: '1px 2px', fontSize: `${fontSize - 2}px`, minWidth: 0 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span style={{ color: 'var(--muted)', fontSize: '8px', flexShrink: 0 }}>{t('ui.card_cost')}:</span>
                      <input value={resolveText(card.cost)} onChange={e => updateDisciplineCard(page.id, card.id, { cost: e.target.value })} style={{ ...inputStyle, padding: '1px 2px', fontSize: `${fontSize - 2}px`, minWidth: 0 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span style={{ color: 'var(--muted)', fontSize: '8px', flexShrink: 0 }}>{t('ui.card_difficulty')}:</span>
                      <input value={resolveText(card.difficulty)} onChange={e => updateDisciplineCard(page.id, card.id, { difficulty: e.target.value })} style={{ ...inputStyle, padding: '1px 2px', fontSize: `${fontSize - 2}px`, minWidth: 0 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span style={{ color: 'var(--muted)', fontSize: '8px', flexShrink: 0 }}>{t('ui.card_range')}:</span>
                      <input value={resolveText(card.range)} onChange={e => updateDisciplineCard(page.id, card.id, { range: e.target.value })} style={{ ...inputStyle, padding: '1px 2px', fontSize: `${fontSize - 2}px`, minWidth: 0 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span style={{ color: 'var(--muted)', fontSize: '8px', flexShrink: 0 }}>{t('ui.card_duration')}:</span>
                      <input value={resolveText(card.duration)} onChange={e => updateDisciplineCard(page.id, card.id, { duration: e.target.value })} style={{ ...inputStyle, padding: '1px 2px', fontSize: `${fontSize - 2}px`, minWidth: 0 }} />
                    </div>
                  </div>

                  {/* ЕДИНОЕ ОПИСАНИЕ */}
                  <textarea
                    value={formatDescription(card.description, card.upgrade)}
                    onChange={e => updateDisciplineCard(page.id, card.id, {
                      description: e.target.value,
                      upgrade: ''
                    })}
                    style={{
                      ...inputStyle,
                      flex: 1,
                      minHeight: '60px',
                      resize: 'none',
                      fontSize: `${fontSize}px`,
                      lineHeight: '1.3',
                      overflowY: 'auto',
                      padding: '6px',
                      whiteSpace: 'pre-wrap' // Сохраняет абзацы
                    }}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
