import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, StatusPill, EmptyState, showToast, ConfirmDialog } from './ui';
import {
  PROJECT_STATUS_LABELS,
  WORK_TYPE_LABELS,
  PROJECT_STATUSES,
  type Project,
  type ProjectStatus,
} from '../types';

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProjects({ status: statusFilter, search });
      setProjects(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل تحميل المشاريع';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter, search]);

  async function handleStatusChange(project: Project, status: ProjectStatus) {
    try {
      await api.updateProjectStatus(project._id, status);
      showToast('تم تحديث الحالة', 'success');
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل تحديث الحالة';
      showToast(msg, 'error');
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await api.deleteProject(confirmDelete._id);
      showToast('تم حذف المشروع', 'success');
      setConfirmDelete(null);
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الحذف';
      showToast(msg, 'error');
    }
  }

  if (loading) return <Spinner label="جاري تحميل المشاريع..." />;
  if (error) return <EmptyState title="حدث خطأ" message={error} />;

  return (
    <div className="list-section">
      <div className="list-toolbar">
        <input
          className="search-input"
          placeholder="ابحث بالكود أو الاسم أو الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">كل الحالات</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PROJECT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {projects.length === 0 ? (
        <EmptyState title="لا توجد مشاريع" message="لم يتم إنشاء أي مشاريع بعد." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>العنوان</th>
                <th>العميل</th>
                <th>نوع العمل</th>
                <th>الحالة</th>
                <th>التقدم</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id}>
                  <td className="mono">{p.code}</td>
                  <td>{p.title}</td>
                  <td>{p.customer.name}</td>
                  <td>{WORK_TYPE_LABELS[p.workType]}</td>
                  <td>
                    <StatusPill status={p.status} labels={PROJECT_STATUS_LABELS} />
                  </td>
                  <td>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                      <span>{p.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-sm" onClick={() => setSelected(p)}>
                      تفاصيل
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(p)}>
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <ProjectDetail project={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />}

      <ConfirmDialog
        open={!!confirmDelete}
        title="حذف المشروع"
        message={`هل تريد حذف "${confirmDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function ProjectDetail({
  project,
  onClose,
  onStatusChange,
}: {
  project: Project;
  onClose: () => void;
  onStatusChange: (p: Project, s: ProjectStatus) => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{project.title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">الكود</span>
              <span className="detail-value mono">{project.code}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">الحالة</span>
              <StatusPill status={project.status} labels={PROJECT_STATUS_LABELS} />
            </div>
            <div className="detail-item">
              <span className="detail-label">نوع العمل</span>
              <span className="detail-value">{WORK_TYPE_LABELS[project.workType]}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">الميزانية</span>
              <span className="detail-value">{project.budget} د.أ</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">العميل</span>
              <span className="detail-value">{project.customer.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">الهاتف</span>
              <span className="detail-value">{project.customer.phone}</span>
            </div>
            {project.customer.email && (
              <div className="detail-item">
                <span className="detail-label">البريد</span>
                <span className="detail-value">{project.customer.email}</span>
              </div>
            )}
            {project.customer.address && (
              <div className="detail-item">
                <span className="detail-label">العنوان</span>
                <span className="detail-value">{project.customer.address}</span>
              </div>
            )}
          </div>

          {project.description && (
            <div className="detail-section">
              <h4>الوصف</h4>
              <p>{project.description}</p>
            </div>
          )}

          {project.assignedWorkers.length > 0 && (
            <div className="detail-section">
              <h4>العمال المعينون</h4>
              <ul className="worker-list">
                {project.assignedWorkers.map((w) => (
                  <li key={w._id}>
                    {w.name} — {w.role}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.images.length > 0 && (
            <div className="detail-section">
              <h4>الصور</h4>
              <div className="image-grid">
                {project.images.map((img, i) => (
                  <img key={i} src={img.url} alt={`صورة ${i + 1}`} />
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h4>تغيير الحالة</h4>
            <div className="status-buttons">
              {PROJECT_STATUSES.map((s) => (
                <button
                  key={s}
                  className={`btn btn-sm ${project.status === s ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => onStatusChange(project, s)}
                >
                  {PROJECT_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
