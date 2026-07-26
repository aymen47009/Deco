import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, EmptyState } from './ui';
import { PROJECT_STATUS_LABELS, WORKER_STATUS_LABELS, type Project, type Worker, type Material } from '../types';

export function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, w, m] = await Promise.all([api.getProjects(), api.getWorkers(), api.getMaterials()]);
        setProjects(p); setWorkers(w); setMaterials(m);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <Spinner label="جاري التحميل..." />;

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat-card stat-blue"><div className="stat-icon">📋</div><div className="stat-info"><span className="stat-value">{projects.length}</span><span className="stat-label">إجمالي المشاريع</span></div></div>
        <div className="stat-card stat-green"><div className="stat-icon">🔧</div><div className="stat-info"><span className="stat-value">{projects.filter((p) => p.status === 'in_progress').length}</span><span className="stat-label">قيد التنفيذ</span></div></div>
        <div className="stat-card stat-teal"><div className="stat-icon">✅</div><div className="stat-info"><span className="stat-value">{projects.filter((p) => p.status === 'completed').length}</span><span className="stat-label">مكتملة</span></div></div>
        <div className="stat-card stat-amber"><div className="stat-icon">👷</div><div className="stat-info"><span className="stat-value">{workers.filter((w) => w.status === 'available').length}</span><span className="stat-label">عمال متاحون</span></div></div>
        <div className="stat-card stat-red"><div className="stat-icon">⚠</div><div className="stat-info"><span className="stat-value">{materials.filter((m) => m.lowStock).length}</span><span className="stat-label">مخزون منخفض</span></div></div>
      </div>
      <div className="card">
        <h3>أحدث المشاريع</h3>
        {projects.length === 0 ? <EmptyState title="لا توجد مشاريع" /> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>الكود</th><th>العنوان</th><th>العميل</th><th>الحالة</th></tr></thead>
              <tbody>
                {projects.slice(0, 10).map((p) => (
                  <tr key={p._id}><td className="mono">{p.code}</td><td>{p.title}</td><td>{p.customer.name}</td><td><span className={`pill pill-${p.status}`}>{PROJECT_STATUS_LABELS[p.status]}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
