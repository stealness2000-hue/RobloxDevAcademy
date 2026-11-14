import { useEffect, useState } from 'react';
import { CheckCircle2, Download, RefreshCw, Wrench } from 'lucide-react';
import { call } from '@/api';
import { t } from '@/i18n';
import { inline } from '@/components/ui';

type TC = { available: boolean; version: string | null; command: string | null };

/** Shows whether the official toolchain (JDK or g++) is installed, with free install instructions if not. */
export function ToolchainBanner({ language }: { language: 'cpp' | 'java' }) {
  const [tc, setTc] = useState<TC | null>(null);
  const [busy, setBusy] = useState(false);
  const check = async (refresh: boolean) => {
    setBusy(true);
    try {
      setTc(await call('code:toolchain', { language, refresh }));
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    void check(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  if (!tc) return null;
  if (tc.available) {
    return (
      <div className="toolchain ok small">
        <CheckCircle2 size={14} /> {language === 'java' ? t('Java found:') : t('C++ compiler found:')} <span className="mono">{tc.version}</span>
      </div>
    );
  }
  return (
    <div className="card toolchain missing">
      <div className="row" style={{ gap: 10 }}>
        <Wrench size={18} />
        <strong className="grow">{language === 'java' ? t('First install Java (free)') : t('First install a C++ compiler (free)')}</strong>
        <button className="btn sm" onClick={() => void check(true)} disabled={busy}><RefreshCw size={13} className={busy ? 'spin' : ''} /> {t('Search again')}</button>
      </div>
      {language === 'java' ? (
        <ol className="prose" style={{ fontSize: 14, marginTop: 8 }}>
          <li>{inline(t('Go to adoptium.net and download **Temurin JDK 21 (LTS)** for Windows x64, the **.msi** file.'))}</li>
          <li>{inline(t('Install it. In the installer, turn on **Set JAVA_HOME variable**.'))}</li>
          <li>{inline(t('Restart the Academy and click **Search again**.'))}</li>
        </ol>
      ) : (
        <ol className="prose" style={{ fontSize: 14, marginTop: 8 }}>
          <li>{inline(t('Go to msys2.org and install **MSYS2** (default folder `{dir}`).', { dir: 'C:\\msys64' }))}</li>
          <li>{inline(t('Then open **MSYS2 UCRT64** from the Start menu, type `{cmd}` and press Enter (confirm with Y).', { cmd: 'pacman -S mingw-w64-ucrt-x86_64-gcc' }))}</li>
          <li>{inline(t('Click **Search again** here. The Academy finds g++ automatically in `{dir}`.', { dir: 'C:\\msys64\\ucrt64\\bin' }))}</li>
        </ol>
      )}
      <div className="row" style={{ marginTop: 6 }}>
        <button className="btn sm ghost" onClick={() => void call('app:openExternal', language === 'java' ? 'https://adoptium.net/' : 'https://www.msys2.org/')}><Download size={13} /> {t('Official download page')}</button>
        <span className="small faint">{t('You can already do the explanations and questions; only Run Code needs this.')}</span>
      </div>
    </div>
  );
}
