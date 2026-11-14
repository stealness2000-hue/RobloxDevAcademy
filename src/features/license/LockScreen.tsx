import { ArrowLeft, Lock } from 'lucide-react';
import { useApp } from '@/store';
import { t } from '@/i18n';
import { LicensePanel } from './LicensePanel';

/** Shown instead of a lesson that is part of the paid full course. */
export function LockScreen({ title }: { title: string }) {
  const navigate = useApp((s) => s.navigate);
  return (
    <div className="page">
      <div className="lesson-top">
        <button className="btn ghost sm" onClick={() => navigate('learn')}><ArrowLeft size={14} /> {t('Courses')}</button>
      </div>
      <div className="card lock-card">
        <div className="lock-icon"><Lock size={26} /></div>
        <h1>{title}</h1>
        <p className="muted">{t('This lesson is part of the full course. You already finished the free part — great job! Unlock everything to keep going.')}</p>
        <div className="card" style={{ textAlign: 'left', marginTop: 16 }}>
          <LicensePanel compact />
        </div>
      </div>
    </div>
  );
}
