import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, showToast } from './ui';
import type { ClientTrackingData } from '../types';

const STAGE_ICONS: Record<string, string> = {
  preparing: '📦',
  in_progress: '🔨',
  finishing: '✨',
  completed: '✅',
};

export function ClientTrackingPage({ token, onExit }: { token: string; onExit: () => void }) {
  const [data, setData] = useState<ClientTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const d = await api.getClientTracking(token);
        setData(d);
      } catch {
        setError('لم يتم العثور على المشروع. تأكد من صحة الرابط.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return <div className="page-loading"><Spinner label="جاري تحميل بيانات المشروع..." /></div>;
  if (error || !data) return (
    <div className="page-loading">
      <div className="track-error-card">
        <div className="track-error-icon">🔍</div>
        <h2>{error || 'خطأ'}</h2>
        <button className="btn btn-ghost" onClick={onExit}>العودة للموقع</button>
      </div>
    </div>
  );

  const currentOrder = data.currentStage.order;
  const paidPercent = data.totalAgreedAmount > 0 ? Math.round((data.totalPaid / data.totalAgreedAmount) * 100) : 0;

  return (
    <div className="track-page">
      <header className="track-header">
        <div className="track-header-inner">
          <div className="track-brand">
            <span className="track-logo">D</span>
            <span className="track-brand-name">ديكو ورشات</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onExit}>← الموقع</button>
        </div>
      </header>

      <main className="track-main">
        <div className="track-hero">
          <span className="track-code">{data.code}</span>
          <h1>{data.title}</h1>
          <p className="track-subtitle">{data.workshopTypes.join(' • ')} — {data.spaceSize}</p>
        </div>

        <section className="track-timeline-section">
          <h2 className="track-section-title">مراحل المشروع</h2>
          <div className="track-timeline">
            {data.stages.map((s) => {
              const done = s.order < currentOrder;
              const active = s.order === currentOrder;
              return (
                <div key={s.key} className={`track-stage ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                  <div className="track-stage-dot">
                    {done ? '✓' : STAGE_ICONS[s.key]}
                  </div>
                  <span className="track-stage-label">{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="track-progress-bar-wrap">
            <div className="track-progress-bar" style={{ width: `${data.progress}%` }} />
            <span>{data.progress}%</span>
          </div>
        </section>

        <section className="track-fin-section">
          <h2 className="track-section-title">الكشف المالي</h2>
          <div className="track-fin-card">
            <div className="track-fin-row">
              <span>المبلغ المتفق عليه</span>
              <strong>{data.totalAgreedAmount.toLocaleString()} دج</strong>
            </div>
            <div className="track-fin-row track-fin-paid">
              <span>المبالغ المسددة</span>
              <strong>{data.totalPaid.toLocaleString()} دج</strong>
            </div>
            <div className="track-fin-row track-fin-remaining">
              <span>المبلغ المتبقي</span>
              <strong>{data.remaining.toLocaleString()} دج</strong>
            </div>
            <div className="track-fin-progress">
              <div className="track-fin-progress-bar" style={{ width: `${paidPercent}%` }} />
              <span>{paidPercent}% مسدد</span>
            </div>
          </div>
        </section>

        <section className="track-gallery-section">
          <h2 className="track-section-title">معرض الإنجاز</h2>
          {data.media.length === 0 ? (
            <div className="track-gallery-empty">لا توجد صور متاحة حالياً</div>
          ) : (
            <div className="track-gallery-grid">
              {data.media.map((m, i) => (
                <div key={i} className="track-gallery-tile" onClick={() => setLightbox(m.url)}>
                  <img src={m.url} alt="" />
                  <span className="track-gallery-stage">
                    {m.stage === 'before' ? 'قبل' : m.stage === 'during' ? 'أثناء' : 'بعد'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close">×</button>
          <img src={lightbox} alt="" />
        </div>
      )}
    </div>
  );
}
