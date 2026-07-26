import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, EmptyState, showToast } from './ui';
import { WORKER_ROLE_LABELS, WORKER_STATUS_LABELS, WORKER_ROLES, type Worker, type WorkerStatus } from '../types';

export function WorkerDashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getWorkers();
        setWorkers(data);
        if (data.length > 0) setSelectedId(data[0]._id);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  async function updateStatus(id: string, status: WorkerStatus) {
    try { await api.updateWorkerStatus(id, status); showToast('تم التحديث', 'success'); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  if (loading) return <Spinner label="جاري التحميل..." />;
  if (workers.length === 0) return <EmptyState title="لا يوجد عمال" />;

  const worker = workers.find((w) => w._id === selectedId) ?? workers[0];

  return (
    <div className="worker-dashboard">
      <div className="card">
        <label>اختر العامل: </label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {workers.map((w) => <option key={w._id} value={w._id}>{w.name} — {WORKER_ROLE_LABELS[w.role]}</option>)}
        </select>
      </div>
      <div className="card worker-info-card">
        <div className="worker-info-header">
          <div className="worker-avatar large">{worker.name.charAt(0)}</div>
          <div className="worker-info-details">
            <h2>{worker.name}</h2>
            <span className="worker-role-tag">{WORKER_ROLE_LABELS[worker.role]}</span>
            <p>📞 {worker.phone || '—'}</p>
            <p>المشاريع: {worker.assignedProjects.length}</p>
          </div>
          <div className="worker-status-control">
            <span className={`pill pill-${worker.status}`}>{WORKER_STATUS_LABELS[worker.status]}</span>
            <select onChange={(e) => updateStatus(worker._id, e.target.value as WorkerStatus)} value={worker.status}>
              {['available', 'busy', 'offline'].map((s) => <option key={s} value={s}>{WORKER_STATUS_LABELS[s as WorkerStatus]}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>المشاريع المسندة</h3>
        {worker.assignedProjects.length === 0 ? <EmptyState title="لا توجد مشاريع" /> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>الكود</th><th>العنوان</th><th>الحالة</th></tr></thead>
              <tbody>
                {worker.assignedProjects.map((p) => (
                  <tr key={p._id}><td className="mono">{p.code}</td><td>{p.title}</td><td><span className={`pill pill-${p.status}`}>{p.status}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
