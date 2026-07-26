import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, EmptyState, showToast } from './ui';
import { PROJECT_STATUS_LABELS, WORKER_ROLE_LABELS, type Project, type Worker } from '../types';

interface Props {
  workerId: string;
  onExit: () => void;
}

export function WorkerDashboard({ workerId, onExit }: Props) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const w = await api.getWorker(workerId);
        setWorker(w);
        setProjects(w.assignedProjects ?? []);
      } catch (e) { showToast('فشل تحميل البيانات', 'error'); }
      finally { setLoading(false); }
    })();
  }, [workerId]);

  if (loading) return <div className="page-loading"><Spinner label="جاري التحميل..." /></div>;
  if (!worker) return <EmptyState title="العامل غير موجود" />;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="worker-avatar large">{worker.avatar ? <img src={worker.avatar} alt={worker.name} /> : worker.name.charAt(0)}</div>
          <div>
            <span className="sidebar-name">{worker.name}</span>
            <span className="worker-role">{WORKER_ROLE_LABELS[worker.role]}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className="active">مشاريعي ({projects.length})</button>
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-role-btn" onClick={onExit}>← خروج</button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header"><h1>مشاريعي</h1></header>
        <div className="admin-content">
          {projects.length === 0 ? (
            <EmptyState title="لا توجد مشاريع مخصصة لك" message="سيظهر هنا المشاريع التي تخصك" />
          ) : (
            <div className="cards-grid">
              {projects.map((p) => (
                <div key={p._id} className="card item-card">
                  <span className={`pill pill-${p.status}`}>{PROJECT_STATUS_LABELS[p.status]}</span>
                  <h3>{p.title}</h3>
                  <p>الزبون: {p.customer}</p>
                  <p>النوع: {p.workshopType}</p>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{ width: `${p.progress}%` }} />
                    <span>{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
