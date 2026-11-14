import { Languages, Loader2 } from 'lucide-react';
import { useApp } from '@/store';
import { t } from '@/i18n';

/** Honest label shown above machine-translated content. */
export function MachineBadge({ loading, missing }: { loading: boolean; missing: number }) {
  const navigate = useApp((s) => s.navigate);
  return (
    <div className="machine-badge small">
      {loading ? <Loader2 size={13} className="spin" /> : <Languages size={13} />}
      <span>
        {loading ? t('Translating…') : missing > 0 ? t('Shown in English: the free translator is not installed yet.') : t('Automatically translated. It can contain mistakes; code stays in English.')}
      </span>
      {!loading && missing > 0 && (
        <button className="btn ghost sm" onClick={() => navigate('settings', { section: 'language' })}>{t('Install')}</button>
      )}
    </div>
  );
}
