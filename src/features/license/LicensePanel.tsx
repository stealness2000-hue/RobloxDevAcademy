import { useState } from 'react';
import { CheckCircle2, Crown, ExternalLink, KeyRound, Loader2 } from 'lucide-react';
import { useApp } from '@/store';
import { call } from '@/api';
import { t } from '@/i18n';

const cleanError = (e: unknown) => String((e as Error)?.message ?? e).replace(/^Error invoking remote method '[^']+': (Error: )?/, '');

/** Buy link + license key entry. Used on the lock screen and in Settings. */
export function LicensePanel({ compact = false }: { compact?: boolean }) {
  const { license, refreshLicense, toast } = useApp();
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function activate() {
    setBusy(true);
    setError(null);
    try {
      await call('license:activate', key);
      await refreshLicense();
      setKey('');
      toast({ kind: 'success', title: t('Full course unlocked!'), body: t('Thank you for your support. Every course is now open.') });
    } catch (e) {
      setError(cleanError(e));
    } finally {
      setBusy(false);
    }
  }

  if (license?.unlocked) {
    return (
      <div className="row" style={{ gap: 10 }}>
        <CheckCircle2 size={18} className="ok-icon" />
        <div className="grow">
          <strong>{t('Full course unlocked')}</strong>
          <div className="small muted">{t('License key ending in {hint}. Works offline.', { hint: license.keyHint ?? '????' })}</div>
        </div>
        {!compact && (
          <button className="btn ghost sm" onClick={async () => { await call('license:deactivate'); await refreshLicense(); }}>{t('Remove key from this computer')}</button>
        )}
      </div>
    );
  }

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 10 }}>
        <Crown size={20} style={{ color: '#e8b75a' }} />
        <div className="grow">
          <strong>{t('Full course: {price}, one-time', { price: license?.price ?? '$9.99' })}</strong>
          <div className="small muted">{t('All courses, including every future course. No subscription.')}</div>
        </div>
        <button className="btn primary" onClick={() => license && void call('app:openExternal', license.buyUrl)}>
          {t('Buy')} <ExternalLink size={13} />
        </button>
      </div>
      <div className="small muted">{t('After buying you get a license key (by email from Gumroad, or from the Lumora Discord bot). Paste it here:')}</div>
      <div className="row" style={{ gap: 8 }}>
        <KeyRound size={16} aria-hidden />
        <input className="input mono grow" value={key} onChange={(e) => setKey(e.target.value)} placeholder="LUMORA1-…  /  XXXXXXXX-XXXXXXXX-…" aria-label={t('License key')} spellCheck={false}
          onKeyDown={(e) => e.key === 'Enter' && key.trim() && void activate()} />
        <button className="btn" disabled={!key.trim() || busy} onClick={activate}>{busy ? <Loader2 size={14} className="spin" /> : null} {t('Activate')}</button>
      </div>
      {error && <div className="feedback bad small"><div>{error}</div></div>}
      {license && !license.sellingConfigured && (
        <div className="small faint">{t('Note: key checking is not set up in this build yet.')}</div>
      )}
      <div className="small faint">{t('Lumora bot keys are checked offline. Gumroad keys need internet once. After that the full course always works offline.')}</div>
    </div>
  );
}
