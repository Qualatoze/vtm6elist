const API_URL = import.meta.env.DEV
  ? 'http://localhost:3001/api'
  : '/api';

export const api = {
  getToken: (): string | null => localStorage.getItem('vtm_token'),
  setToken: (token: string) => localStorage.setItem('vtm_token', token),
  logout: () => {
    localStorage.removeItem('vtm_token');
    window.location.reload();
  },

  login: async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const data = await res.json();
    api.setToken(data.token);
    return data;
  },

  register: async (username: string, password: string, inviteCode: string) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, inviteCode }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const data = await res.json();
    api.setToken(data.token);
    return data;
  },

  fetchCharacters: async (): Promise<any[] | null> => {
    const token = api.getToken();
    if (!token) return null;
    const res = await fetch(`${API_URL}/characters`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      api.logout();
      return null;
    }
    return res.json();
  },

  saveCharacters: async (characters: any[]) => {
    const token = api.getToken();
    if (!token) return;
    await fetch(`${API_URL}/characters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(characters),
    });
  },

  verifyCode: async (code: string): Promise<boolean> => {
    const res = await fetch(`${API_URL}/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    return data.valid === true;
  },
};
