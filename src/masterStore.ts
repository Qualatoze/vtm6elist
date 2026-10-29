import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { debouncedStorage } from './utils/debouncedStorage';
import type { MasterSheet, Campaign, SceneTrait, MasterSessionNote } from './types';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const uid = () => Math.random().toString(36).slice(2, 10);

const createEmptyCampaign = (): Campaign => ({
  id: uid(),
  name: 'Новая кампания',
  drama: { current: 0, max: 5 },
  sceneTraits: [],
  sessionNotes: [],
});

const createEmptyMaster = (): MasterSheet => ({
  campaigns: [createEmptyCampaign()],
  activeCampaignId: null,
  npcText: '',
});

interface MasterStore {
  master: MasterSheet;
  getActiveCampaign: () => Campaign | null;
  selectCampaign: (id: string) => void;
  addCampaign: () => void;
  removeCampaign: (id: string) => void;
  renameCampaign: (id: string, name: string) => void;
  updateDrama: (delta: number) => void;
  setDramaMax: (max: number) => void;
  addSceneTrait: (data: Omit<SceneTrait, 'id'>) => void;
  updateSceneTrait: (id: string, data: Partial<Omit<SceneTrait, 'id'>>) => void;
  removeSceneTrait: (id: string) => void;
  clearSceneTraits: () => void;
  addSessionNote: () => void;
  updateSessionNote: (id: string, data: Partial<Omit<MasterSessionNote, 'id'>>) => void;
  renameSessionNote: (id: string, title: string) => void;
  deleteSessionNote: (id: string) => void;
  updateNpcText: (value: string) => void;
  resetMaster: () => void;
}

