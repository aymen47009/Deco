import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, ConfirmDialog, EmptyState, showToast, Modal } from './ui';
import { WORKER_ROLE_LABELS, WORKER_ROLES, WORKER_STATUS_LABELS, WORKER_STATUSES, type Worker, type WorkerInput, type WorkerStatus } from '../types';

export function WorkersManager() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Worker | null>(null);
  const [filterRole, setFilterRole] = useState('');

  async function load() {
    setLoading(true);
    try { setWorkers(await api.getWorkers(filterRole ? { role: filterRole } : undefined)); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterRole]);

  async function handleStatus(id: string, status: WorkerStatus) {
    try { await api.updateWorkerStatus(id, status); showToast('تم التحديث', 'success'); load(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try { await api.deleteWorker(confirmDelete._id); showToast('تم الحذف', 'success'); setConfirmDelete(null); load(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  if (loading) return <Spinner label="جاري التحميل..." />;

  return (
    <div className="mgr-section">
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ عامل جديد</button>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">كل الأدوار</option>
          {WORKER_ROLES.map((r) => <option key={r} value={r}>{WORKER_ROLE_LABELS[r]}</option>)}
        </select>
      </div>
      {workers.length === 0 ? (
        <EmptyState title="لا يوجد عمال" message="أضف عاملاً جديداً" />
      ) : (
        <div className="cards-grid">
          {workers.map((w) => (
            <div className="worker-card" key={w._id}>
              <div className="worker-avatar">{w.avatar ? <img src={w.avatar} alt={w.name} /> : w.name.charAt(0)}</div>
              <h3>{w.name}</h3>
              <span className="worker-role-tag">{WORKER_ROLE_LABELS[w.role]}</span>
              <p className="worker-phone" dir="ltr">📞 {w.phone}</p>
              <select className="status-select" value={w.status} onChange={(e) => handleStatus(w._id, e.target.value as WorkerStatus)}>
                {WORKER_STATUSES.map((s) => <option key={s} value={s}>{WORKER_STATUS_LABELS[s]}</option>)}
              </select>
              <div className="card-actions">
                <button className="btn btn-sm" onClick={() => { setEditing(w); setShowForm(true); }}>تعديل</button>
                <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(w)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={showForm} title={editing ? 'تعديل عامل' : 'عامل جديد'} onClose={() => setShowForm(false)}>
        <WorkerForm worker={editing} onDone={() => { setShowForm(false); load(); }} />
      </Modal>
      <ConfirmDialog open={!!confirmDelete} title="حذف" message={`حذف "${confirmDelete?.name}"؟`} confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

function WorkerForm({ worker, onDone }: { worker: Worker | null; onDone: () => void }) {
  const [form, setForm] = useState<WorkerInput>({
    name: worker?.name ?? '', phone: worker?.phone ?? '',
    role: worker?.role ?? 'placo', status: worker?.status ?? 'available', avatar: worker?.avatar ?? '',
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      if (worker) { await api.updateWorker(worker._id, form); showToast('تم التحديث', 'success'); }
      else { await api.createWorker(form); showToast('تمت الإضافة', 'success'); }
      onDone();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="field"><label>الاسم *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div className="field"><label>الهاتف *</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
      <div className="field"><label>الدور *</label>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as WorkerInput['role'] })}>
          {WORKER_ROLES.map((r) => <option key={r} value={r}>{WORKER_ROLE_LABELS[r]}</option>)}
        </select>
      </div>
      <div className="field"><label>الحالة</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as WorkerStatus })}>
          {WORKER_STATUSES.map((s) => <option key={s} value={s}>{WORKER_STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      <div className="field field-full"><label>رابط الصورة</label><input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} dir="ltr" /></div>
      <div className="form-submit"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '...' : 'حفظ'}</button></div>
    </form>
  );
}
