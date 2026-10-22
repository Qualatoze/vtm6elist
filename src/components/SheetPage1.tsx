import { useState, useEffect } from 'react';
import { useCharacterStore } from '../store';
import { SKILLS_LIST, NOSTALGIA_DECADES, VAMPIRE_TYPES, CLANS_LIST, SIRE_TYPES_LIST } from '../types';
import { DotRating } from './DotRating';
import { HumanityTracker } from './HumanityTracker';

const ATTR_GROUPS = [
  { key: 'physical' as const, title: 'ФИЗИЧЕСКИЕ', attrs: ['strength', 'dexterity', 'stamina'] },
  { key: 'social' as const, title: 'СОЦИАЛЬНЫЕ', attrs: ['charisma', 'manipulation', 'composure'] },
  { key: 'mental' as const, title: 'МЕНТАЛЬНЫЕ', attrs: ['intelligence', 'wits', 'resolve'] }
];

const ATTR_LABELS: Record<string, string> = {
  strength: 'Сила', dexterity: 'Ловкость', stamina: 'Выносливость',
  charisma: 'Обаяние', manipulation: 'Манипуляция', composure: 'Самообладание',
  intelligence: 'Интеллект', wits: 'Смекалка', resolve: 'Упорство'
};

const GENERATION_VALUES = Array.from({ length: 16 }, (_, i) => i + 2); // 2..17
const GENERATION_OPTIONS = GENERATION_VALUES.map(v => `${v}-е`);

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
  margin: '0 auto',
  padding: '10mm',
  border: '3px solid var(--border)',
  boxSizing: 'border-box',
  fontFamily: "'Georgia', 'Times New Roman', serif"
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
};

const sectionHeaderStyle: React.CSSProperties = {
  background: 'var(--headerBg)',
  color: 'var(--text)',
  padding: '2px 4px',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '0.1em',
  textAlign: 'center',
  marginBottom: '4px',
  fontFamily: "'Georgia', serif"
};

const HeaderRow = ({
  label, value, onChange, isDropdown, options, labelWidth = '110px'
}: {
  label: string; value: string; onChange: (v: string) => void; isDropdown?: boolean; options?: string[]; labelWidth?: string;
}) => (
  <div style={{ display: 'grid', gridTemplateColumns: `${labelWidth} 1fr`, gap: '4px', alignItems: 'center', marginBottom: '4px', minWidth: 0 }}>
    <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: "'Georgia', serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={label}>{label}:</span>
    {isDropdown && options ? (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        <option value="">...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    )}
  </div>
);

const PowerDisplay = ({ label, current, max, onChange, size = 10 }: { label: string; current: number; max: number; onChange: (v: number) => void; size?: number }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', fontFamily: "'Georgia', serif" }}>{label}</div>
      <div style={{ display: 'flex', gap: '2px' }}>
        {Array.from({ length: max }).map((_, i) => {
          const pos = i + 1;
          const isFilled = pos <= current;
          const isLast = pos === current && current > 0;
          const isMax = pos === max;
          return (
            <div key={i} style={{ position: 'relative', marginLeft: pos === Math.floor(max / 2) + 1 ? 8 : 0 }}>
              {isLast && (
                <span style={{
                  position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)',
                  fontSize: '16px', fontWeight: 'bold', color: 'var(--accent)', fontFamily: "'Georgia', serif"
                }}>
                  {current}
                </span>
              )}
              <button
                onClick={() => onChange(pos === current ? 0 : pos)}
                style={{
                  width: `${size}px`, height: `${size}px`,
                  background: isFilled ? 'var(--dot-color)' : 'transparent',
                  border: `1px solid ${isMax ? 'var(--accent)' : isFilled ? 'var(--dot-color)' : 'var(--border)'}`,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            </div>
          );
        })}
      </div>
      <span style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '2px' }}>{current}/{max}</span>
    </div>
  );
};

