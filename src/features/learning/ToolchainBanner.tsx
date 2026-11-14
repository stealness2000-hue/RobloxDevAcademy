import { useEffect, useState } from 'react';
import { CheckCircle2, Download, RefreshCw, Wrench } from 'lucide-react';
import { call } from '@/api';

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
        <CheckCircle2 size={14} /> {language === 'java' ? 'Java' : 'C++-compiler'} gevonden: <span className="mono">{tc.version}</span>
      </div>
    );
  }
  return (
    <div className="card toolchain missing">
      <div className="row" style={{ gap: 10 }}>
        <Wrench size={18} />
        <strong className="grow">{language === 'java' ? 'Installeer eerst Java (gratis)' : 'Installeer eerst een C++-compiler (gratis)'}</strong>
        <button className="btn sm" onClick={() => void check(true)} disabled={busy}><RefreshCw size={13} className={busy ? 'spin' : ''} /> Opnieuw zoeken</button>
      </div>
      {language === 'java' ? (
        <ol className="prose" style={{ fontSize: 14, marginTop: 8 }}>
          <li>Ga naar adoptium.net en download <strong>Temurin JDK 21 (LTS)</strong> voor Windows x64, het <strong>.msi</strong>-bestand.</li>
          <li>Installeer het. Zet in het installatiescherm <strong>Set JAVA_HOME variable</strong> aan.</li>
          <li>Herstart de Academy en klik op <strong>Opnieuw zoeken</strong>.</li>
        </ol>
      ) : (
        <ol className="prose" style={{ fontSize: 14, marginTop: 8 }}>
          <li>Ga naar msys2.org en installeer <strong>MSYS2</strong> (standaardmap <code>C:\msys64</code>).</li>
          <li>Open daarna <strong>MSYS2 UCRT64</strong> uit het Startmenu en typ: <code>pacman -S mingw-w64-ucrt-x86_64-gcc</code> en druk op Enter (bevestig met Y).</li>
          <li>Klik hier op <strong>Opnieuw zoeken</strong>. De Academy vindt g++ automatisch in <code>C:\msys64\ucrt64\bin</code>.</li>
        </ol>
      )}
      <div className="row" style={{ marginTop: 6 }}>
        <button className="btn sm ghost" onClick={() => void call('app:openExternal', language === 'java' ? 'https://adoptium.net/' : 'https://www.msys2.org/')}><Download size={13} /> Officiële downloadpagina</button>
        <span className="small faint">Je kunt de uitleg en vragen al wel doen; alleen Run Code heeft dit nodig.</span>
      </div>
    </div>
  );
}
