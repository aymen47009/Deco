import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, ConfirmDialog, EmptyState, showToast } from './ui';
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES, type Project, type ProjectStatus } from '../types';

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [filter, setFilter] = useState('');

  async function load() {
    setLoading(true);
    try { setProjects(await api.getProjects(filter || undefined)); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filter]);

  async function handleStatus(id: string, status: ProjectStatus) {
    try { await api.updateProjectStatus(id, status); showToast('تم تحديث الحالة', 'success'); load(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  async function handleProgress(id: string, progress: number) {
    try { await api.updateProjectProgress(id, progress); load(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try { await api.deleteProject(confirmDelete._id); showToast('تم الحذف', 'success'); setConfirmDelete(null); load(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  if (loading) return <Spinner label="جاري التحميل..." />;

  return (
    <div className="mgr-section">
      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">كل الحالات</option>
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
        </select>
        <span className="toolbar-count">{projects.length} مشروع</span>
      </div>
      {projects.length === 0 ? (
        <EmptyState title="لا توجد مشاريع" message="ستظهر هنا الطلبات المرسلة من الزبائن" />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr><th>الاسم</th><th>الهاتف</th><th>أنواع العمل</th><th>المساحة</th><th>الحالة</th><th>التقدم</th><th></th></tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id}>
                  <td className="td-strong">{p.customer.name}</td>
                  <td dir="ltr">{p.customer.phone}</td>
                  <td>{p.workshopTypes.join('، ')}</td>
                  <td>{p.spaceSize}</td>
                  <td>
                    <select className="status-select" value={p.status} onChange={(e) => handleStatus(p._id, e.target.value as ProjectStatus)}>
                      {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="progress-cell">
                      <input type="range" min={0} max={100} value={p.progress} onChange={(e) => handleProgress(p._id, Number(e.target.value))} />
                      <span>{p.progress}%</span>
                    </div>
                  </td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(p)}>حذف</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={!!confirmDelete} title="حذف" message={`حذف طلب "${confirmDelete?.customer.name}"؟`} confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
