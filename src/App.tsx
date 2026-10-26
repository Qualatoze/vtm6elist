import { useState, useRef, useEffect } from 'react';
import { useCharacterStore } from './store';
import { SheetPage1 } from './components/SheetPage1';
import { SheetPage2 } from './components/SheetPage2';
import { SheetPage3 } from './components/SheetPage3';
import { SheetPage4 } from './components/SheetPage4';
import { SheetPageInventory } from './components/SheetPageInventory';
import { CharacterSelector } from './components/CharacterSelector';
import i18n, { t } from './i18n';
import { VAMPIRE_TYPES, CREATION_RULES } from './types';
import { exportJSON, importJSONFile, exportAllPDFs } from './utils/exportImport';
import { safeStorage } from './utils/storage';
import { THEMES, DEFAULT_THEME_ID } from './themes';
import { Download, Upload, FileJson, RotateCcw, Menu, X, Send, BookOpen, Globe, History as HistoryIcon } from 'lucide-react';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeId, setThemeId] = useState<string>(() => safeStorage.get('vtm6e-theme') || DEFAULT_THEME_ID);
  const [lang, setLang] = useState<string>(() => safeStorage.get('vtm6e-lang') || 'ru');
  const [showSummary, setShowSummary] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  
  // Состояния для экспорта PDF
  const [isExporting, setIsExporting] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0 });
  const isExportingRef = useRef(false);

  // Классический режим экспорта PDF (светлая тема)
  const [pdfClassicMode, setPdfClassicMode] = useState<boolean>(() => safeStorage.get('vtm6e-pdf-classic') !== 'false');

  useEffect(() => {
    safeStorage.set('vtm6e-pdf-classic', pdfClassicMode.toString());
  }, [pdfClassicMode]);

  const { getActive, loadCharacter, loadCharacters, resetActiveCharacter, addPowerPage, history, pushHistory, clearHistory } = useCharacterStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const character = getActive();
  const prevCharRef = useRef(character);

  // Сброс истории при смене персонажа
  useEffect(() => {
    prevCharRef.current = character;
  }, [character.id]);

  // Функция для генерации наглядного списка изменений
  const getDiffList = (oldC: any, newC: any): string[] => {
    if (!oldC) return [];
    const changes: string[] = [];

    if (oldC.vitae.current !== newC.vitae.current) changes.push(`Витэ ${oldC.vitae.current} > ${newC.vitae.current}`);
    if (oldC.willpower.current !== newC.willpower.current) changes.push(`Воля ${oldC.willpower.current} > ${newC.willpower.current}`);
    if (oldC.humanity.path !== newC.humanity.path) changes.push(`Человечность ${oldC.humanity.path} > ${newC.humanity.path}`);
    if (oldC.bloodSurge !== newC.bloodSurge) changes.push(`Ускорение ${oldC.bloodSurge} > ${newC.bloodSurge}`);

    const attrs = ['strength', 'dexterity', 'stamina', 'charisma', 'manipulation', 'composure', 'intelligence', 'wits', 'resolve'];
    const attrNames: Record<string, string> = { strength: 'Сила', dexterity: 'Ловкость', stamina: 'Выносливость', charisma: 'Обаяние', manipulation: 'Манипуляция', composure: 'Самообладание', intelligence: 'Интеллект', wits: 'Смекалка', resolve: 'Упорство' };
    
    ['physical', 'social', 'mental'].forEach(group => {
      attrs.forEach(a => {
        if (newC.attributes[group]?.[a] !== undefined) {
          const oldVal = oldC.attributes[group]?.[a] || 0;
          const newVal = newC.attributes[group]?.[a] || 0;
          if (oldVal !== newVal) changes.push(`${attrNames[a]} ${oldVal} > ${newVal}`);
        }
      });
    });

    Object.keys(newC.skills).forEach(s => {
      const oldVal = oldC.skills?.[s]?.dots || 0;
      const newVal = newC.skills?.[s]?.dots || 0;
      if (oldVal !== newVal) {
         const skillName = t('skills.' + s) !== 'skills.' + s ? t('skills.' + s) : s;
         changes.push(`${skillName} ${oldVal} > ${newVal}`);
      }
    });

    return changes;
  };

  // Автосохранение в реальном времени (с дебаунсом 2 секунды)
  useEffect(() => {
    if (JSON.stringify(prevCharRef.current) === JSON.stringify(character)) return;

    const timer = setTimeout(() => {
      const current = useCharacterStore.getState().getActive();
      if (JSON.stringify(prevCharRef.current) !== JSON.stringify(current)) {
        const diff = getDiffList(prevCharRef.current, current);
        if (diff.length > 0) {
          pushHistory(diff);
        }
        prevCharRef.current = current;
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [character, pushHistory]);
  const rules = CREATION_RULES[character.meta.type] || CREATION_RULES['vampire_neonate'];

  useEffect(() => {
    isExportingRef.current = isExporting;
  }, [isExporting]);

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
    root.style.setProperty('--header-text', theme.headerText);
    root.style.setProperty('--dot-color', theme.dotColor);
    root.style.setProperty('--card-border', theme.cardBorder);
    root.style.setProperty('--glow', theme.glow);
    root.style.setProperty('--input-bg', theme.inputBg);
    safeStorage.set('vtm6e-theme', themeId);
  }, [themeId]);

  const handleExportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setPdfProgress({ current: 0, total: 0 });
    
    try {
      await exportAllPDFs(character.meta.name, (current, total) => {
        setPdfProgress({ current, total });
      }, pdfClassicMode);
    } catch (err) {
      alert('Ошибка экспорта PDF: ' + (err as Error).message);
    } finally {
      setIsExporting(false);
      setPdfProgress({ current: 0, total: 0 });
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportJSON(useCharacterStore.getState().getActive());
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        if (!isExportingRef.current) handleExportPdf();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onLangChange = (lng: string) => {
      setLang(lng);
      safeStorage.set('vtm6e-lang', lng);
    };
    i18n.on('languageChanged', onLangChange);
    return () => i18n.off('languageChanged', onLangChange);
  }, []);

  const typeLabel = (() => {
    const found = VAMPIRE_TYPES.find(vt => vt.id === character.meta.type);
    return found ? t(found.label) : character.meta.type;
  })();

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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>

      {/* ОВЕРЛЕЙ ЗАГРУЗКИ PDF */}
      {isExporting && (
        <div className="no-print" style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: "'Cinzel', serif"
        }}>
          <div style={{ fontSize: '24px', marginBottom: '20px', letterSpacing: '0.1em' }}>Экспорт PDF</div>
          <div style={{ width: '300px', height: '12px', background: '#333', borderRadius: '6px', overflow: 'hidden', border: '1px solid #555' }}>
            <div style={{
              height: '100%',
              background: 'var(--accent, #b31217)',
              width: pdfProgress.total > 0 ? `${(pdfProgress.current / pdfProgress.total) * 100}%` : '0%',
              transition: 'width 0.2s ease'
            }} />
          </div>
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#aaa' }}>
            {pdfProgress.total > 0 ? `Страница ${pdfProgress.current} из ${pdfProgress.total}` : 'Подготовка...'}
          </div>
        </div>
      )}

      {/* ПАНЕЛЬ СВОДКИ ПРАВИЛ */}
      {showSummary && (
        <div
          className="no-print fixed top-[70px] right-[14px] md:right-[30px] z-[80] rounded-lg p-4 transition-all"
          style={{
            width: 'min(320px, calc(100vw - 28px))',
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            color: 'var(--text)',
            fontSize: '12px',
            fontFamily: "'Inter', sans-serif"
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <h3 style={{ margin: 0, fontWeight: 'bold', color: 'var(--accent)', fontSize: '14px' }}>{t('summary_panel.title', { type: typeLabel })}</h3>
            <button onClick={() => setShowSummary(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={16} /></button>
          </div>

          <div style={{ display: 'grid', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('summary_panel.lifepaths')}:</span> <b>{rules.paths}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('summary_panel.attributes')}:</span> <b>{rules.attrs}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('summary_panel.disciplines')}:</span> <b>{rules.disc}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('summary_panel.powers')}:</span> <b>{rules.powers}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('summary_panel.merits')}:</span> <b>{rules.merits}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('summary_panel.traits')}:</span> <b>{rules.traits}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('summary_panel.skills')}:</span> <b>{rules.skills}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('summary_panel.resources')}:</span> <b>{rules.resources}</b></div>
          </div>

          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '8px', color: 'var(--muted)', fontSize: '11px' }}>
            <div style={{ marginBottom: '4px' }}>{t('summary_panel.max_skill')}: <b>3</b></div>
            <div style={{ marginBottom: '4px' }}>{t('summary_panel.max_disc')}: <b>{rules.maxDisc}</b></div>
            <div style={{ marginBottom: '4px' }}>{t('summary_panel.max_attr')}: <b>{rules.maxAttr}</b></div>
            <div style={{ marginBottom: '4px' }}>{t('summary_panel.specs')}:</div>
          </div>

          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '8px', color: 'var(--muted)', fontSize: '11px' }}>
            <div style={{ marginBottom: '4px' }}>{t('summary_panel.max_vitae')}</div>
            <div>{t('summary_panel.max_will')}</div>
          </div>
        </div>
      )}

      {/* HEADER — minimalist toolbar */}
      <header className="sticky top-0 z-50 no-print" style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
        
        <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          <a href="https://t.me/Oxathioleph" target="_blank" rel="noreferrer" title="Telegram Oxathiole" className="icon-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#229ED9"/>
              <path d="M5.4927 11.8621L18.0652 6.93005C18.6487 6.71824 19.1587 7.07501 18.9697 7.95712L18.9706 7.95593L16.83 18.1383C16.6714 18.8638 16.2422 19.0418 15.6433 18.7015L12.4405 16.3147L10.8934 17.8086C10.7224 17.9796 10.5794 18.1227 10.2491 18.1227L10.4789 14.8651L16.3583 9.52782C16.6158 9.29959 16.3028 9.16997 15.9626 9.39662L8.70475 13.9674L5.54873 12.9896C4.86258 12.7804 4.84673 12.3084 5.4927 11.8621Z" fill="white"/>
            </svg>
          </a>
          <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: "'Cinzel', serif", letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Powered by oxathiole</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '8px 16px', flexWrap: 'wrap', minHeight: '40px' }}>

          <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>VTM 6E</span>

          <div style={{ height: '20px', width: '1px', background: 'var(--border)' }} />

          <CharacterSelector />

          <div style={{ height: '20px', width: '1px', background: 'var(--border)' }} />

          {/* Group 3: Tools */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="icon-btn" onClick={() => setShowSummary(!showSummary)} title={t('common.summary_rules')} style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', fontSize: '7px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', pointerEvents: 'none' }}>rule</span>
              <BookOpen size={16} />
            </button>
            <button className="icon-btn" onClick={() => exportJSON(character)} title={t('common.export_json')} style={{ position: 'relative' }} disabled={isExporting}>
              <span style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', fontSize: '7px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', pointerEvents: 'none' }}>json</span>
              <FileJson size={16} />
            </button>
            <button className="icon-btn" onClick={() => fileInputRef.current?.click()} title={t('common.import_json')} style={{ position: 'relative' }} disabled={isExporting}>
              <span style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', fontSize: '7px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', pointerEvents: 'none' }}>imp</span>
              <Upload size={16} />
            </button>
            <button className="icon-btn" onClick={() => { if (confirm(t('placeholders.clear_sheet'))) resetActiveCharacter(); }} title={t('common.reset')} style={{ position: 'relative' }} disabled={isExporting}>
              <span style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', fontSize: '7px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', pointerEvents: 'none' }}>clear</span>
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Group 4: PDF Export + Classic checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', cursor: 'pointer', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }} title="Экспорт PDF в светлой (классической) теме">
              <input
                type="checkbox"
                checked={pdfClassicMode}
                onChange={e => setPdfClassicMode(e.target.checked)}
                style={{ accentColor: 'var(--accent)', cursor: 'pointer', margin: 0, width: '14px', height: '14px' }}
              />
              Classic
            </label>
            
            <button className="icon-btn" style={{ position: 'relative', opacity: isExporting ? 0.5 : 1, cursor: isExporting ? 'not-allowed' : 'pointer', padding: '4px' }} onClick={handleExportPdf} disabled={isExporting}>
              <span style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', fontSize: '7px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', pointerEvents: 'none' }}>pdf</span>
              <Download size={16} />
            </button>
          </div>

          {/* Group 5: Theme + Mobile menu */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="icon-btn"
              onClick={() => setShowHistory(!showHistory)}
              title="История изменений"
              style={{ position: 'relative', opacity: isExporting ? 0.5 : 1 }}
              disabled={isExporting}
            >
              <span style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', fontSize: '7px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', pointerEvents: 'none' }}>hist</span>
              <HistoryIcon size={16} />
            </button>

            <button
              className="icon-btn"
              onClick={() => {
                if (isExporting) return;
                const currentLang = lang || i18n.language || 'ru';
                const next = ['ru','en','zh'][(['ru','en','zh'].indexOf(currentLang) + 1) % 3];
                i18n.changeLanguage(next).catch(console.error);
              }}
              title={t('ui.language')}
              style={{ position: 'relative', opacity: isExporting ? 0.5 : 1, cursor: isExporting ? 'not-allowed' : 'pointer' }}
              disabled={isExporting}
            >
              <span style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', fontSize: '7px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', pointerEvents: 'none' }}>{lang || 'ru'}</span>
              <Globe size={16} />
            </button>
            
            <select value={themeId} onChange={(e) => setThemeId(e.target.value)} style={{ background: 'var(--panel)', border: `1px solid var(--border)`, color: 'var(--text)', padding: '3px 5px', fontSize: '12px', borderRadius: '4px', opacity: isExporting ? 0.5 : 1 }} disabled={isExporting}>
              {THEMES.map(th => <option key={th.id} value={th.id}>{th.name}</option>)}
            </select>

            <button className="icon-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} title={t('ui.menu')}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{ background: 'var(--panel)', borderTop: '1px solid var(--border)', padding: '8px 12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button onClick={() => { setShowSummary(true); setMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded" style={{ background: 'transparent', color: 'var(--text)', border: `1px solid var(--border)` }}><BookOpen size={14} /> {t('common.summary_rules')}</button>
              <button onClick={() => { exportJSON(character); setMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded" style={{ background: 'transparent', color: 'var(--text)', border: `1px solid var(--border)` }}><FileJson size={14} /> {t('common.export_json')}</button>
              <button onClick={() => { fileInputRef.current?.click(); setMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded" style={{ background: 'transparent', color: 'var(--text)', border: `1px solid var(--border)` }}><Upload size={14} /> {t('common.import_json')}</button>
              <button onClick={() => { handleExportPdf(); setMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded" style={{ background: 'var(--accent)', color: 'var(--bg)' }}><Download size={14} /> {t('common.pdf_export')}</button>
              <button onClick={() => { if (confirm(t('placeholders.clear_sheet'))) resetActiveCharacter(); setMobileMenuOpen(false); }} className="flex items-center gap-2 p-2 rounded" style={{ background: 'transparent', color: 'var(--muted)', border: `1px solid var(--border)` }}><RotateCcw size={14} /> {t('common.reset')}</button>
              <a href="https://t.me/Oxathioleph" target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded" style={{ background: 'transparent', color: 'var(--text)', border: `1px solid var(--border)` }}><Send size={14} /> Telegram</a>
            </div>
          </div>
        )}

        <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
      </header>

      {/* ПАНЕЛЬ ИСТОРИИ */}
      {showHistory && (
        <div className="no-print fixed inset-y-0 right-0 w-80 z-[100] flex flex-col shadow-2xl" style={{ background: 'var(--panel)', borderLeft: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontWeight: 'bold', color: 'var(--accent)', fontSize: '16px', fontFamily: "'Cinzel', serif" }}>История</h3>
            <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}><X size={18} /></button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.length === 0 && <span style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', marginTop: '20px' }}>Изменений пока нет</span>}
            
            {history.map((item) => (
              <div key={item.id} style={{ fontSize: '12px', lineHeight: 1.4, color: 'var(--text)' }}>
                <span style={{ color: 'var(--muted)', marginRight: '6px' }}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},
                </span>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                  {item.changes.join(', ')}
                </span>
              </div>
            ))}
          </div>
          
          {history.length > 0 && (
            <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
               <button onClick={() => { if(confirm('Очистить историю?')) clearHistory(); }} style={{ width: '100%', background: 'transparent', color: 'var(--muted)', border: `1px solid var(--border)`, padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                  Очистить историю
               </button>
            </div>
          )}
        </div>
      )}

      {/* MAIN CONTENT */}
      <main id="main-content" className="flex-1 p-2 md:p-6 pb-20 md:pb-6 overflow-x-hidden">
        <div style={{ width: '100%', maxWidth: '210mm', margin: '0 auto' }}>
          <SheetPage1 />
          <SheetPage2 />
          <SheetPage3 />
          <SheetPageInventory />

          {character.powerPages?.map((page, idx) => (
            <SheetPage4 key={page.id} page={page} pageIndex={idx} />
          ))}

          <div className="no-print" style={{ marginTop: '20px', marginBottom: '40px', textAlign: 'center' }}>
            <button
              onClick={addPowerPage}
              disabled={character.powerPages?.length >= 5}
              style={{
                padding: '10px 20px',
                background: character.powerPages?.length >= 5 ? 'var(--border)' : 'var(--accent)',
                color: character.powerPages?.length >= 5 ? 'var(--muted)' : 'var(--bg)',
                border: 'none',
                borderRadius: '4px',
                cursor: character.powerPages?.length >= 5 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                fontFamily: "'Cinzel', serif"
              }}
            >
              {t('ui.add_page')}
            </button>
          </div>
        </div>
      </main>
      
      <div style={{ textAlign: 'center', padding: '8px 0 4px', fontSize: '11px', color: 'var(--muted)', fontFamily: "'Cinzel', serif", letterSpacing: '0.15em' }}>
        Powered by <span style={{ color: 'var(--accent)' }}>oxathiole</span>
      </div>

    </div>
  );
};

export default App;
