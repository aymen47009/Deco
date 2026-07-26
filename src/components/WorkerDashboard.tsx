import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, StatusPill, EmptyState, showToast } from './ui';
import {
  PROJECT_STATUS_LABELS,
  WORK_TYPE_LABELS,
  WORKER_ROLE_LABELS,
  WORKER_STATUS_LABELS,
  type Project,
  type Worker,
  type WorkerStatus,
} from '../types';

export function WorkerDashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getWorkers();
        setWorkers(data);
        if (data.length > 0 && !selectedWorkerId) {
          setSelectedWorkerId(data[0]._id);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner label="جاري تحميل لوحة العامل..." />;

  if (workers.length === 0) {
    return <EmptyState title="لا يوجد عمال" message="أضف عمالاً من قسم إدارة العمال لعرض لوحة العامل." />;
  }

  const selectedWorker = workers.find((w) => w._id === selectedWorkerId) ?? workers[0];

  return (
    <div className="worker-dashboard">
      <div className="card worker-selector-card">
        <label>اختر العامل:</label>
        <select value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)}>
          {workers.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name} — {WORKER_ROLE_LABELS[w.role]}
            </option>
          ))}
        </select>
      </div>

      <WorkerPanel worker={selectedWorker} />
    </div>
  );
}

function WorkerPanel({ worker }: { worker: Worker }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (!worker.assignedProjects || worker.assignedProjects.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const allProjects = await api.getProjects();
        const assignedIds = worker.assignedProjects.map((p) => p._id);
        setProjects(allProjects.filter((p) => assignedIds.includes(p._id)));
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [worker._id, worker.assignedProjects]);

  async function updateStatus(status: WorkerStatus) {
    try {
      await api.updateWorkerStatus(worker._id, status);
      showToast('تم تحديث الحالة', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل التحديث';
      showToast(msg, 'error');
    }
  }

  const activeProjects = projects.filter((p) => p.status === 'in_progress' || p.status === 'approved');
  const completedProjects = projects.filter((p) => p.status === 'completed');

  return (
    <>
      <div className="card worker-info-card">
        <div className="worker-info-header">
          <div className="worker-avatar large">
            {worker.avatar ? <img src={worker.avatar} alt={worker.name} /> : worker.name.charAt(0)}
          </div>
          <div className="worker-info-details">
            <h2>{worker.name}</h2>
            <span className="worker-role-tag">{WORKER_ROLE_LABELS[worker.role]}</span>
            {worker.phone && <p>📞 {worker.phone}</p>}
            {worker.email && <p>✉ {worker.email}</p>}
            {worker.skills.length > 0 && (
              <div className="skills">
                {worker.skills.map((s, i) => (
                  <span key={i} className="skill-tag">{s}</span>
                ))}
              </div>
            )}
          </div>
          <div className="worker-status-control">
            <StatusPill status={worker.status} labels={WORKER_STATUS_LABELS} />
            <div className="status-buttons">
              <button
                className={`btn btn-sm ${worker.status === 'available' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => updateStatus('available')}
              >
                متاح
              </button>
              <button
                className={`btn btn-sm ${worker.status === 'busy' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => updateStatus('busy')}
              >
                مشغول
              </button>
              <button
                className={`btn btn-sm ${worker.status === 'offline' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => updateStatus('offline')}
              >
                غير متصل
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="worker-stats">
        <div className="stat-card stat-blue">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{projects.length}</span>
            <span className="stat-label">إجمالي المشاريع</span>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <span className="stat-value">{activeProjects.length}</span>
            <span className="stat-label">مشاريع نشطة</span>
          </div>
        </div>
        <div className="stat-card stat-teal">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{completedProjects.length}</span>
            <span className="stat-label">مشاريع مكتملة</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>المشاريع المسندة</h3>
        {loading ? (
          <Spinner label="جاري التحميل..." />
        ) : projects.length === 0 ? (
          <EmptyState title="لا توجد مشاريع مسندة" message="لم يتم إسناد أي مشاريع لهذا العامل بعد." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>العنوان</th>
                  <th>نوع العمل</th>
                  <th>الحالة</th>
                  <th>التقدم</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p._id}>
                    <td className="mono">{p.code}</td>
                    <td>{p.title}</td>
                    <td>{WORK_TYPE_LABELS[p.workType]}</td>
                    <td><StatusPill status={p.status} labels={PROJECT_STATUS_LABELS} /></td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                        <span>{p.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
