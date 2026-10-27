import { useState, useEffect } from 'react';
import { useCharacterStore } from '../store';
import { t } from '../i18n';
import { SKILLS_LIST, NOSTALGIA_DECADES, VAMPIRE_TYPES, CLANS_LIST, SIRE_TYPES_LIST, DISCIPLINES_LIST } from '../types';
import { DotRating } from './DotRating';
import { HumanityTracker } from './HumanityTracker';
import { useIsMobile } from '../hooks/useIsMobile';
import { Tooltip } from './Tooltip';
import { TOOLTIPS } from '../data/tooltips';

const ATTR_GROUPS = [
  { key: 'physical' as const, title: 'attributes_groups.physical', attrs: ['strength', 'dexterity', 'stamina'] },
  { key: 'social' as const, title: 'attributes_groups.social', attrs: ['charisma', 'manipulation', 'composure'] },
  { key: 'mental' as const, title: 'attributes_groups.mental', attrs: ['intelligence', 'wits', 'resolve'] }
];

const ATTR_LABELS: Record<string, string> = {
  strength: 'attributes.strength', dexterity: 'attributes.dexterity', stamina: 'attributes.stamina',
  charisma: 'attributes.charisma', manipulation: 'attributes.manipulation', composure: 'attributes.composure',
  intelligence: 'attributes.intelligence', wits: 'attributes.wits', resolve: 'attributes.resolve'
};

const GENERATION_VALUES = Array.from({ length: 16 }, (_, i) => i + 2);
const GENERATION_OPTIONS = GENERATION_VALUES.map(v => String(v));

const sheetStyle: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  backgroundColor: 'var(--bg)',
  color: 'var(--text)',
  margin: '0 auto',
  padding: '6mm',
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

