import { useState, useEffect } from 'react';
import { useCharacterStore } from '../store';
import { DashedDotRating } from './DashedDotRating';
import { useTranslation } from 'react-i18next';
import { NATURES_LIST, ALL_LIFE_PATHS, MORTAL_LIFE_PATHS, VAMPIRE_LIFE_PATHS, DISCIPLINES_LIST } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';

const AnkhIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v18" />
    <path d="M7 9a5 5 0 0 1 10 0V6a5 5 0 0 0-10 0z" />
  </svg>
);


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
  flexDirection: 'column',
  gap: '10px'
};

const MAX_DISCIPLINES = 16;

export const SheetPage2 = () => {
  const { t } = useTranslation();
  const character = useCharacterStore(s => s.getActive());
  const { updateField, updateNested, addDiscipline, updateDiscipline, updateDisciplinePower, removeDiscipline, updateLifePath, applyLifePath } = useCharacterStore();
  const isMobile = useIsMobile();

  const n = character.disciplines.length;
  const cardHeight  = n <= 6 ? 130 : n <= 8 ? 110 : 90;
  const nameSize    = n <= 6 ? 13  : n <= 8 ? 12 : 10;
  const lineSize    = n <= 6 ? 12  : n <= 8 ? 11 : 9;

  const slots = Math.max(1, character.disciplines.length);

  return (
    <div id="character-sheet-2" className="sheet-page" style={{ ...sheetStyle, width: isMobile ? '100%' : '210mm' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', width: '100%' }}>
        <AnkhIcon />
        <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('ui.disciplines')}</h1>
        <AnkhIcon />
      </div>

      {/* DISCIPLINES FLEX GRID */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
        {Array.from({ length: slots }).map((_, i) => {
          const disc = character.disciplines[i];
          return (
            <div
              key={disc ? disc.id : `empty-${i}`}
              style={{ 
                border: '1px solid var(--border)', 
                display: 'flex', 
                flexDirection: 'column', 
                backgroundColor: 'var(--bg)', 
                position: 'relative',
                height: `${cardHeight}px`, 
                padding: '8px',
                boxSizing: 'border-box',
                width: isMobile ? '100%' : 'calc(50% - 4px)' // Имитация grid-cols-2
              }}
            >
              {disc && (
                <button
                  onClick={() => removeDiscipline(i)}
                  style={{ position: 'absolute', top: 0, right: '4px', cursor: 'pointer', zIndex: 20, color: 'var(--muted)', background: 'none', border: 'none', lineHeight: 1, fontSize: '16px' }}
                  title={t('common.delete_discipline')}
                >×</button>
              )}
              {disc && (
                <>
                  {/* Название + рейтинг */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', position: 'relative', zIndex: 20, gap: '8px', flexShrink: 0 }}>
                    <input
                      type="text"
                      list={`disc-list-${i}`}
                      value={
                        DISCIPLINES_LIST.find(d => d.id === disc.name)
                          ? t('disciplines.' + disc.name)
                          : disc.name
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        const matched = DISCIPLINES_LIST.find(d => t(d.label) === v || d.id === v);
                        updateDiscipline(i, 'name', matched ? matched.id : v);
                      }}
                      placeholder={t('placeholders.discipline_name')}
                      style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontWeight: 'bold', color: 'var(--text)', padding: '2px 4px', fontSize: `${nameSize}px`, fontFamily: "'Georgia', serif" }}
                    />
                    <div style={{ flexShrink: 0 }}>
                      <DashedDotRating total={5} value={disc.dots} onChange={(v) => updateDiscipline(i, 'dots', v)} />
                    </div>
                  </div>

                  {/* 5 независимых строк */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                      minHeight: 0
                    }}
                  >
                    {([0, 1, 2, 3, 4] as const).map((lineIdx) => (
                      <input
                        key={lineIdx}
                        type="text"
                        value={disc.powersList?.[lineIdx] || ''}
                        onChange={(e) => updateDisciplinePower(i, lineIdx, e.target.value)}
                        placeholder={lineIdx === 0 ? t('placeholders.power') : ''}
                        style={{
                          flex: 1,
                          minHeight: 0,
                          width: '100%',
                          background: 'transparent',
                          outline: 'none',
                          color: 'var(--text)',
                          border: 'none',
                          borderBottom: lineIdx < 4 ? '1px solid var(--border)' : 'none',
                          padding: '0 6px',
                          fontSize: `${lineSize}px`,
                          fontFamily: "'Georgia', serif",
                          boxSizing: 'border-box'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {character.disciplines.length >= MAX_DISCIPLINES ? (
        <div style={{ width: '100%', padding: '2px 0', fontSize: '10px', textAlign: 'center', background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
          {t('common.limit_reached')}
        </div>
      ) : (
        <button
          onClick={addDiscipline}
          style={{ width: '100%', padding: '2px 0', fontSize: '11px', cursor: 'pointer', background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          {t('common.add_discipline')}
        </button>
      )}

      {/* BOTTOM 50/50 FLEX */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', width: '100%', flex: 1, minHeight: 0 }}>
        {/* LEFT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
          <div style={{ flexShrink: 0 }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{t('ui.life_paths')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[0, 1, 2, 3].map((row) => (
                <div key={row} style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    list="lifepaths-list"
                    value={ALL_LIFE_PATHS.find(p => p === character.lifePaths[row * 2]) ? t('lifepaths.' + character.lifePaths[row * 2]) : (character.lifePaths[row * 2] || '')}
                    onChange={(e) => {
                      const v = e.target.value;
                      const matched = ALL_LIFE_PATHS.find(p => t('lifepaths.' + p) === v || p === v);
                      if (matched && (MORTAL_LIFE_PATHS[matched] || VAMPIRE_LIFE_PATHS[matched])) applyLifePath(row * 2, matched);
                      else updateLifePath(row * 2, v);
                    }}
                    style={{ width: '90px', flexShrink: 0, background: 'var(--input-bg)', border: '1px solid var(--border)', height: '20px', fontSize: '10px', outline: 'none', padding: '0 4px', boxSizing: 'border-box' }}
                  />
                  <input
                    type="text"
                    list="lifepaths-list"
                    value={ALL_LIFE_PATHS.find(p => p === character.lifePaths[row * 2 + 1]) ? t('lifepaths.' + character.lifePaths[row * 2 + 1]) : (character.lifePaths[row * 2 + 1] || '')}
                    onChange={(e) => {
                      const v = e.target.value;
                      const matched = ALL_LIFE_PATHS.find(p => t('lifepaths.' + p) === v || p === v);
                      if (matched && (MORTAL_LIFE_PATHS[matched] || VAMPIRE_LIFE_PATHS[matched])) applyLifePath(row * 2 + 1, matched);
                      else updateLifePath(row * 2 + 1, v);
                    }}
                    style={{ flex: 1, minWidth: 0, background: 'var(--input-bg)', border: '1px solid var(--border)', height: '20px', fontSize: '10px', outline: 'none', padding: '0 4px', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <datalist id="lifepaths-list">
              {ALL_LIFE_PATHS.map(p => <option key={p} value={p}>{t('lifepaths.' + p)}</option>)}
            </datalist>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', flexShrink: 0 }}>{t('ui.clan_traits')}</h3>
            <textarea
              value={character.clanTraits}
              onChange={(e) => updateField('clanTraits', e.target.value)}
              style={{ flex: 1, width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', padding: '4px', resize: 'none', fontSize: '10px', outline: 'none', boxSizing: 'border-box', overflow: 'auto' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', flexShrink: 0 }}>{t('ui.merits')}</h3>
            <textarea
              value={character.merits}
              onChange={(e) => updateField('merits', e.target.value)}
              style={{ flex: 1, width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', padding: '4px', resize: 'none', fontSize: '10px', outline: 'none', boxSizing: 'border-box', overflow: 'auto' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', flexShrink: 0 }}>{t('ui.flaws')}</h3>
            <textarea
              value={character.flaws}
              onChange={(e) => updateField('flaws', e.target.value)}
              style={{ flex: 1, width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', padding: '4px', resize: 'none', fontSize: '10px', outline: 'none', boxSizing: 'border-box', overflow: 'auto' }}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
          <div style={{ flexShrink: 0 }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{t('ui.nature')}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <span style={{ fontSize: '10px', flexShrink: 0 }}>{t('nature.label')}:</span>
              <input
                type="text"
                list="natures-list"
                value={NATURES_LIST.find(n => n.id === character.nature.indulgence) ? t('natures.' + character.nature.indulgence) : (character.nature.indulgence || '')}
                onChange={(e) => {
                  const v = e.target.value;
                  const matched = NATURES_LIST.find(n => t(n.label) === v || n.id === v);
                  updateNested('nature', { indulgence: matched ? matched.id : v });
                }}
                style={{ flex: 1, minWidth: 0, background: 'var(--input-bg)', border: '1px solid var(--border)', height: '20px', padding: '0 4px', fontSize: '10px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <datalist id="natures-list">
              {NATURES_LIST.map(n => <option key={n.id} value={t(n.label)} />)}
            </datalist>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', flexShrink: 0 }}>{t('flash.label')}:</span>
              <input
                type="text"
                value={character.nature.flash}
                onChange={(e) => updateNested('nature', { flash: e.target.value })}
                style={{ flex: 1, minWidth: 0, background: 'var(--input-bg)', border: '1px solid var(--border)', height: '20px', padding: '0 4px', fontSize: '10px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ flexShrink: 0 }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{t('ui.beast')}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <span style={{ fontSize: '10px', flexShrink: 0 }}>{t('clan_beast.label')}:</span>
              <input
                type="text"
                value={character.beast.clanBeast}
                onChange={(e) => updateNested('beast', { clanBeast: e.target.value })}
                style={{ flex: 1, minWidth: 0, background: 'var(--input-bg)', border: '1px solid var(--border)', height: '20px', padding: '0 4px', fontSize: '10px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', flexShrink: 0 }}>{t('rage.label')}:</span>
              <input
                type="text"
                value={character.beast.rage}
                onChange={(e) => updateNested('beast', { rage: e.target.value })}
                style={{ flex: 1, minWidth: 0, background: 'var(--input-bg)', border: '1px solid var(--border)', height: '20px', padding: '0 4px', fontSize: '10px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', flexShrink: 0 }}>{t('ui.notes')}</h3>
            <textarea
              value={character.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              style={{ flex: 1, width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)', padding: '4px', resize: 'none', fontSize: '10px', outline: 'none', boxSizing: 'border-box', overflow: 'auto' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
