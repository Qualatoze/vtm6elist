// Синхронизация персонажей с Supabase (offline-first).
// localStorage — основной кэш (persist не отключён), Supabase — бэкап + многоустройств.
// Стратегия: pull-on-login + debounced diff-upsert + явный delete.
// Если supabase === null (нет env) или нет сети — приложение работает как раньше на localStorage.
import { useCharacterStore } from '../store';
import { CharacterSheet } from '../types';
import { supabase } from './supabase';

// --- Модульное состояние синка (для useSyncExternalStore в AccountRoute) ---
export interface SyncStatus {
  user: string | null;
  merge: { cloudCount: number; localCount: number } | null;
  error: string | null;
}

let status: SyncStatus = { user: null, merge: null, error: null };
const listeners = new Set<() => void>();

function setStatus(next: Partial<SyncStatus>) {
  status = { ...status, ...next };
  listeners.forEach((l) => l());
}

export function getSyncStatus(): SyncStatus {
  return status;
}

export function subscribeSyncStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// --- Внутреннее состояние ---
let currentUserId: string | null = null;
let lastSynced: Record<string, any> = {}; // id -> data (последний синхронизированный)
let pushTimer: ReturnType<typeof setTimeout> | null = null;
const deletingIds = new Set<string>();

const PUSH_DEBOUNCE_MS = 1200;

interface CloudChar {
  id: string;
  name: string;
  data: any;
  updatedAt: string | null;
}

function syncLastSynced(chars: CharacterSheet[]) {
  lastSynced = {};
  chars.forEach((c) => { lastSynced[c.id] = c; });
}

// --- Pull: SELECT * FROM characters ---
async function pullFromCloud(userId: string): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('characters')
    .select('id, name, data, updated_at');

  if (error) {
    setStatus({ error: error.message });
    return;
  }

  const cloudChars: CloudChar[] = (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    data: row.data,
    updatedAt: row.updated_at,
  }));

  const localChars = useCharacterStore.getState().characters;

  // 1) облако пусто → seed локальных (одноразовый upsert всех локальных)
  if (cloudChars.length === 0) {
    if (localChars.length > 0) {
      await seedLocalToCloud(userId, localChars);
      syncLastSynced(localChars);
    }
    setStatus({ merge: null, error: null });
    return;
  }

  // 2) локально пусто → загрузить облако
  if (localChars.length === 0) {
    await loadCloudToLocal(cloudChars);
    syncLastSynced(cloudChars.map((c) => ({ ...c.data, id: c.id } as CharacterSheet)));
    setStatus({ merge: null, error: null });
    return;
  }

  // 3) оба не пустые → если совпадают по id и data — в синхронизации, иначе промпт
  const cloudIdSet = new Set(cloudChars.map((c) => c.id));
  const localIdSet = new Set(localChars.map((c) => c.id));
  const sameIds =
    cloudIdSet.size === localIdSet.size &&
    [...cloudIdSet].every((id) => localIdSet.has(id));
  const cloudById = new Map(cloudChars.map((c) => [c.id, c]));
  const sameData = sameIds && localChars.every((c) => JSON.stringify(cloudById.get(c.id)?.data) === JSON.stringify(c));

  if (sameIds && sameData) {
    syncLastSynced(localChars);
    setStatus({ merge: null, error: null });
    return;
  }

  // 4) различия → промпт merge/overwrite
  setStatus({ merge: { cloudCount: cloudChars.length, localCount: localChars.length } });
}

// seed: upsert всех локальных в облако (облако было пусто)
async function seedLocalToCloud(userId: string, localChars: CharacterSheet[]): Promise<void> {
  if (!supabase) return;
  const rows = localChars.map((c) => ({
    id: c.id,
    user_id: userId,
    name: c.meta.name || 'Unnamed',
    data: c,
  }));
  const { error } = await supabase.from('characters').upsert(rows, { onConflict: 'id' });
  if (error) setStatus({ error: error.message });
}

// локально пусто → загрузить облако
async function loadCloudToLocal(cloudChars: CloudChar[]): Promise<void> {
  const store = useCharacterStore.getState();
  store.loadCharacters(cloudChars.map((c) => ({ ...c.data, id: c.id } as CharacterSheet)));
}

// resolveMerge: merge = union (облако выигрывает конфликты, локальные-only сохраняются);
// overwrite = локальные заменяются облаком (локальные-only удаляются).
export async function resolveMerge(mode: 'merge' | 'overwrite'): Promise<void> {
  if (!supabase || !currentUserId) return;
  const { data, error } = await supabase.from('characters').select('id, name, data, updated_at');
  if (error) { setStatus({ error: error.message }); return; }

  const cloudChars: CloudChar[] = (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    data: row.data,
    updatedAt: row.updated_at,
  }));
  const store = useCharacterStore.getState();
  const cloudById = new Map(cloudChars.map((c) => [c.id, c]));

  if (mode === 'overwrite') {
    // локальные = ровно облако
    store.loadCharacters(cloudChars.map((c) => ({ ...c.data, id: c.id } as CharacterSheet)));
    const localOnlyIds = [...useCharacterStore.getState().characters.map((c) => c.id)].filter((id) => !cloudById.has(id));
    for (const id of localOnlyIds) {
      await store.removeCharacter(id);
    }
  } else {
    // merge: loadCharacters уже делает union (облако выигрывает конфликты, локальные-only сохраняются)
    store.loadCharacters(cloudChars.map((c) => ({ ...c.data, id: c.id } as CharacterSheet)));
  }

  syncLastSynced(useCharacterStore.getState().characters);
  setStatus({ merge: null, error: null });
}

// --- Push: debounced diff-upsert ---
function schedulePush() {
  if (!supabase || !currentUserId) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    pushTimer = null;
    await doPush();
  }, PUSH_DEBOUNCE_MS);
}

async function doPush(): Promise<void> {
  if (!supabase || !currentUserId) return;
  const localChars = useCharacterStore.getState().characters;
  for (const c of localChars) {
    if (deletingIds.has(c.id)) continue;
    const prev = lastSynced[c.id];
    if (prev && JSON.stringify(prev) === JSON.stringify(c)) continue;
    const { error } = await supabase.from('characters').upsert({
      id: c.id,
      user_id: currentUserId,
      name: c.meta.name || 'Unnamed',
      data: c,
    }, { onConflict: 'id' });
    if (error) { setStatus({ error: error.message }); break; }
    lastSynced[c.id] = c;
  }
}

// явный delete (вызывается из store.removeCharacter)
export async function deleteCharacter(id: string): Promise<void> {
  if (!supabase) return;
  deletingIds.add(id);
  try {
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) console.error('sync delete failed', error.message);
  } finally {
    // id остаётся в deletingIds до локального удаления (см. removeCharacter в store)
  }
}

export function endDelete(id: string): void {
  deletingIds.delete(id);
}

// ручная отправка накопленных изменений
export function flushPendingSaves(): void {
  if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
  doPush();
}

// --- Инициализация: подписка на auth-события и push ---
export function initSync() {
  if (!supabase) return; // нет env → no-op, приложение работает на localStorage

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      currentUserId = session.user.id;
      setStatus({ user: session.user.email || null, merge: null, error: null });
      pullFromCloud(session.user.id);
    } else {
      currentUserId = null;
      setStatus({ user: null, merge: null, error: null });
    }
  });

  useCharacterStore.subscribe(() => schedulePush());
}