export const useMasterStore = create<MasterStore>()(
  persist(
    (set, get) => ({
      master: createEmptyMaster(),

      getActiveCampaign: () => {
        const { campaigns, activeCampaignId } = get().master;
        if (activeCampaignId) {
          return campaigns.find(c => c.id === activeCampaignId) || null;
        }
        return campaigns.length > 0 ? campaigns[0] : null;
      },

      selectCampaign: (id) => set((s) => ({
        master: { ...s.master, activeCampaignId: id },
      })),

      addCampaign: () => set((s) => {
        const newCamp = createEmptyCampaign();
        return {
          master: {
            ...s.master,
            campaigns: [...(s.master.campaigns || []), newCamp],
            activeCampaignId: newCamp.id,
          },
        };
      }),

      removeCampaign: (id) => set((s) => {
        const remaining = (s.master.campaigns || []).filter(c => c.id !== id);
        const newActiveId = s.master.activeCampaignId === id
          ? (remaining.length > 0 ? remaining[0].id : null)
          : s.master.activeCampaignId;
        return {
          master: { ...s.master, campaigns: remaining, activeCampaignId: newActiveId },
        };
      }),

      renameCampaign: (id, name) => set((s) => ({
        master: {
          ...s.master,
          campaigns: (s.master.campaigns || []).map(c => (c.id === id ? { ...c, name } : c)),
        },
      })),

      updateDrama: (delta) => set((s) => {
        const camps = s.master.campaigns || [];
        const camp = camps.find(c => c.id === (s.master.activeCampaignId || camps[0]?.id));
        if (!camp) return s;
        const max = camp.drama.max;
        const current = clamp(camp.drama.current + delta, 0, max);
        return {
          master: {
            ...s.master,
            campaigns: camps.map(c => (c.id === camp.id ? { ...c, drama: { current, max } } : c)),
          },
        };
      }),

      setDramaMax: (max) => set((s) => {
        const camps = s.master.campaigns || [];
        const newMax = clamp(Math.round(max), 1, 20);
        const campId = s.master.activeCampaignId || camps[0]?.id;
        if (!campId) return s;
        return {
          master: {
            ...s.master,
            campaigns: camps.map(c => (c.id === campId ? { ...c, drama: { current: Math.min(c.drama.current, newMax), max: newMax } } : c)),
          },
        };
      }),

      addSceneTrait: (data) => set((s) => {
        const campId = s.master.activeCampaignId || s.master.campaigns[0]?.id;
        if (!campId) return s;
        return {
          master: {
            ...s.master,
            campaigns: s.master.campaigns.map(c => (c.id === campId ? { ...c, sceneTraits: [...(c.sceneTraits || []), { id: uid(), ...data }] } : c)),
          },
        };
      }),

      updateSceneTrait: (id, data) => set((s) => {
        const campId = s.master.activeCampaignId || s.master.campaigns[0]?.id;
        if (!campId) return s;
        return {
          master: {
            ...s.master,
            campaigns: s.master.campaigns.map(c => (c.id === campId ? { ...c, sceneTraits: (c.sceneTraits || []).map(t => (t.id === id ? { ...t, ...data } : t)) } : c)),
          },
        };
      }),

      removeSceneTrait: (id) => set((s) => {
        const campId = s.master.activeCampaignId || s.master.campaigns[0]?.id;
        if (!campId) return s;
        return {
          master: {
            ...s.master,
            campaigns: s.master.campaigns.map(c => (c.id === campId ? { ...c, sceneTraits: (c.sceneTraits || []).filter(t => t.id !== id) } : c)),
          },
        };
      }),

      clearSceneTraits: () => set((s) => {
        const campId = s.master.activeCampaignId || s.master.campaigns[0]?.id;
        if (!campId) return s;
        return {
          master: {
            ...s.master,
            campaigns: s.master.campaigns.map(c => (c.id === campId ? { ...c, sceneTraits: [] } : c)),
          },
        };
      }),

      addSessionNote: () => set((s) => {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const lastUpdated = now.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const newNote: MasterSessionNote = { id: uid(), date, lastUpdated, content: '' };
        const campId = s.master.activeCampaignId || s.master.campaigns[0]?.id;
        if (!campId) return s;
        return {
          master: {
            ...s.master,
            campaigns: s.master.campaigns.map(c => (c.id === campId ? { ...c, sessionNotes: [...(c.sessionNotes || []), newNote] } : c)),
          },
        };
      }),

      updateSessionNote: (id, data) => set((s) => {
        const campId = s.master.activeCampaignId || s.master.campaigns[0]?.id;
        if (!campId) return s;
        return {
          master: {
            ...s.master,
            campaigns: s.master.campaigns.map(c => (c.id === campId ? { ...c, sessionNotes: (c.sessionNotes || []).map(n => (n.id === id ? { ...n, ...data } : n)) } : c)),
          },
        };
      }),

      renameSessionNote: (id, title) => set((s) => {
        const campId = s.master.activeCampaignId || s.master.campaigns[0]?.id;
        if (!campId) return s;
        return {
          master: {
            ...s.master,
            campaigns: s.master.campaigns.map(c => (c.id === campId ? { ...c, sessionNotes: (c.sessionNotes || []).map(n => (n.id === id ? { ...n, title: title || undefined } : n)) } : c)),
          },
        };
      }),

      deleteSessionNote: (id) => set((s) => {
        const campId = s.master.activeCampaignId || s.master.campaigns[0]?.id;
        if (!campId) return s;
        return {
          master: {
            ...s.master,
            campaigns: s.master.campaigns.map(c => (c.id === campId ? { ...c, sessionNotes: (c.sessionNotes || []).filter(n => n.id !== id) } : c)),
          },
        };
      }),

      updateNpcText: (value) => set((s) => ({
        master: { ...s.master, npcText: value },
      })),

      resetMaster: () => set({ master: createEmptyMaster() }),
    }),
    {
      name: 'vtm6e-master-storage',
      storage: createJSONStorage(() => debouncedStorage),
      migrate: (persisted: any) => {
        // Normalize a single campaign object to ensure all fields are present
        const normalizeCampaign = (c: any): Campaign => ({
          id: c?.id || uid(),
          name: c?.name || 'Кампания',
          drama: c?.drama && typeof c.drama === 'object' ? { current: clamp(c.drama.current || 0, 0, c.drama.max || 5), max: clamp(c.drama.max || 5, 1, 20) } : { current: 0, max: 5 },
          sceneTraits: Array.isArray(c?.sceneTraits) ? c.sceneTraits : [],
          sessionNotes: Array.isArray(c?.sessionNotes) ? c.sessionNotes : [],
        });

        if (persisted && Array.isArray(persisted.campaigns)) {
          const campaigns = persisted.campaigns.map((c: any) => normalizeCampaign(c));
          return {
            campaigns,
            activeCampaignId: persisted.activeCampaignId || (campaigns.length > 0 ? campaigns[0].id : null),
            npcText: persisted.npcText || '',
          };
        }
        if (persisted && typeof persisted.drama === 'object') {
          const oldCamp: Campaign = {
            id: uid(),
            name: persisted.campaign || 'Кампания',
            drama: persisted.drama,
            sceneTraits: persisted.sceneTraits || [],
            sessionNotes: Array.isArray(persisted.sessionNotes) ? persisted.sessionNotes : [],
          };
          return {
            campaigns: [normalizeCampaign(oldCamp)],
            activeCampaignId: oldCamp.id,
            npcText: persisted.npcText || '',
          };
        }
        return createEmptyMaster();
      },
    }
  )
);
