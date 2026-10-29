import { useState } from 'react';
import { api } from '../utils/api';
import { t } from '../i18n';

export const AuthScreen = ({ onAuth }: { onAuth: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await api.login(username, password);
      } else {
        await api.register(username, password, inviteCode);
      }
      onAuth();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    background: 'var(--input-bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    fontSize: '14px',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontFamily: "'Georgia', serif",
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--panel)',
          padding: '30px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          width: '320px',
          maxWidth: '90vw',
        }}
      >
        <h2 style={{ textAlign: 'center', color: 'var(--accent)', fontFamily: "'Cinzel', serif", marginBottom: '20px', letterSpacing: '0.1em' }}>
          {isLogin ? t('auth.login') : t('auth.register')}
        </h2>

        {error && (
          <div style={{ color: '#e74c3c', fontSize: '12px', marginBottom: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder={t('auth.username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {!isLogin && (
          <input
            type="text"
            placeholder={t('auth.invite_code')}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            style={{ ...inputStyle, border: '1px solid var(--accent)' }}
          />
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: loading ? 'var(--muted)' : 'var(--accent)',
            color: '#000',
            fontWeight: 'bold',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '10px',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: "'Georgia', serif",
          }}
        >
          {loading ? t('auth.loading') : isLogin ? t('auth.login_btn') : t('auth.register_btn')}
        </button>

        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          style={{
            width: '100%',
            background: 'transparent',
            color: 'var(--muted)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '4px',
          }}
        >
          {isLogin ? t('auth.no_account') : t('auth.has_account')}
        </button>
      </form>
    </div>
  );
};
