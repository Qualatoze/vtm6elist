import { useCharacterStore } from '../store';
import { DashedDotRating } from './DashedDotRating';

// Simple Ankh icon (SVG)
const AnkhIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v18" />
    <path d="M7 9a5 5 0 0 1 10 0V6a5 5 0 0 0-10 0z" />
  </svg>
);

// Стили, идентичные первому листу для идеального центрирования
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
  gap: '24px'
};

export const SheetPage2 = () => {
  const character = useCharacterStore(s => s.getActive());
  const { updateField, updateNested, addDiscipline, updateDiscipline, removeDiscipline, updateLifePath } = useCharacterStore();

  return (
    <div id="character-sheet-2" style={sheetStyle}>
      {/* ===== HEADER: ДИСЦИПЛИНЫ ===== */}
      <div className="flex justify-center items-center gap-4 w-full">
        <AnkhIcon />
        <h1 className="font-gothic text-2xl font-bold uppercase tracking-widest text-[var(--text)] text-center">Дисциплины</h1>
        <AnkhIcon />
      </div>

      {/* ===== DISCIPLINES: 2x3 grid (always 6 slots) ===== */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {Array.from({ length: 16 }).map((_, i) => {
          const disc = character.disciplines[i];
          return (
            <div key={disc ? disc.id : `empty-${i}`} className="border border-[var(--border)] p-2 flex flex-col bg-[var(--bg)] relative min-h-[200px]">
              {disc && (
                <button onClick={() => removeDiscipline(i)} className="absolute top-1 right-1 text-xs cursor-pointer z-20" style={{ color: 'var(--muted)', background: 'none', border: 'none' }} title="Удалить дисциплину">×</button>
              )}
              {disc && (
                <>
                  <div className="flex justify-between items-center mb-2 relative z-20">
                    <input
                      type="text"
                      value={disc.name}
                      onChange={(e) => updateDiscipline(i, 'name', e.target.value)}
                      placeholder="Название..."
                      className="w-full bg-transparent border-none outline-none text-base font-gothic font-bold tracking-normal text-[var(--text)]"
                    />
                    <DashedDotRating total={5} value={disc.dots} onChange={(v) => updateDiscipline(i, 'dots', v)} />
                  </div>
                  <textarea
                    value={disc.powers}
                    onChange={(e) => updateDiscipline(i, 'powers', e.target.value)}
                    placeholder="Способности..."
                    className="w-full flex-grow resize-none outline-none text-sm text-[var(--text)] relative z-10"
                    style={{
                      minHeight: '150px',
                      lineHeight: '22px',
                      backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 21px, var(--border) 21px, var(--border) 22px)',
                      backgroundAttachment: 'local',
                      backgroundColor: 'transparent',
                      padding: '0 8px',
                      paddingTop: '1px',
                      border: '1px solid var(--border)',
                      boxSizing: 'border-box'
                    }}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
      {character.disciplines.length >= 16 ? (
        <div className="w-full py-2 text-sm cursor-not-allowed text-center" style={{ background: 'var(--panel)', border: `1px solid var(--border)`, color: 'var(--muted)' }}>Достигнут лимит</div>
      ) : (
        <button onClick={addDiscipline} className="w-full py-2 text-sm cursor-pointer" style={{ background: 'var(--panel)', border: `1px solid var(--border)`, color: 'var(--text)' }}>+ Добавить дисциплину</button>
      )}

      {/* ===== BOTTOM BLOCK: 50/50 split ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4 h-full">
          <div>
            <h3 className="font-gothic font-bold text-base mb-2 uppercase tracking-wider text-center">Жизненные пути</h3>
            <div className="flex flex-col gap-1">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="grid grid-cols-[100px_1fr] gap-2">
                  <input
                    type="text"
                    value={character.lifePaths[row * 2] || ''}
                    onChange={(e) => updateLifePath(row * 2, e.target.value)}
                    className="bg-transparent border border-[var(--border)] h-7 text-sm outline-none focus:border-[var(--accent)] px-1"
                  />
                  <input
                    type="text"
                    value={character.lifePaths[row * 2 + 1] || ''}
                    onChange={(e) => updateLifePath(row * 2 + 1, e.target.value)}
                    className="bg-transparent border border-[var(--border)] h-7 text-sm outline-none focus:border-[var(--accent)] px-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col flex-grow">
            <h3 className="font-gothic font-bold text-base mb-2 uppercase tracking-wider text-center">Клановые черты</h3>
            <textarea
              value={character.clanTraits}
              onChange={(e) => updateField('clanTraits', e.target.value)}
              className="w-full flex-grow min-h-[140px] bg-transparent border border-[var(--border)] p-2 resize-none text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex flex-col flex-grow">
            <h3 className="font-gothic font-bold text-base mb-2 uppercase tracking-wider text-center">Достоинства</h3>
            <textarea
              value={character.merits}
              onChange={(e) => updateField('merits', e.target.value)}
              className="w-full flex-grow min-h-[120px] bg-transparent border border-[var(--border)] p-2 resize-none text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex flex-col flex-grow">
            <h3 className="font-gothic font-bold text-base mb-2 uppercase tracking-wider text-center">Недостатки</h3>
            <textarea
              value={character.flaws}
              onChange={(e) => updateField('flaws', e.target.value)}
              className="w-full flex-grow min-h-[120px] bg-transparent border border-[var(--border)] p-2 resize-none text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4 h-full">
          <div>
            <h3 className="font-gothic font-bold text-base mb-1 uppercase tracking-wider text-center">Натура</h3>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm shrink-0">Потакание:</span>
              <input
                type="text"
                value={character.nature.indulgence}
                onChange={(e) => updateNested('nature', { indulgence: e.target.value })}
                className="flex-1 bg-transparent border border-[var(--border)] h-7 px-2 text-sm outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm shrink-0">Вспышка:</span>
              <input
                type="text"
                value={character.nature.flash}
                onChange={(e) => updateNested('nature', { flash: e.target.value })}
                className="flex-1 bg-transparent border border-[var(--border)] h-7 px-2 text-sm outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <h3 className="font-gothic font-bold text-base mb-1 uppercase tracking-wider text-center">Зверь</h3>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm shrink-0">Зверь клана:</span>
              <input
                type="text"
                value={character.beast.clanBeast}
                onChange={(e) => updateNested('beast', { clanBeast: e.target.value })}
                className="flex-1 bg-transparent border border-[var(--border)] h-7 px-2 text-sm outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm shrink-0">Ярость:</span>
              <input
                type="text"
                value={character.beast.rage}
                onChange={(e) => updateNested('beast', { rage: e.target.value })}
                className="flex-1 bg-transparent border border-[var(--border)] h-7 px-2 text-sm outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="flex flex-col flex-grow">
            <h3 className="font-gothic font-bold text-base mb-2 uppercase tracking-wider text-center">Заметки</h3>
            <textarea
              value={character.items}
              onChange={(e) => updateField('items', e.target.value)}
              className="w-full flex-grow min-h-[300px] bg-transparent border border-[var(--border)] p-2 resize-none text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
