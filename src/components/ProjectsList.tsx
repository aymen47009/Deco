import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, ConfirmDialog, EmptyState, showToast, Modal } from './ui';
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES, WORKSHOP_TYPES, SPACE_SIZES, type Project, type ProjectInput, type ProjectStatus } from '../types';

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
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
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ مشروع جديد</button>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">كل الحالات</option>
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      {projects.length === 0 ? (
        <EmptyState title="لا توجد مشاريع" message="أضف مشروعاً جديداً للبدء" />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>العنوان</th><th>الزبون</th><th>الهاتف</th><th>النوع</th><th>الحالة</th><th>التقدم</th><th>إجراءات</th></tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id}>
                  <td>{p.title}</td>
                  <td>{p.customer}</td>
                  <td>{p.phone}</td>
                  <td>{p.workshopType}</td>
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
                    <button className="btn btn-sm" onClick={() => { setEditing(p); setShowForm(true); }}>تعديل</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(p)}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={showForm} title={editing ? 'تعديل مشروع' : 'مشروع جديد'} onClose={() => setShowForm(false)}>
        <ProjectForm project={editing} onDone={() => { setShowForm(false); load(); }} />
      </Modal>
      <ConfirmDialog open={!!confirmDelete} title="حذف" message={`حذف "${confirmDelete?.title}"؟`} confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

function ProjectForm({ project, onDone }: { project: Project | null; onDone: () => void }) {
  const [form, setForm] = useState<ProjectInput>({
    title: project?.title ?? '',
    customer: project?.customer ?? '',
    phone: project?.phone ?? '',
    workshopType: project?.workshopType ?? '',
    spaceSize: project?.spaceSize ?? '',
    budget: project?.budget ?? undefined,
    description: project?.description ?? '',
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      if (project) { await api.updateProject(project._id, form); showToast('تم التحديث', 'success'); }
      else { await api.createProject(form); showToast('تمت الإضافة', 'success'); }
      onDone();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="form-field form-field-full"><label>عنوان المشروع *</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div className="form-field"><label>اسم الزبون *</label><input required value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} /></div>
      <div className="form-field"><label>الهاتف *</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      <div className="form-field"><label>نوع العمل *</label>
        <select required value={form.workshopType} onChange={(e) => setForm({ ...form, workshopType: e.target.value })}>
          <option value="" disabled>اختر</option>
          {WORKSHOP_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>
      <div className="form-field"><label>المساحة</label>
        <select value={form.spaceSize} onChange={(e) => setForm({ ...form, spaceSize: e.target.value })}>
          <option value="">اختر</option>
          {SPACE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="form-field"><label>الميزانية</label><input type="number" value={form.budget ?? ''} onChange={(e) => setForm({ ...form, budget: e.target.value ? Number(e.target.value) : undefined })} /></div>
      <div className="form-field form-field-full"><label>الوصف</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '...' : 'حفظ'}</button></div>
    </form>
  );
}
