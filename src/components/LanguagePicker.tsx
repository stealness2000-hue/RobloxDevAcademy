import { Languages } from 'lucide-react';
import { LANGUAGES, LANGUAGE_BY_CODE } from '@shared/languages';
import { t } from '@/i18n';

/** Language dropdown: human translations first, then the machine-translated languages (A–Z by English name). */
export function LanguagePicker({ value, onChange, id }: { value: string; onChange: (code: string) => void; id?: string }) {
  const human = LANGUAGES.filter((l) => l.quality === 'human');
  const machine = LANGUAGES.filter((l) => l.quality === 'machine');
  const current = LANGUAGE_BY_CODE.get(value);
  return (
    <div className="col" style={{ gap: 6 }}>
      <div className="row" style={{ gap: 8 }}>
        <Languages size={16} aria-hidden />
        <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)} aria-label={t('Language')} style={{ minWidth: 260 }}>
          <optgroup label={t('Written by people')}>
            {human.map((l) => <option key={l.code} value={l.code}>{l.native}{l.native !== l.name ? ` (${l.name})` : ''}</option>)}
          </optgroup>
          <optgroup label={t('Automatically translated')}>
            {machine.map((l) => <option key={l.code} value={l.code}>{l.native}{l.native !== l.name ? ` (${l.name})` : ''}</option>)}
          </optgroup>
        </select>
      </div>
      {current?.quality === 'machine' && (
        <span className="small muted">
          {t('This language is translated automatically on your own computer by a free, offline translation model. It can make mistakes, especially with technical words. Code always stays in English.')}
        </span>
      )}
    </div>
  );
}
