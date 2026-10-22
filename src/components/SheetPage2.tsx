import { useState, useEffect } from 'react';
import { useCharacterStore } from '../store';
import { DashedDotRating } from './DashedDotRating';
import { NATURES_LIST, ALL_LIFE_PATHS, MORTAL_LIFE_PATHS, VAMPIRE_LIFE_PATHS } from '../types';

const AnkhIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v18" />
    <path d="M7 9a5 5 0 0 1 10 0V6a5 5 0 0 0-10 0z" />
  </svg>
);

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isMobile;
};

const sheetStyle: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  backgroundColor: 'var(--bg)',
  color: 'var(--text)',
  margin: '20px auto 0',
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
  const character = useCharacterStore(s => s.getActive());
  const { updateField, updateNested, addDiscipline, updateDiscipline, updateDisciplinePower, removeDiscipline, updateLifePath, applyLifePath } = useCharacterStore();
  const isMobile = useIsMobile();

  // Адаптивный размер: чем больше дисциплин — тем компактнее карточки
  const n = character.disciplines.length;
  const cardHeight  = n <= 6 ? 175 : n <= 8 ? 140 : n <= 10 ? 115 : 95;
  const nameSize    = n <= 6 ? 14  : n <= 8 ? 13  : n <= 10 ? 11  : 10;
  const lineSize    = n <= 6 ? 13  : n <= 8 ? 12  : n <= 10 ? 10  : 9;
  const lineHeight  = n <= 6 ? 26  : n <= 8 ? 21  : n <= 10 ? 17  : 14;
  const dotSize     = n <= 6 ? 22  : n <= 8 ? 20  : 18;

  // Рендерим все дисциплины (без ограничения на 16)
  const slots = Math.max(1, character.disciplines.length);

  return (
    <div id="character-sheet-2" style={{ ...sheetStyle, width: isMobile ? '100%' : '210mm' }}>
      {/* HEADER */}
      <div className="flex justify-center items-center gap-2 w-full">
        <AnkhIcon />
        <h1 className="font-gothic text-base font-bold uppercase tracking-widest text-[var(--text)] text-center">
          Дисциплины
        </h1>
        <AnkhIcon />
      </div>

      {/* DISCIPLINES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        {Array.from({ length: slots }).map((_, i) => {
          const disc = character.disciplines[i];
          return (
            <div
              key={disc ? disc.id : `empty-${i}`}
              className="border border-[var(--border)] flex flex-col bg-[var(--bg)] relative"
              style={{ height: `${cardHeight}px`, padding: '8px' }}
            >
              {disc && (
                <button
                  onClick={() => removeDiscipline(i)}
                  className="absolute top-0 right-1 cursor-pointer z-20"
                  style={{ color: 'var(--muted)', background: 'none', border: 'none', lineHeight: 1, fontSize: '16px' }}
                  title="Удалить дисциплину"
                >×</button>
              )}
              {disc && (
                <>
                  {/* Название + рейтинг */}
                  <div className="flex justify-between items-center mb-1 relative z-20 gap-2" style={{ flexShrink: 0 }}>
                    <input
                      type="text"
                      value={disc.name}
                      onChange={(e) => updateDiscipline(i, 'name', e.target.value)}
                      placeholder="Название..."
                      className="flex-1 min-w-0 bg-transparent border-none outline-none font-gothic font-bold text-[var(--text)]"
                      style={{ padding: '2px 4px', fontSize: `${nameSize}px` }}
                    />
                    <DashedDotRating total={5} value={disc.dots} onChange={(v) => updateDiscipline(i, 'dots', v)} />
                  </div>

                  {/* 5 независимых строк */}
                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid var(--border)',
                      overflow: 'hidden',
                    }}
                  >
                    {([0, 1, 2, 3, 4] as const).map((lineIdx) => (
                      <input
                        key={lineIdx}
                        type="text"
                        value={disc.powersList?.[lineIdx] || ''}
                        onChange={(e) => updateDisciplinePower(i, lineIdx, e.target.value)}
                        placeholder={lineIdx === 0 ? 'Способность...' : ''}
                        className="w-full bg-transparent outline-none text-[var(--text)]"
                        style={{
                          flex: 1,
                          minHeight: 0,
                          border: 'none',
                          borderBottom: lineIdx < 4 ? '1px solid var(--border)' : 'none',
                          padding: '0 6px',
                          fontSize: `${lineSize}px`,
                          lineHeight: `${lineHeight}px`,
                          fontFamily: "'Georgia', serif",
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
        <div className="w-full py-0.5 text-[10px] text-center" style={{ background: 'var(--panel)', border: `1px solid var(--border)`, color: 'var(--muted)' }}>
          Достигнут лимит
        </div>
      ) : (
        <button
          onClick={addDiscipline}
          className="w-full py-0.5 text-[11px] cursor-pointer"
          style={{ background: 'var(--panel)', border: `1px solid var(--border)`, color: 'var(--text)' }}
        >
          + Добавить дисциплину
        </button>
      )}

      {/* BOTTOM 50/50 — БЕЗ h-full и items-stretch, чтобы не тянулось */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {/* LEFT */}
        <div className="flex flex-col gap-2">
          <div>
            <h3 className="font-gothic font-bold text-xs mb-1 uppercase tracking-wider text-center">Жизненные пути</h3>
            <div className="flex flex-col gap-0.5">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="grid grid-cols-[90px_1fr] gap-1">
                  <input
                    type="text"
                    list="lifepaths-list"
                    value={character.lifePaths[row * 2] || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (MORTAL_LIFE_PATHS[v] || VAMPIRE_LIFE_PATHS[v]) applyLifePath(row * 2, v);
                      else updateLifePath(row * 2, v);
                    }}
                    className="bg-transparent border border-[var(--border)] h-5 text-[10px] outline-none focus:border-[var(--accent)] px-1"
                  />
                  <input
                    type="text"
                    list="lifepaths-list"
                    value={character.lifePaths[row * 2 + 1] || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (MORTAL_LIFE_PATHS[v] || VAMPIRE_LIFE_PATHS[v]) applyLifePath(row * 2 + 1, v);
                      else updateLifePath(row * 2 + 1, v);
                    }}
                    className="bg-transparent border border-[var(--border)] h-5 text-[10px] outline-none focus:border-[var(--accent)] px-1"
                  />
                </div>
              ))}
            </div>
            <datalist id="lifepaths-list">
              {ALL_LIFE_PATHS.map(p => <option key={p} value={p} />)}
            </datalist>
          </div>

          <div>
            <h3 className="font-gothic font-bold text-xs mb-1 uppercase tracking-wider text-center">Клановые черты</h3>
            <textarea
              value={character.clanTraits}
              onChange={(e) => updateField('clanTraits', e.target.value)}
              className="w-full h-[70px] bg-transparent border border-[var(--border)] p-1 resize-none text-[10px] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <h3 className="font-gothic font-bold text-xs mb-1 uppercase tracking-wider text-center">Достоинства</h3>
            <textarea
              value={character.merits}
              onChange={(e) => updateField('merits', e.target.value)}
              className="w-full h-[60px] bg-transparent border border-[var(--border)] p-1 resize-none text-[10px] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <h3 className="font-gothic font-bold text-xs mb-1 uppercase tracking-wider text-center">Недостатки</h3>
            <textarea
              value={character.flaws}
              onChange={(e) => updateField('flaws', e.target.value)}
              className="w-full h-[60px] bg-transparent border border-[var(--border)] p-1 resize-none text-[10px] outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-2">
          <div>
            <h3 className="font-gothic font-bold text-xs mb-1 uppercase tracking-wider text-center">Натура</h3>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] shrink-0">Натура:</span>
              <input
                type="text"
                list="natures-list"
                value={character.nature.indulgence}
                onChange={(e) => updateNested('nature', { indulgence: e.target.value })}
                className="flex-1 bg-transparent border border-[var(--border)] h-5 px-1 text-[10px] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <datalist id="natures-list">
              {NATURES_LIST.map(n => <option key={n} value={n} />)}
            </datalist>
            <div className="flex items-center gap-1">
              <span className="text-[10px] shrink-0">Вспышка:</span>
              <input
                type="text"
                value={character.nature.flash}
                onChange={(e) => updateNested('nature', { flash: e.target.value })}
                className="flex-1 bg-transparent border border-[var(--border)] h-5 px-1 text-[10px] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <h3 className="font-gothic font-bold text-xs mb-1 uppercase tracking-wider text-center">Зверь</h3>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] shrink-0">Зверь клана:</span>
              <input
                type="text"
                value={character.beast.clanBeast}
                onChange={(e) => updateNested('beast', { clanBeast: e.target.value })}
                className="flex-1 bg-transparent border border-[var(--border)] h-5 px-1 text-[10px] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] shrink-0">Ярость:</span>
              <input
                type="text"
                value={character.beast.rage}
                onChange={(e) => updateNested('beast', { rage: e.target.value })}
                className="flex-1 bg-transparent border border-[var(--border)] h-5 px-1 text-[10px] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <h3 className="font-gothic font-bold text-xs mb-1 uppercase tracking-wider text-center">Заметки</h3>
            <textarea
              value={character.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full h-[160px] bg-transparent border border-[var(--border)] p-1 resize-none text-[10px] outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