export const SheetPage1 = () => {
  const character = useCharacterStore(s => s.getActive());
  const { updateMeta, updateAttribute, updateSkill, updateSpecification, updateVitae, updateWillpower, updateBloodSurge } = useCharacterStore();
  const isMobile = useIsMobile();

  const [isCustomClan, setIsCustomClan] = useState(false);
  const [isCustomNostalgia, setIsCustomNostalgia] = useState(false);

  const sheetWidth = isMobile ? '100%' : '210mm';
  const attrCols = isMobile ? '1fr' : '1fr 1fr 1fr';
  
  return (
    <div id="character-sheet" style={{ ...sheetStyle, width: sheetWidth }}>
      {/* ===== 1. ШАПКА ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 60px 1.2fr', gap: '6px', marginBottom: '10px' }}>
        {/* Левая колонка */}
        <div>
          <HeaderRow label="Имя" value={character.meta.name} onChange={(v) => updateMeta('name', v)} />
          <HeaderRow label="Видимый возраст" value={character.meta.visibleAge} onChange={(v) => updateMeta('visibleAge', v)} />
          <HeaderRow label="Настоящий возраст" value={character.meta.trueAge} onChange={(v) => updateMeta('trueAge', v)} />
          <HeaderRow label="Дата Становления" value={character.meta.embraceDate} onChange={(v) => updateMeta('embraceDate', v)} />

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
             <input type="checkbox" checked={isCustomNostalgia} onChange={e => setIsCustomNostalgia(e.target.checked)} />
             {isCustomNostalgia ? (
               <HeaderRow label="Ностальгия" value={character.meta.nostalgia} onChange={(v) => updateMeta('nostalgia', v)} />
             ) : (
               <HeaderRow label="Ностальгия" value={character.meta.nostalgia} onChange={(v) => updateMeta('nostalgia', v)} isDropdown options={NOSTALGIA_DECADES} />
             )}
          </div>

          <HeaderRow label="Вид" value={character.meta.type} onChange={(v) => updateMeta('type', v)} isDropdown options={VAMPIRE_TYPES} />
        </div>

        {/* Центральная колонка — Анкх */}
        {!isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '40px', lineHeight: 1, fontFamily: "'Georgia', serif" }}>†</span>
          </div>
        )}

        {/* Правая колонка */}
        <div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
             <input type="checkbox" checked={isCustomClan} onChange={e => setIsCustomClan(e.target.checked)} />
             {isCustomClan ? (
               <HeaderRow label="Клан" value={character.meta.clan} onChange={(v) => updateMeta('clan', v)} />
             ) : (
               <HeaderRow label="Клан" value={character.meta.clan} onChange={(v) => updateMeta('clan', v)} isDropdown options={CLANS_LIST} />
             )}
          </div>
          
          <HeaderRow label="Проклятие клана" value={character.meta.clanBane} onChange={(v) => updateMeta('clanBane', v)} />
          {/* Поколение и Модификатор */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <HeaderRow label="Поколение" value={character.meta.generation} onChange={(v) => updateMeta('generation', v)} isDropdown options={GENERATION_OPTIONS} labelWidth="75px" />
            <HeaderRow label="Модификатор" value={character.meta.modifier} onChange={(v) => updateMeta('modifier', v)} labelWidth="85px" />
          </div>

          <HeaderRow label="Архетип" value={character.meta.archetype} onChange={(v) => updateMeta('archetype', v)} />

          {/* Сир и Вид */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
            <HeaderRow label="Сир" value={character.meta.sire} onChange={(v) => updateMeta('sire', v)} labelWidth="40px" />
            <HeaderRow label="Вид" value={character.meta.sireType} onChange={(v) => updateMeta('sireType', v)} isDropdown options={SIRE_TYPES_LIST} labelWidth="40px" />
          </div>

          <HeaderRow label="Дисциплина от сира" value={character.meta.sireDiscipline} onChange={(v) => updateMeta('sireDiscipline', v)} />
        </div>
      </div>

      {/* ===== 2. ХАРАКТЕРИСТИКИ ===== */}
      <div style={{ border: `2px solid var(--border)`, marginBottom: '15px' }}>
        <div style={{ background: 'var(--headerBg)', color: 'var(--text)', display: 'flex', fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.1em', fontFamily: "'Georgia', serif" }}>
          {ATTR_GROUPS.map(g => (
            <div key={g.title} style={{ flex: 1, textAlign: 'center', padding: '4px', borderLeft: `1px solid var(--border)` }}>{g.title}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: attrCols }}>
          {ATTR_GROUPS.map((group, gi) => (
            <div key={group.key} style={{ borderRight: !isMobile && gi < 2 ? `1px solid var(--border)` : 'none', borderBottom: isMobile ? `1px solid var(--border)` : 'none', padding: '5px', minWidth: 0, overflow: 'hidden' }}>
              {group.attrs.map(attr => (
                <div key={attr} style={{ marginBottom: '4px' }}>
                  <div style={{ textAlign: 'center', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold', fontFamily: "'Georgia', serif" }}>{ATTR_LABELS[attr]}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 5 }).map((_, i) => {
                        const pos = i + 1;
                        const val = character.attributes[group.key][attr as keyof typeof character.attributes[typeof group.key]];
                        const isFilled = pos <= val;
                        return (
                          <button key={`a-${i}`} onClick={() => updateAttribute(group.key, attr, pos)} style={{ width: '16px', height: '16px', background: isFilled ? 'var(--dot-color)' : 'transparent', border: `1px solid ${isFilled ? 'var(--dot-color)' : 'var(--border)'}`, borderRadius: '50%', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 5 }).map((_, i) => {
                        const pos = i + 6;
                        const val = character.attributes[group.key][attr as keyof typeof character.attributes[typeof group.key]];
                        const isFilled = pos <= val;
                        const isThreshold = pos >= 6;
                        return (
                          <button key={`b-${i}`} onClick={() => updateAttribute(group.key, attr, pos)} style={{ width: '16px', height: '16px', background: isFilled ? (isThreshold ? 'var(--accent)' : 'var(--dot-color)') : 'transparent', border: `1px solid ${isFilled ? (isThreshold ? 'var(--accent)' : 'var(--dot-color)') : 'var(--border)'}`, borderRadius: '50%', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ===== 3. ВИТЭ И ВОЛЯ ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '10px' : '20px', marginBottom: '15px', borderBottom: `2px solid var(--border)`, paddingBottom: '15px', alignItems: 'center' }}>
        <PowerDisplay label="ВИТЭ" current={character.vitae.current} max={character.vitae.max} onChange={(v) => updateVitae(v)} size={14} />
        <PowerDisplay label="ВОЛЯ" current={character.willpower.current} max={character.willpower.max} onChange={(v) => updateWillpower(v)} size={13} />
      </div>

      {/* ===== 4. УСКОРЕНИЕ ===== */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.1em', fontFamily: "'Georgia', serif" }}>УСКОРЕНИЕ</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <DotRating total={5} value={character.bloodSurge} onChange={(v) => updateBloodSurge(v)} />
        </div>
      </div>

      {/* ===== 5. ШКАЛА ЧЕЛОВЕЧНОСТИ ===== */}
      <HumanityTracker />

      {/* ===== 6. НАВЫКИ ===== */}
      <div style={{ marginBottom: '15px', border: '1px solid var(--border)', padding: '4px' }}>
        <div style={sectionHeaderStyle}>Навыки</div>
        {SKILLS_LIST.map(skill => (
          <div key={skill} style={{ display: 'grid', gridTemplateColumns: isMobile ? '80px 60px 1fr 1fr 1fr' : '160px 110px 1fr 1fr 1fr', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0px', marginBottom: '0px' }}>
            <div style={{ fontSize: '11px', fontFamily: "'Georgia', serif" }}>{skill}</div>
            <div>
              <DotRating total={5} size={12} value={character.skills[skill]?.dots || 0} onChange={(v) => updateSkill(skill, v)} />
            </div>
            {[0, 1, 2].map((idx) => (
              <input
                key={idx}
                type="text"
                value={character.skills[skill]?.specifications?.[idx] || ''}
                onChange={(e) => updateSpecification(skill, idx as 0 | 1 | 2, e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `1px dashed var(--border)`,
                  outline: 'none',
                  padding: '2px 4px',
                  fontSize: '10px',
                  color: 'var(--text)',
                  width: '100%',
                  fontFamily: "'Georgia', serif"
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* ===== 7. РЕСУРСЫ + ПРЕДМЕТЫ ===== */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '15px' }}>
        <div style={{ flex: 3, minWidth: 0 }}>
          <div style={{ ...sectionHeaderStyle, textAlign: 'center' }}>Ресурсы</div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '3px' }}>
              <input
                type="text"
                value={character.resources[i]?.name || ''}
                onChange={(e) => useCharacterStore.getState().updateResource(i, 'name', e.target.value)}
                style={{ ...inputStyle, width: '90px' }}
              />
              <DotRating total={5} value={character.resources[i]?.dots || 0} onChange={(v) => useCharacterStore.getState().updateResource(i, 'dots', v)} size={12} />
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <button
                    key={si}
                    onClick={() => useCharacterStore.getState().updateResource(i, 'squares', si + 1)}
                    style={{
                      width: '12px', height: '12px',
                      background: (character.resources[i]?.squares || 0) >= si + 1 ? 'var(--dot-color)' : 'transparent',
                      border: `1px solid var(--border)`,
                      borderRadius: '0',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...sectionHeaderStyle, textAlign: 'center' }}>Предметы</div>
          <textarea
            value={character.items}
            onChange={(e) => useCharacterStore.getState().updateField('items', e.target.value)}
            placeholder="Список предметов..."
            style={{
              flex: 1,
              background: 'var(--panel)',
              border: `1px solid var(--border)`,
              outline: 'none',
              padding: '8px',
              fontSize: '12px',
              color: 'var(--text)',
              fontFamily: "'Georgia', serif",
              resize: 'none',
              width: '100%',
            }}
          />
        </div>
      </div>

    </div>
  );
};
