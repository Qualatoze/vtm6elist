// Каркас Supabase: клиент создаётся из VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
// Если env не задан — экспортируется null, приложение не падает.
// В рантайме клиент нигде не вызывается (только каркас, логика синка — в sync.ts).
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
