import { useState, useRef } from 'react';
import { useMasterStore } from '../masterStore';
import type { Campaign, MasterSessionNote } from '../types';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/useIsMobile';
import { Trash2, Plus, X, Pencil } from 'lucide-react';

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

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#e74c3c',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  padding: 0,
};

const tabStyle: React.CSSProperties = {
  background: 'var(--input-bg)',
  border: `1px solid var(--border)`,
  borderBottom: 'none',
  padding: '4px 8px',
  fontSize: '11px',
  cursor: 'pointer',
  color: 'var(--muted)',
  fontFamily: "'Georgia', serif",
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  userSelect: 'none',
  boxSizing: 'border-box',
  flexShrink: 0,
  whiteSpace: 'nowrap',
};

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  background: 'var(--headerBg)',
  color: 'var(--header-text, var(--text))',
  fontWeight: 'bold',
  borderBottom: `2px solid var(--accent)`,
  boxShadow: `0 1px 3px rgba(0,0,0,0.15)`,
};

const tabInputStyle: React.CSSProperties = {
  background: 'var(--input-bg)',
  border: `1px solid var(--accent)`,
  outline: 'none',
  padding: '4px 8px',
  fontSize: '11px',
  color: 'var(--text)',
  fontFamily: "'Georgia', serif",
  width: 'auto',
  minWidth: '60px',
  boxSizing: 'border-box',
  flexShrink: 0,
};

