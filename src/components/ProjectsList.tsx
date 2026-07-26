import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, EmptyState, showToast, ConfirmDialog } from './ui';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  type Project,
  type ProjectStatus,
} from '../types';

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getProjects({ status: statusFilter, search });
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter, search]);

  async function handleStatusChange(id: string, status: ProjectStatus) {
    try {
      await api.updateProjectStatus(id, status);
      showToast('تم تحديث الحالة', 'success');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'فشل', 'error');
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await api.deleteProject(confirmDelete._id);
      showToast('تم الحذف', 'success');
      setConfirmDelete(null);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'فشل', 'error');
    }
  }

  if (loading) return <Spinner label="جاري التحميل..." />;

  return (
    <div className="admin-section">
      <div className="list-toolbar">
        <input className="search-input" placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">كل الحالات</option>
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      {projects.length === 0 ? (
        <EmptyState title="لا توجد مشاريع" />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>الكود</th><th>العنوان</th><th>العميل</th><th>الهاتف</th><th>الحالة</th><th>إجراءات</th></tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id}>
                  <td className="mono">{p.code}</td>
                  <td>{p.title}</td>
                  <td>{p.customer.name}</td>
                  <td>{p.customer.phone}</td>
                  <td>
                    <select value={p.status} onChange={(e) => handleStatusChange(p._id, e.target.value as ProjectStatus)}>
                      {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(p)}>حذف</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={!!confirmDelete} title="حذف" message={`حذف "${confirmDelete?.title}"؟`} confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
