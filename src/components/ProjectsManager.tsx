import { useState } from 'react';
import { db } from '../lib/db';
import { showToast, ConfirmDialog, EmptyState, Spinner } from './ui';
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES, type Project } from '../types';

interface Props { projects: Project[]; loading: boolean; onChanged: () => void; }

export function ProjectsManager({ projects, loading, onChanged }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

  async function handleStatus(id: string, status: string) {
    try { await db.updateProjectStatus(id, status); showToast('تم تحديث الحالة', 'success'); onChanged(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try { await db.deleteProject(confirmDelete.id); showToast('تم الحذف', 'success'); setConfirmDelete(null); onChanged(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  if (loading) return <Spinner label="جاري التحميل..." />;

  return (
    <div className="admin-section">
      {projects.length === 0 ? (
        <EmptyState title="لا توجد طلبات بعد" message="ستظهر هنا الطلبات الواردة من نموذج الطلب" />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>الكود</th><th>الاسم</th><th>الهاتف</th><th>نوع العمل</th><th>المساحة</th><th>الحالة</th><th>التاريخ</th><th>إجراءات</th></tr></thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="mono">{p.code}</td>
                  <td>{p.name}</td>
                  <td>{p.phone}</td>
                  <td>{p.workshop_type}</td>
                  <td>{p.space_size ?? '—'}</td>
                  <td><select value={p.status} onChange={(e) => handleStatus(p.id, e.target.value)}>{PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}</select></td>
                  <td>{new Date(p.created_at).toLocaleDateString('ar')}</td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(p)}>حذف</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={!!confirmDelete} title="حذف" message={`حذف طلب "${confirmDelete?.name}"؟`} confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
