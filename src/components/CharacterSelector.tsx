import { useState, useRef, useEffect } from 'react';
import { useCharacterStore } from '../store';
import { t } from '../i18n';
import { CLANS_LIST } from '../types';
import { ChevronDown, Plus, Trash2, Users } from 'lucide-react';

export const CharacterSelector = () => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { characters, activeId, switchCharacter, newCharacter, removeCharacter, getActive } = useCharacterStore();
  const active = getActive();

  // Lock body scroll when dropdown is open to prevent page shift
  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded px-2 py-1 text-sm cursor-pointer" style={{ background: 'var(--panel)', border: `1px solid var(--border)`, color: 'var(--text)', width: '180px', minWidth: '180px', flexShrink: 0 }}>
        <Users size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span className="truncate" style={{ color: 'var(--text)', flex: 1, textAlign: 'left' }}>{active?.meta.name || t('common.nameless')}</span>
        <ChevronDown size={12} style={{ color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
      </button>

      {open && (
        <>
          {/* Invisible fixed overlay to catch clicks outside */}
          <div className="fixed inset-0 z-[60] no-print" onClick={() => setOpen(false)} style={{ background: 'transparent', pointerEvents: 'all' }} />
          {/* Dropdown positioned relative to wrapper */}
          <div className="absolute top-full left-0 mt-1 min-w-[200px] max-h-80 overflow-y-auto rounded shadow-xl z-[70]" style={{ background: 'var(--panel)', border: `1px solid var(--border)`, color: 'var(--text)' }}>
            {characters.map(c => (
              <div key={c.id} className={`flex items-center px-2 py-1.5 cursor-pointer`} style={{ background: c.id === active?.id ? 'var(--headerBg)' : 'transparent', borderLeft: c.id === active?.id ? `3px solid var(--accent)` : 'none' }}>
                <button className="flex-1 text-left text-sm truncate" onClick={() => { switchCharacter(c.id); setOpen(false); }} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 0 }}>
                  {c.meta.name || t('common.nameless')}
                  {c.meta.clan && (
                    CLANS_LIST.some(cl => cl.id === c.meta.clan)
                      ? <span className="ml-1 text-xs" style={{ color: 'var(--muted)' }}>({t('clans.' + c.meta.clan)})</span>
                      : <span className="ml-1 text-xs" style={{ color: 'var(--muted)' }}>({c.meta.clan})</span>
                  )}
                </button>
                {characters.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); if (confirm(t('placeholders.delete_character'))) removeCharacter(c.id); }} className="ml-1" style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => { newCharacter(); setOpen(false); }} className="w-full flex items-center gap-1 px-2 py-1.5 text-sm cursor-pointer" style={{ background: 'none', border: `1px solid var(--border)`, color: '#4ade80' }}>
              <Plus size={12} /> {t('common.new_character')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
