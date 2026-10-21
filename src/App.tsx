import { useState, useRef, useEffect } from 'react';
import { useCharacterStore } from './store';
import { SheetPage1 } from './components/SheetPage1';
import { SheetPage2 } from './components/SheetPage2';
import { CharacterSelector } from './components/CharacterSelector';
import { SKILLS_LIST } from './types';
import { exportJSON, importJSONFile, exportAllPDFs } from './utils/exportImport';
import { THEMES, DEFAULT_THEME_ID } from './themes';
import { rollDicePool } from './utils/diceRoller';
import { Download, Upload, FileJson, RotateCcw, Menu, X, Dices } from 'lucide-react';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeId, setThemeId] = useState<string>(() => localStorage.getItem('vtm6e-theme') || DEFAULT_THEME_ID);
  const [diceResults, setDiceResults] = useState<number[] | null>(null);
  const { getActive, loadCharacter, loadCharacters, resetActiveCharacter } = useCharacterStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const character = getActive();

  // Apply theme CSS variables
  useEffect(() => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--panel', theme.panel);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--muted', theme.muted);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--header-bg', theme.headerBg);
    root.style.setProperty('--dot-color', theme.dotColor);
    root.style.setProperty('--card-border', theme.cardBorder);
    root.style.setProperty('--glow', theme.glow);
    root.style.setProperty('--input-bg', theme.inputBg);
    localStorage.setItem('vtm6e-theme', themeId);
  }, [themeId]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportJSON(useCharacterStore.getState().getActive());
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        exportAllPDFs(useCharacterStore.getState().getActive().meta.name);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importJSONFile(
      file,
      (data) => {
        if (Array.isArray(data)) loadCharacters(data);
        else loadCharacter(data);
      },
      (err) => alert(err)
    );
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDiceRoll = () => {
    const attrInput = prompt('Атрибут:\n1. Сила\n2. Ловкость\n3. Выносливость\n4. Обаяние\n5. Манипуляция\n6. Самообладание\n7. Интеллект\n8. Смекалка\n9. Упорство', '1');
    const skillInput = prompt('Навык:\n' + SKILLS_LIST.map((s, i) => `${i + 1}. ${s}`).join('\n'), '5');
    if (attrInput === null || skillInput === null) return;
    const attrIdx = parseInt(attrInput, 10) - 1;
    const skillIdx = parseInt(skillInput, 10) - 1;
    if (isNaN(attrIdx) || isNaN(skillIdx)) return;
    const attrs = [character.attributes.physical.strength, character.attributes.physical.dexterity, character.attributes.physical.stamina, character.attributes.social.charisma, character.attributes.social.manipulation, character.attributes.social.composure, character.attributes.mental.intelligence, character.attributes.mental.wits, character.attributes.mental.resolve];
    const poolSize = Math.max(1, (attrs[attrIdx] || 0) + (character.skills[SKILLS_LIST[skillIdx]]?.dots || 0));
    const results = rollDicePool(poolSize);
    setDiceResults(results.map(r => r.value));
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* HEADER — centered, single row */}
      <header className="sticky top-0 z-50 no-print" style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '6px 12px', flexWrap: 'wrap' }}>

          {/* Title */}
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>VTM 6E</span>

          {/* Character selector */}
          <CharacterSelector />

          {/* Tools */}
          <div style={{ display: 'flex', gap: '3px' }}>
            <button onClick={() => exportJSON(character)} title="Экспорт JSON" style={{ background: 'var(--border)', color: 'var(--text)', border: 'none', padding: '4px 5px', borderRadius: '3px', cursor: 'pointer' }}><FileJson size={12} /></button>
            <button onClick={() => fileInputRef.current?.click()} title="Импорт JSON" style={{ background: 'var(--border)', color: 'var(--text)', border: 'none', padding: '4px 5px', borderRadius: '3px', cursor: 'pointer' }}><Upload size={12} /></button>
            <button onClick={() => exportAllPDFs(character.meta.name)} title="Экспорт PDF" style={{ background: 'var(--accent)', color: 'var(--bg)', border: 'none', padding: '4px 5px', borderRadius: '3px', cursor: 'pointer' }}><Download size={12} /></button>
            <button onClick={() => { if (confirm('Очистить лист?')) resetActiveCharacter(); }} title="Сброс" style={{ background: 'var(--border)', color: 'var(--muted)', border: 'none', padding: '4px 5px', borderRadius: '3px', cursor: 'pointer' }}><RotateCcw size={12} /></button>
          </div>

          {/* Theme selector */}
          <select value={themeId} onChange={(e) => setThemeId(e.target.value)} style={{ background: 'var(--panel)', border: `1px solid var(--border)`, color: 'var(--text)', padding: '3px 5px', fontSize: '12px', borderRadius: '3px' }}>
            {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{ background: 'var(--panel)', borderTop: '1px solid var(--border)', padding: '8px 12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button onClick={() => { exportJSON(character); setMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded" style={{ background: 'var(--border)', color: 'var(--text)' }}><FileJson size={14} /> Экспорт JSON</button>
              <button onClick={() => { fileInputRef.current?.click(); setMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded" style={{ background: 'var(--border)', color: 'var(--text)' }}><Upload size={14} /> Импорт JSON</button>
              <button onClick={() => { exportAllPDFs(character.meta.name); setMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded" style={{ background: 'var(--accent)', color: 'var(--bg)' }}><Download size={14} /> Экспорт PDF</button>
              <button onClick={() => { if (confirm('Очистить?')) resetActiveCharacter(); setMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded" style={{ background: 'var(--border)', color: 'var(--muted)' }}><RotateCcw size={14} /> Очистить</button>
            </div>
          </div>
        )}

        <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
      </header>

      {/* MAIN CONTENT — single scrolling page */}
      <main id="main-content" className="flex-1 p-2 md:p-6 pb-20 md:pb-6 overflow-x-hidden">
        <div style={{ width: '100%', maxWidth: '210mm', margin: '0 auto' }}>
          <SheetPage1 />
          <SheetPage2 />
        </div>
      </main>

      {/* DICE ROLLER FAB (mobile) */}
      <button
        onClick={handleDiceRoll}
        className="md:hidden fixed bottom-4 right-4 z-50 no-print"
        style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--accent)', color: '#fff', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        title="Бросить кубики (d10 пул)"
      >
        <Dices size={28} />
      </button>

      {/* DICE RESULTS TOAST */}
      {diceResults && diceResults.length > 0 && (
        <div className="fixed bottom-4 left-4 z-50 no-print" style={{ background: 'var(--panel)', border: `1px solid var(--border)`, borderRadius: '8px', padding: '8px 14px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)', marginRight: '4px' }}>{diceResults.length}d10:</span>
          {diceResults.map((v, i) => (
            <span key={i} style={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '4px', background: v >= 9 ? 'var(--accent)' : 'transparent', color: v >= 9 ? '#fff' : 'var(--text)', border: v >= 9 ? 'none' : `1px solid var(--border)` }}>{v}</span>
          ))}
        </div>
      )}

    </div>
  );
};

export default App;
