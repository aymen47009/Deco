import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, ConfirmDialog, EmptyState, showToast, Modal } from './ui';
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES, type Project, type ProjectStatus } from '../types';

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  async function load() {
    setLoading(true);
    try { setProjects(await api.getProjects(filterStatus || undefined)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterStatus]);

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
    <div className="admin-section">
      <div className="list-toolbar">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">كل الحالات</option>
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      {projects.length === 0 ? (
        <EmptyState title="لا توجد مشاريع" message="ستظهر هنا الطلبات المرسلة من الزبائن" />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>الاسم</th><th>الهاتف</th><th>أنواع العمل</th><th>المساحة</th><th>الحالة</th><th>التقدم</th><th>إجراءات</th></tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id}>
                  <td>{p.customer}</td>
                  <td>{p.phone}</td>
                  <td>{p.workshopTypes.join('، ')}</td>
                  <td>{p.spaceSize}</td>
                  <td>
                    <select className="status-select" value={p.status} onChange={(e) => handleStatus(p._id, e.target.value as ProjectStatus)}>
                      {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="range" min={0} max={100} value={p.progress} onChange={(e) => handleProgress(p._id, Number(e.target.value))} />
                    <span className="progress-val">{p.progress}%</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(p)}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={!!confirmDelete} title="حذف" message={`حذف طلب "${confirmDelete?.customer}"؟`} confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