const HeaderRow = ({
  label, value, onChange, isDropdown, options, labelWidth = '115px', prefix
}: {
  label: string; value: string; onChange: (v: string) => void; isDropdown?: boolean; options?: Array<{ id: string; label: string }>; labelWidth?: string; prefix?: React.ReactNode;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', width: '100%', minWidth: 0 }}>
    <div style={{ width: labelWidth, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
      {prefix}
      <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: "'Georgia', serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={label}>
        {label}:
      </span>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      {isDropdown && options ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
          <option value="">...</option>
          {options?.map(o => <option key={o.id} value={o.id}>{t(o.label)}</option>)}
        </select>
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  </div>
);

const PowerDisplay = ({ label, current, max, onChange, size = 14 }: { label: string; current: number; max: number; onChange: (v: number) => void; size?: number }) => {
  const groupCount = Math.ceil(Math.max(max, current) / 5);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', fontFamily: "'Georgia', serif" }}>{label}</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {Array.from({ length: groupCount }).map((_, group) => (
          <div key={group} style={{ display: 'flex', gap: '2px' }}>
            {Array.from({ length: 5 }).map((_, i) => {
              const pos = group * 5 + i + 1;
              const isFilled = pos <= current;
              const isAvailable = pos <= max;
              return (
                <button
                  key={pos}
                  onClick={() => {
                    if (isAvailable) {
                      onChange(pos === current ? 0 : pos);
                    }
                  }}
                  style={{
                    width: `${size}px`, height: `${size}px`,
                    background: isFilled ? 'var(--dot-color)' : 'transparent',
                    border: `1px solid ${isFilled ? 'var(--dot-color)' : (isAvailable ? 'var(--border)' : 'transparent')}`,
                    borderRadius: '50%',
                    cursor: isAvailable ? 'pointer' : 'default',
                    padding: 0,
                    opacity: isAvailable ? 1 : 0.3,
                    pointerEvents: isAvailable ? 'auto' : 'none',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <span style={{ fontSize: '9px', color: 'var(--muted)', marginTop: '4px' }}>{current}/{max}</span>
    </div>
  );
};

export const SheetPage1 = ({ showTips }: { showTips?: boolean }) => {
  const character = useCharacterStore(s => s.getActive());
  const { updateMeta, updateAttribute, updateSkill, updateSpecification, updateVitae, updateWillpower, updateBloodSurge } = useCharacterStore();
  const isMobile = useIsMobile();

  const [isCustomClan, setIsCustomClan] = useState(
    () => character.meta.clan !== '' && !CLANS_LIST.some(c => c.id === character.meta.clan)
  );
  const [isCustomNostalgia, setIsCustomNostalgia] = useState(
    () => character.meta.nostalgia !== '' && !NOSTALGIA_DECADES.some(d => d.id === character.meta.nostalgia)
  );

  useEffect(() => {
    setIsCustomClan(character.meta.clan !== '' && !CLANS_LIST.some(c => c.id === character.meta.clan));
    setIsCustomNostalgia(character.meta.nostalgia !== '' && !NOSTALGIA_DECADES.some(d => d.id === character.meta.nostalgia));
  }, [character.id, character.meta.clan, character.meta.nostalgia]);

  const sheetWidth = isMobile ? '100%' : '210mm';
  
  return (
    <div id="character-sheet" className="sheet-page" style={{ ...sheetStyle, width: sheetWidth }}>
      {/* ===== 1. ШАПКА ===== */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '20px', marginBottom: '10px', flexShrink: 0 }}>
        
        {/* Левая колонка */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <HeaderRow label={t('ui.name')} value={character.meta.name} onChange={(v) => updateMeta('name', v)} />
          <HeaderRow label={t('ui.visible_age')} value={character.meta.visibleAge} onChange={(v) => updateMeta('visibleAge', v)} />
          <HeaderRow label={t('ui.true_age')} value={character.meta.trueAge} onChange={(v) => updateMeta('trueAge', v)} />
          <HeaderRow label={t('ui.embrace_date')} value={character.meta.embraceDate} onChange={(v) => updateMeta('embraceDate', v)} />

          <HeaderRow
            label={t('ui.nostalgia')}
            value={character.meta.nostalgia}
            onChange={(v) => updateMeta('nostalgia', v)}
            isDropdown={!isCustomNostalgia}
            options={NOSTALGIA_DECADES}
            prefix={
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <input
                  type="checkbox"
                  checked={isCustomNostalgia}
                  onChange={e => setIsCustomNostalgia(e.target.checked)}
                  style={{ accentColor: 'var(--accent)', cursor: 'pointer', margin: 0 }}
                  title={t('common.custom_nostalgia')}
                />
                <Tooltip text={TOOLTIPS.nostalgia} showTips={!!showTips} />
              </div>
            }
          />

          <HeaderRow label={t('ui.type')} value={character.meta.type} onChange={(v) => updateMeta('type', v)} isDropdown options={VAMPIRE_TYPES} />
        </div>

        {/* Центральная колонка — Анкх */}
        {!isMobile && (
          <div style={{ width: '30px', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '36px', lineHeight: 1, fontFamily: "'Georgia', serif", color: 'var(--muted)' }}>†</span>
          </div>
        )}

        {/* Правая колонка */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <HeaderRow
            label={t('ui.clan')}
            value={character.meta.clan}
            onChange={(v) => updateMeta('clan', v)}
            isDropdown={!isCustomClan}
            options={CLANS_LIST}
            prefix={
              <input
                type="checkbox"
                checked={isCustomClan}
                onChange={e => setIsCustomClan(e.target.checked)}
                style={{ accentColor: 'var(--accent)', cursor: 'pointer', margin: 0 }}
                title={t('common.custom_clan')}
              />
            }
          />
          
          <HeaderRow label={t('ui.clan_bane')} value={character.meta.clanBane} onChange={(v) => updateMeta('clanBane', v)} />
          
          {/* Пара: Поколение и Модификатор */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
            <HeaderRow label={t('ui.generation')} value={character.meta.generation} onChange={(v) => updateMeta('generation', v)} isDropdown options={GENERATION_OPTIONS.map(v => ({ id: v, label: v }))} labelWidth="75px" />
            <HeaderRow label={t('ui.modifier')} value={character.meta.modifier} onChange={(v) => updateMeta('modifier', v)} labelWidth="85px" />
          </div>

          <HeaderRow label={t('ui.archetype')} value={character.meta.archetype} onChange={(v) => updateMeta('archetype', v)} />

          {/* Пара: Сир и Вид сира */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '8px', marginBottom: '6px' }}>
            <HeaderRow label={t('ui.sire')} value={character.meta.sire} onChange={(v) => updateMeta('sire', v)} labelWidth="40px" />
            <HeaderRow label={t('ui.sire_type')} value={character.meta.sireType} onChange={(v) => updateMeta('sireType', v)} isDropdown options={SIRE_TYPES_LIST} labelWidth="65px" />
          </div>

          <HeaderRow label={t('ui.sire_discipline')} value={character.meta.sireDiscipline} onChange={(v) => updateMeta('sireDiscipline', v)} isDropdown options={DISCIPLINES_LIST} />
        </div>
      </div>

      {/* ===== 2. ХАРАКТЕРИСТИКИ ===== */}
      <div style={{ border: `2px solid var(--border)`, marginBottom: '8px', flexShrink: 0 }}>
        <div style={{ background: 'var(--headerBg)', color: 'var(--header-text, var(--text))', display: 'flex', fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.1em', fontFamily: "'Georgia', serif" }}>
          {ATTR_GROUPS.map((g, gi) => (
            <div
              key={g.key}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '4px',
                borderLeft: gi > 0 ? `1px solid var(--border)` : 'none'
              }}
            >
              <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {t(g.title)}
                <Tooltip text={TOOLTIPS.attributes} showTips={!!showTips} />
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
          {ATTR_GROUPS.map((group, gi) => (
            <div
              key={group.key}
              style={{
                flex: 1,
                borderRight: !isMobile && gi < 2 ? `1px solid var(--border)` : 'none',
                borderBottom: isMobile ? `1px solid var(--border)` : 'none',
                padding: '4px 2px',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              {group.attrs.map(attr => (
                <div key={attr} style={{ marginBottom: '4px' }}>
                  <div style={{ textAlign: 'center', fontSize: '11px', marginBottom: '4px', fontWeight: 'bold', fontFamily: "'Georgia', serif" }}>{t(ATTR_LABELS[attr])}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3px' }}>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {Array.from({ length: 5 }).map((_, i) => {
                        const pos = i + 1;
                        const val = character.attributes[group.key][attr as keyof typeof character.attributes[typeof group.key]];
                        const isFilled = pos <= val;
                        return (
                          <button key={`a-${i}`} onClick={() => updateAttribute(group.key, attr, pos === val ? 0 : pos)} style={{ width: '15px', height: '15px', background: isFilled ? 'var(--dot-color)' : 'transparent', border: `1px solid ${isFilled ? 'var(--dot-color)' : 'var(--border)'}`, borderRadius: '50%', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {Array.from({ length: 5 }).map((_, i) => {
                        const pos = i + 6;
                        const val = character.attributes[group.key][attr as keyof typeof character.attributes[typeof group.key]];
                        const isFilled = pos <= val;
                        const isThreshold = pos >= 6;
                        return (
                          <button key={`b-${i}`} onClick={() => updateAttribute(group.key, attr, pos === val ? 0 : pos)} style={{ width: '15px', height: '15px', background: isFilled ? (isThreshold ? 'var(--accent)' : 'var(--dot-color)') : 'transparent', border: `1px solid ${isFilled ? (isThreshold ? 'var(--accent)' : 'var(--dot-color)') : 'var(--border)'}`, borderRadius: '50%', cursor: 'pointer', padding: 0, flexShrink: 0 }} />
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
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '20px', marginBottom: '8px', borderBottom: `2px solid var(--border)`, paddingBottom: '8px', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px', fontFamily: "'Georgia', serif" }}>{t('ui.vitae')}</span>
            <Tooltip text={TOOLTIPS.vitae} showTips={!!showTips} />
          </div>
          <PowerDisplay label="" current={character.vitae.current} max={character.vitae.max} onChange={(v) => updateVitae(v)} size={14} />
        </div>

        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px', fontFamily: "'Georgia', serif" }}>{t('ui.willpower')}</span>
            <Tooltip text={TOOLTIPS.willpower} showTips={!!showTips} />
          </div>
          <PowerDisplay label="" current={character.willpower.current} max={character.willpower.max} onChange={(v) => updateWillpower(v)} size={13} />
        </div>
      </div>

      {/* ===== 4. УСКОРЕНИЕ ===== */}
      <div style={{ textAlign: 'center', marginBottom: '4px', flexShrink: 0 }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', letterSpacing: '0.1em', fontFamily: "'Georgia', serif", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {t('ui.blood_surge')}
          <Tooltip text={TOOLTIPS.bloodSurge} showTips={!!showTips} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <DotRating total={5} value={character.bloodSurge} onChange={(v) => updateBloodSurge(v)} />
        </div>
      </div>

      {/* ===== 5. ШКАЛА ЧЕЛОВЕЧНОСТИ ===== */}
      <div style={{ flexShrink: 0 }}>
        <HumanityTracker showTips={showTips} />
      </div>

      {/* ===== 6. НАВЫКИ ===== */}
      <div style={{ marginBottom: '8px', border: '1px solid var(--border)', padding: '0', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{
          ...sectionHeaderStyle,
          margin: 0,
          padding: '6px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '4px'
        }}>
          {t('ui.skills')}
          <Tooltip
            text={TOOLTIPS.skills}
            showTips={!!showTips}
            position="bottom"
            iconSize={12}
          />
        </div>
        
        {SKILLS_LIST.map((skill, sIdx) => {
          const isEven = sIdx % 2 === 0;
          return (
            <div
              key={skill.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                backgroundColor: isEven ? 'var(--bg)' : 'var(--headerBg)',
                borderBottom: sIdx < SKILLS_LIST.length - 1 ? '1px solid var(--border)' : 'none',
                padding: '2px 8px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: "'Georgia', serif", width: isMobile ? '80px' : '150px', flexShrink: 0, fontWeight: 'bold' }}>
                {t(skill.label)}
              </div>
              
              <div style={{ width: isMobile ? '60px' : '110px', flexShrink: 0 }}>
                <DotRating total={5} size={12} value={character.skills[skill.id]?.dots || 0} onChange={(v) => updateSkill(skill.id, v)} />
              </div>
              
              <div style={{ display: 'flex', flex: 1, minWidth: 0, gap: '6px' }}>
                {[0, 1, 2].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={character.skills[skill.id]?.specifications?.[idx] || ''}
                    onChange={(e) => updateSpecification(skill.id, idx as 0 | 1 | 2, e.target.value)}
                    placeholder="—"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'var(--input-bg)',
                      border: '1px solid transparent',
                      borderRadius: '3px',
                      outline: 'none',
                      padding: '3px 6px',
                      fontSize: '10px',
                      color: 'var(--text)',
                      fontFamily: "'Georgia', serif",
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'transparent'}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== 7. РЕСУРСЫ + ПРЕДМЕТЫ ===== */}
      <div style={{ display: 'flex', gap: '16px', flexDirection: isMobile ? 'column' : 'row', flex: 1, minHeight: 0, alignItems: 'stretch' }}>
        
        {/* РЕСУРСЫ */}
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          <div style={{ ...sectionHeaderStyle, textAlign: 'center' }}>{t('ui.resources')}</div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={character.resources[i]?.name || ''}
                  onChange={(e) => useCharacterStore.getState().updateResource(i, 'name', e.target.value)}
                  style={{ ...inputStyle, width: '150px', flexShrink: 0 }}
                />
                <div style={{ width: '80px', flexShrink: 0 }}>
                  <DotRating total={5} value={character.resources[i]?.dots || 0} onChange={(v) => useCharacterStore.getState().updateResource(i, 'dots', v)} size={12} />
                </div>
                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                  {Array.from({ length: 5 }).map((_, si) => {
                    const currentSquares = character.resources[i]?.squares || 0;
                    const isFilled = currentSquares >= si + 1;
                    return (
                      <button
                        key={si}
                        onClick={() => {
                          const newVal = (si + 1 === currentSquares) ? 0 : (si + 1);
                          useCharacterStore.getState().updateResource(i, 'squares', newVal);
                        }}
                        style={{
                          width: '12px', height: '12px',
                          background: isFilled ? 'var(--dot-color)' : 'transparent',
                          border: `1px solid var(--border)`,
                          borderRadius: '0',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ПРЕДМЕТЫ */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          <div style={{ ...sectionHeaderStyle, textAlign: 'center' }}>{t('ui.items')}</div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <textarea
              value={character.items}
              onChange={(e) => useCharacterStore.getState().updateField('items', e.target.value)}
              placeholder={t('placeholders.items')}
              style={{
                flex: 1,
                height: '100%',
                background: 'var(--input-bg)',
                border: `1px solid var(--border)`,
                outline: 'none',
                padding: '8px',
                fontSize: '12px',
                color: 'var(--text)',
                fontFamily: "'Georgia', serif",
                resize: 'none',
                width: '100%',
                boxSizing: 'border-box',
                minHeight: 0
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
