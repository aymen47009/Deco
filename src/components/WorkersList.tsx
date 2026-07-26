import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, StatusPill, EmptyState, showToast, ConfirmDialog, Modal } from './ui';
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
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Worker | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Worker | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWorkers({ role: roleFilter, search });
      setWorkers(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل تحميل العمال';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [roleFilter, search]);

  async function handleStatusChange(worker: Worker, status: WorkerStatus) {
    try {
      await api.updateWorkerStatus(worker._id, status);
      showToast('تم تحديث الحالة', 'success');
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل التحديث';
      showToast(msg, 'error');
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await api.deleteWorker(confirmDelete._id);
      showToast('تم حذف العامل', 'success');
      setConfirmDelete(null);
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الحذف';
      showToast(msg, 'error');
    }
  }

  if (loading) return <Spinner label="جاري تحميل العمال..." />;
  if (error) return <EmptyState title="حدث خطأ" message={error} />;

  return (
    <div className="list-section">
      <div className="list-toolbar">
        <input
          className="search-input"
          placeholder="ابحث بالاسم أو الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">كل التخصصات</option>
          {WORKER_ROLES.map((r) => (
            <option key={r} value={r}>
              {WORKER_ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          + إضافة عامل
        </button>
      </div>

      {workers.length === 0 ? (
        <EmptyState title="لا يوجد عمال" message="لم يتم إضافة أي عامل بعد." />
      ) : (
        <div className="cards-grid">
          {workers.map((w) => (
            <div key={w._id} className="worker-card card">
              <div className="worker-card-header">
                <div className="worker-avatar">
                  {w.avatar ? <img src={w.avatar} alt={w.name} /> : w.name.charAt(0)}
                </div>
                <div>
                  <h3>{w.name}</h3>
                  <span className="worker-role">{WORKER_ROLE_LABELS[w.role]}</span>
                </div>
              </div>
              <div className="worker-card-body">
                {w.phone && <p>📞 {w.phone}</p>}
                {w.email && <p>✉ {w.email}</p>}
                {w.skills.length > 0 && (
                  <div className="skills">
                    {w.skills.map((s, i) => (
                      <span key={i} className="skill-tag">{s}</span>
                    ))}
                  </div>
                )}
                <div className="worker-projects">
                  <span>المشاريع: {w.assignedProjects.length}</span>
                  <StatusPill status={w.status} labels={WORKER_STATUS_LABELS} />
                </div>
              </div>
              <div className="worker-card-actions">
                <select
                  value={w.status}
                  onChange={(e) => handleStatusChange(w, e.target.value as WorkerStatus)}
                >
                  {WORKER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {WORKER_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <button className="btn btn-sm" onClick={() => { setEditing(w); setShowForm(true); }}>
                  تعديل
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(w)}>
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} title={editing ? 'تعديل عامل' : 'إضافة عامل'} onClose={() => setShowForm(false)}>
        <WorkerForm
          worker={editing}
          onDone={() => { setShowForm(false); load(); }}
        />
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="حذف العامل"
        message={`هل تريد حذف "${confirmDelete?.name}"؟`}
        confirmLabel="حذف"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function WorkerForm({ worker, onDone }: { worker: Worker | null; onDone: () => void }) {
  const [form, setForm] = useState<WorkerInput>({
    name: worker?.name ?? '',
    phone: worker?.phone ?? '',
    email: worker?.email ?? '',
    role: worker?.role ?? 'general',
    skills: worker?.skills ?? [],
    status: worker?.status ?? 'available',
    dailyRate: worker?.dailyRate ?? 0,
  });
  const [skillsText, setSkillsText] = useState((worker?.skills ?? []).join(', '));
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data: WorkerInput = {
        ...form,
        skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
      };
      if (worker) {
        await api.updateWorker(worker._id, data);
        showToast('تم تحديث العامل', 'success');
      } else {
        await api.createWorker(data);
        showToast('تم إضافة العامل', 'success');
      }
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الحفظ';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label>الاسم *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="form-field">
        <label>الهاتف</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="form-field">
        <label>البريد</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="form-field">
        <label>التخصص</label>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as WorkerInput['role'] })}>
          {WORKER_ROLES.map((r) => (
            <option key={r} value={r}>{WORKER_ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label>الأجر اليومي</label>
        <input
          type="number"
          value={form.dailyRate}
          onChange={(e) => setForm({ ...form, dailyRate: Number(e.target.value) })}
        />
      </div>
      <div className="form-field form-field-full">
        <label>المهارات (افصل بفاصلة)</label>
        <input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="نجارة, تركيب, دهان" />
      </div>
      <div className="form-actions form-field-full">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </div>
    </form>
  );
}
