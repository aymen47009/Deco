import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, EmptyState, showToast, Modal, ConfirmDialog } from './ui';
import {
  WORKER_ROLE_LABELS,
  WORKER_STATUS_LABELS,
  WORKER_ROLES,
  WORKER_STATUSES,
  type Worker,
  type WorkerInput,
  type WorkerStatus,
} from '../types';

export function WorkersList() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Worker | null>(null);

  async function load() {
    setLoading(true);
    try {
      setWorkers(await api.getWorkers());
    } catch { setWorkers([]); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!confirmDelete) return;
    try { await api.deleteWorker(confirmDelete._id); showToast('تم الحذف', 'success'); setConfirmDelete(null); load(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  if (loading) return <Spinner label="جاري التحميل..." />;

  return (
    <div className="admin-section">
      <div className="list-toolbar">
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ إضافة عامل</button>
      </div>
      {workers.length === 0 ? <EmptyState title="لا يوجد عمال" /> : (
        <div className="cards-grid">
          {workers.map((w) => (
            <div key={w._id} className="worker-card card">
              <div className="worker-card-header">
                <div className="worker-avatar">{w.name.charAt(0)}</div>
                <div><h3>{w.name}</h3><span className="worker-role">{WORKER_ROLE_LABELS[w.role]}</span></div>
              </div>
              <p>📞 {w.phone || '—'}</p>
              <p>المشاريع: {w.assignedProjects.length}</p>
              <span className={`pill pill-${w.status}`}>{WORKER_STATUS_LABELS[w.status]}</span>
              <div className="worker-card-actions">
                <button className="btn btn-sm" onClick={() => { setEditing(w); setShowForm(true); }}>تعديل</button>
                <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(w)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={showForm} title={editing ? 'تعديل عامل' : 'إضافة عامل'} onClose={() => setShowForm(false)}>
        <WorkerForm worker={editing} onDone={() => { setShowForm(false); load(); }} />
      </Modal>
      <ConfirmDialog open={!!confirmDelete} title="حذف" message={`حذف "${confirmDelete?.name}"؟`} confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

function WorkerForm({ worker, onDone }: { worker: Worker | null; onDone: () => void }) {
  const [form, setForm] = useState<WorkerInput>({
    name: worker?.name ?? '', phone: worker?.phone ?? '', role: worker?.role ?? 'general',
    status: worker?.status ?? 'available', dailyRate: worker?.dailyRate ?? 0,
  skills: worker?.skills ?? [],
  });
  const [skillsText, setSkillsText] = useState((worker?.skills ?? []).join(', '));
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean) };
      if (worker) { await api.updateWorker(worker._id, data); showToast('تم التحديث', 'success'); }
      else { await api.createWorker(data); showToast('تمت الإضافة', 'success'); }
      onDone();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="form-field"><label>الاسم *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div className="form-field"><label>الهاتف</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      <div className="form-field"><label>التخصص</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as WorkerInput['role'] })}>{WORKER_ROLES.map((r) => <option key={r} value={r}>{WORKER_ROLE_LABELS[r]}</option>)}</select></div>
      <div className="form-field"><label>الحالة</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as WorkerStatus })}>{WORKER_STATUSES.map((s) => <option key={s} value={s}>{WORKER_STATUS_LABELS[s]}</option>)}</select></div>
      <div className="form-field"><label>الأجر اليومي</label><input type="number" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: Number(e.target.value) })} /></div>
      <div className="form-field form-field-full"><label>المهارات (افصل بفاصلة)</label><input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} /></div>
      <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'حفظ'}</button></div>
    </form>
  );
}
