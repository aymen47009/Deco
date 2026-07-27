import { useState } from 'react';
import { api } from '../lib/api';
import { Spinner, showToast } from './ui';
import { WORKER_ROLE_LABELS, PROJECT_STATUS_LABELS, type Worker, type Project } from '../types';

type WorkerWithProjects = Worker & { assignedProjects: Project[] };

export function WorkerDashboard({ onExit }: { onExit: () => void }) {
  const [phone, setPhone] = useState('');
  const [worker, setWorker] = useState<WorkerWithProjects | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const w = await api.getWorkerByPhone(phone.trim());
      setWorker(w);
      showToast(`مرحباً ${w.name}`, 'success');
    } catch {
      showToast('رقم الهاتف غير مسجل', 'error');
    } finally { setLoading(false); }
  }

  if (!worker) {
    return (
      <div className="worker-login">
        <div className="worker-login-card">
          <div className="worker-login-logo">D</div>
          <h2>فضاء العامل</h2>
          <p className="worker-login-sub">أدخل رقم هاتفك للدخول</p>
          <form onSubmit={login} className="worker-login-form">
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX"
              dir="ltr"
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? <Spinner /> : 'دخول'}
            </button>
          </form>
          <button className="worker-login-exit" onClick={onExit}>← العودة للموقع</button>
        </div>
      </div>
    );
  }

  const activeProjects = worker.assignedProjects.filter((p) => !['completed', 'cancelled'].includes(p.status));
  const doneProjects = worker.assignedProjects.filter((p) => ['completed', 'cancelled'].includes(p.status));

  return (
    <div className="worker-dash">
      <header className="worker-head">
        <div className="worker-head-info">
          <div className="worker-avatar-lg">{worker.avatar ? <img src={worker.avatar} alt={worker.name} /> : worker.name.charAt(0)}</div>
          <div>
            <h1>{worker.name}</h1>
            <span className="worker-role-tag">{WORKER_ROLE_LABELS[worker.role]}</span>
          </div>
        </div>
        <button className="worker-logout" onClick={() => { setWorker(null); setPhone(''); }}>خروج</button>
      </header>

      <section className="worker-stats">
        <div className="worker-stat">
          <span className="worker-stat-num">{activeProjects.length}</span>
          <span className="worker-stat-label">مشاريع نشطة</span>
        </div>
        <div className="worker-stat">
          <span className="worker-stat-num">{doneProjects.length}</span>
          <span className="worker-stat-label">مشاريع منتهية</span>
        </div>
        <div className="worker-stat">
          <span className="worker-stat-num">{worker.assignedProjects.length}</span>
          <span className="worker-stat-label">إجمالي</span>
        </div>
      </section>

      <section className="worker-section">
        <h2 className="worker-section-title">المشاريع المسندة إليك</h2>
        {worker.assignedProjects.length === 0 ? (
          <div className="worker-empty">لا توجد مشاريع مسندة إليك حالياً</div>
        ) : (
          <div className="worker-projects">
            {worker.assignedProjects.map((p) => (
              <div key={p._id} className={`worker-project-card ${['completed', 'cancelled'].includes(p.status) ? 'is-done' : ''}`}>
                <div className="worker-project-head">
                  <h3>{p.title || p.customer.name}</h3>
                  <span className={`worker-status-badge worker-status-${p.status}`}>{PROJECT_STATUS_LABELS[p.status]}</span>
                </div>
                <div className="worker-project-meta">
                  <span>👤 {p.customer.name}</span>
                  <span>📞 <span dir="ltr">{p.customer.phone}</span></span>
                </div>
                <div className="worker-project-types">{p.workshopTypes.join(' • ')}</div>
                <div className="worker-project-space">المساحة: {p.spaceSize}</div>
                <div className="worker-progress">
                  <div className="worker-progress-bar" style={{ width: `${p.progress}%` }} />
                  <span>{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