export const MasterPage1 = () => {
  const { t } = useTranslation();
  const master = useMasterStore(s => s.master);
  const {
    getActiveCampaign, selectCampaign, addCampaign, removeCampaign, renameCampaign,
    updateDrama, setDramaMax,
    addSceneTrait, updateSceneTrait, removeSceneTrait, clearSceneTraits,
    addSessionNote, updateSessionNote, renameSessionNote, deleteSessionNote,
  } = useMasterStore();
  const isMobile = useIsMobile();

  const [editingCampId, setEditingCampId] = useState<string | null>(null);
  const [campEditTitle, setCampEditTitle] = useState('');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const [activeSessionNoteId, setActiveSessionNoteId] = useState<string | null>(null);

  const campaigns: Campaign[] = master?.campaigns || [];
  const activeCampaignId = master?.activeCampaignId || (campaigns.length > 0 ? campaigns[0].id : null);
  const activeCampaign = campaigns.find(c => c.id === activeCampaignId) || null;

  const drama = activeCampaign?.drama || { current: 0, max: 5 };
  const sceneTraits = activeCampaign?.sceneTraits || [];
  const sessionNotes: MasterSessionNote[] = activeCampaign?.sessionNotes || [];

  const effectiveActiveTab = activeSessionNoteId && sessionNotes.some(n => n.id === activeSessionNoteId)
    ? activeSessionNoteId
    : (sessionNotes.length > 0 ? sessionNotes[sessionNotes.length - 1].id : null);

  // --- Campaign tab handlers ---
  const handleCampClick = (id: string) => {
    if (editingCampId === id) return;
    selectCampaign(id);
  };

  const handleStartCampEdit = (camp: Campaign) => {
    setEditingCampId(camp.id);
    setCampEditTitle(camp.name);
  };

  const handleSaveCampEdit = () => {
    if (editingCampId && campEditTitle.trim()) {
      renameCampaign(editingCampId, campEditTitle.trim());
    }
    setEditingCampId(null);
  };

  const handleCancelCampEdit = () => {
    setEditingCampId(null);
  };

  const handleCampKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSaveCampEdit(); }
    else if (e.key === 'Escape') { e.preventDefault(); handleCancelCampEdit(); }
  };

  const handleAddCampaign = () => {
    addCampaign();
  };

  const handleRemoveCampaign = (id: string) => {
    removeCampaign(id);
  };

  // --- Session note handlers ---
  const handleTabClick = (id: string) => {
    if (editingTabId === id) return;
    setActiveSessionNoteId(id);
  };

  const handleStartEdit = (note: MasterSessionNote) => {
    setEditingTabId(note.id);
    setEditTitle(note.title || note.date);
  };

  const handleSaveEdit = () => {
    if (editingTabId && editTitle.trim()) {
      renameSessionNote(editingTabId, editTitle.trim());
    }
    setEditingTabId(null);
  };

  const handleCancelEdit = () => {
    setEditingTabId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSaveEdit(); }
    else if (e.key === 'Escape') { e.preventDefault(); handleCancelEdit(); }
  };

  const handleAddSession = () => {
    addSessionNote();
  };

  const handleDeleteSession = (id: string) => {
    deleteSessionNote(id);
  };

  return (
    <div className="master-page" style={{ ...sheetStyle, width: isMobile ? '100%' : '210mm' }}>
      {/* ===== ВКЛАДКИ КАМПАНИЙ ===== */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '8px', flexWrap: 'wrap', overflow: 'visible' }}>
        {campaigns.map(camp => (
          <div key={camp.id} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {editingCampId === camp.id ? (
              <input
                ref={editInputRef}
                value={campEditTitle}
                onChange={(e) => setCampEditTitle(e.target.value)}
                onKeyDown={handleCampKeyDown}
                onBlur={handleSaveCampEdit}
                style={tabInputStyle}
              />
            ) : (
              <>
                <button
                  onClick={() => handleCampClick(camp.id)}
                  style={camp.id === activeCampaignId ? activeTabStyle : tabStyle}
                >
                  {camp.name}
                </button>
                <button
                  onClick={() => handleStartCampEdit(camp)}
                  style={{ ...iconBtnStyle, color: 'var(--accent)', padding: '1px' }}
                  title={t('master.edit_tab')}
                >
                  <Pencil size={10} />
                </button>
              </>
            )}
            <button
              onClick={() => handleRemoveCampaign(camp.id)}
              style={{ ...iconBtnStyle, padding: '2px' }}
              title={t('master.delete')}
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <button
          onClick={handleAddCampaign}
          style={{ ...tabStyle, borderBottom: '1px solid var(--border)', color: 'var(--accent)', fontWeight: 'bold', width: '32px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* ===== ДРАМА ===== */}
      <div style={{ ...sectionHeaderStyle }}>{t('master.drama')}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {Array.from({ length: drama.max }).map((_, i) => {
            const pos = i + 1;
            const isFilled = pos <= drama.current;
            return (
              <button
                key={pos}
                onClick={() => updateDrama(pos === drama.current ? -drama.current : pos - drama.current)}
                style={{
                  width: '14px', height: '14px',
                  background: isFilled ? 'var(--dot-color)' : 'transparent',
                  border: `1px solid ${isFilled ? 'var(--dot-color)' : 'var(--border)'}`,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            );
          })}
        </div>
        <button onClick={() => updateDrama(-1)} style={{ ...inputStyle, width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>−</button>
        <span style={{ fontSize: '13px', fontWeight: 'bold', fontFamily: "'Georgia', serif" }}>{drama.current}/{drama.max}</span>
        <button onClick={() => updateDrama(1)} style={{ ...inputStyle, width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>+</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--muted)', marginLeft: 'auto' }}>
          {t('master.drama_max')}:
          <input
            type="number"
            value={drama.max}
            onChange={(e) => setDramaMax(Number(e.target.value))}
            style={{ ...inputStyle, width: '40px' }}
          />
        </label>
      </div>

      {/* ===== ЧЕРТЫ СЦЕНЫ ===== */}
      <div style={{ ...sectionHeaderStyle }}>{t('master.scene_traits')}</div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => addSceneTrait({ name: '', description: '', effect: '' })} style={{ ...inputStyle, width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '4px 8px' }}>
          <Plus size={14} /> {t('master.add_scene_trait')}
        </button>
        {sceneTraits.length > 0 && (
          <button onClick={() => clearSceneTraits()} style={{ ...inputStyle, width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '4px 8px' }}>
            <X size={14} /> {t('master.clear_scene_traits')}
          </button>
        )}
      </div>
      {sceneTraits.length === 0 ? (
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--muted)' }}>{t('master.no_scene_traits')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {sceneTraits.map(trait => (
            <div key={trait.id} style={{ border: '1px solid var(--border)', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input value={trait.name} onChange={(e) => updateSceneTrait(trait.id, { name: e.target.value })} style={{ ...inputStyle, width: 'auto' }} placeholder={t('master.scene_trait_name')} />
                <button onClick={() => removeSceneTrait(trait.id)} style={iconBtnStyle} title={t('master.delete')}>
                  <Trash2 size={14} />
                </button>
              </div>
              <input value={trait.description} onChange={(e) => updateSceneTrait(trait.id, { description: e.target.value })} style={{ ...inputStyle }} placeholder={t('master.scene_trait_desc')} />
              <input value={trait.effect} onChange={(e) => updateSceneTrait(trait.id, { effect: e.target.value })} style={{ ...inputStyle }} placeholder={t('master.scene_trait_effect')} />
            </div>
          ))}
        </div>
      )}

      {/* ===== ЗАМЕТКИ СЕССИИ ===== */}
      <div style={{ ...sectionHeaderStyle }}>{t('master.session_notes')}</div>
      <div style={{ display: 'flex', gap: '2px', marginBottom: '6px', flexWrap: 'wrap', overflow: 'visible' }}>
        {sessionNotes.map(note => (
          <div key={note.id} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {editingTabId === note.id ? (
              <input
                ref={editInputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={handleSaveEdit}
                style={tabInputStyle}
              />
            ) : (
              <>
                <button
                  onClick={() => handleTabClick(note.id)}
                  style={effectiveActiveTab === note.id ? activeTabStyle : tabStyle}
                >
                  {note.title || note.date}
                </button>
                <button
                  onClick={() => handleStartEdit(note)}
                  style={{ ...iconBtnStyle, color: 'var(--accent)', padding: '1px' }}
                  title={t('master.edit_tab')}
                >
                  <Pencil size={10} />
                </button>
              </>
            )}
            <button
              onClick={() => handleDeleteSession(note.id)}
              style={{ ...iconBtnStyle, padding: '2px' }}
              title={t('master.delete')}
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <button
          onClick={handleAddSession}
          style={{ ...tabStyle, borderBottom: '1px solid var(--border)', color: 'var(--accent)', fontWeight: 'bold', width: '32px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        >
          <Plus size={16} />
        </button>
      </div>

      {sessionNotes.length > 0 && effectiveActiveTab ? (
        <textarea
          value={sessionNotes.find(n => n.id === effectiveActiveTab)?.content || ''}
          onChange={(e) => updateSessionNote(effectiveActiveTab, { content: e.target.value, lastUpdated: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) })}
          placeholder={t('master.session_notes_placeholder')}
          style={{
            flex: 1,
            width: '100%',
            minHeight: '180px',
            background: 'var(--input-bg)',
            border: '1px solid var(--border)',
            padding: '10px',
            fontSize: '12px',
            color: 'var(--text)',
            fontFamily: "'Georgia', serif",
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            lineHeight: 1.5,
          }}
        />
      ) : (
        <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--muted)' }}>{t('master.no_sessions')}</p>
      )}
    </div>
  );
};
