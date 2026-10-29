import { useState, useEffect } from 'react';
import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/useIsMobile';
import { supabase } from '../lib/supabase';
import { getSyncStatus, subscribeSyncStatus, resolveMerge } from '../lib/sync';

const cardStyle: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  backgroundColor: 'var(--bg)',
  color: 'var(--text)',
  margin: '0 auto',
  padding: '10mm',
  border: '3px solid var(--border)',
  boxSizing: 'border-box',
  fontFamily: "'Georgia', 'Times New Roman', 'Noto Sans SC', serif",
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '320px',
  padding: '8px 10px',
  fontSize: '14px',
  background: 'var(--input-bg)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  outline: 'none',
};

const btnStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '14px',
  background: 'var(--accent)',
  color: 'var(--bg)',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const ghostBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '14px',
  background: 'var(--panel)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  cursor: 'pointer',
};

export const AccountRoute = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const hasConfig = Boolean(import.meta.env.VITE_SUPABASE_URL);

  const status = useSyncExternalStore(subscribeSyncStatus, getSyncStatus);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [letterSent, setLetterSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // сброс «письмо отправлено» при входе в аккаунт
  useEffect(() => {
    if (status.user) setLetterSent(false);
  }, [status.user]);

  const handleSend = async () => {
    if (!supabase || sending || !email.trim()) return;
    setError(null);
    setSending(true);
    try {
      await supabase.auth.signInWithOtp({ email: email.trim() });
      setLetterSent(true);
    } catch (e: any) {
      setError(e.message || t('account.error'));
      setLetterSent(false);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  const handleMerge = async (mode: 'merge' | 'overwrite') => {
    setError(null);
    await resolveMerge(mode);
  };

  return (
    <div className="sheet-page" style={{ ...cardStyle, width: isMobile ? '100%' : '210mm' }}>
      <h1
        style={{
          margin: '0 0 12px',
          fontSize: '16px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          textAlign: 'center',
          fontFamily: "'Georgia', 'Noto Sans SC', serif"
        }}
      >
        {t('account.title')}
      </h1>

      {!hasConfig ? (
        <>
          <p style={{ margin: 0, fontSize: '14px' }}>{t('account.not_configured')}</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{t('account.config_hint')}</p>
        </>
      ) : (
        <>
          {status.merge && (
            <div
              style={{
                width: '100%',
                maxWidth: '360px',
                padding: '12px',
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                textAlign: 'center',
                marginBottom: '8px'
              }}
            >
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold' }}>{t('account.merge_title')}</p>
              <p style={{ margin: '2px 0', fontSize: '13px' }}>{t('account.merge_cloud', { cloud: status.merge.cloudCount })}</p>
              <p style={{ margin: '2px 0', fontSize: '13px' }}>{t('account.merge_local', { local: status.merge.localCount })}</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                <button onClick={() => handleMerge('merge')} style={btnStyle}>{t('account.merge_merge')}</button>
                <button onClick={() => handleMerge('overwrite')} style={ghostBtnStyle}>{t('account.merge_overwrite')}</button>
              </div>
            </div>
          )}

          {status.error && (
            <p style={{ margin: 0, fontSize: '13px', color: '#e74c3c' }}>{t('account.error')}: {status.error}</p>
          )}

          {status.user ? (
            <>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {t('account.logged_in')} <span style={{ fontWeight: 'bold' }}>{status.user}</span>
              </p>
              <button onClick={handleLogout} style={ghostBtnStyle}>{t('account.logout')}</button>
            </>
          ) : (
            <>
              {error && (
                <p style={{ margin: 0, fontSize: '13px', color: '#e74c3c' }}>{t('account.error')}: {error}</p>
              )}
              {letterSent ? (
                <p style={{ margin: 0, fontSize: '14px' }}>{t('account.check_email')}</p>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('account.email_placeholder')}
                    style={inputStyle}
                  />
                  <button onClick={handleSend} disabled={sending || !email.trim()} style={{ ...btnStyle, opacity: sending || !email.trim() ? 0.5 : 1 }}>
                    {sending ? t('account.sending') : t('account.send_link')}
                  </button>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
