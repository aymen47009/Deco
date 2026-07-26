import { useState } from 'react';
import { db } from '../lib/db';
import { showToast, Modal, ConfirmDialog } from './ui';
import type { Service } from '../types';

interface Props {
  services: Service[];
  onChanged: () => void;
}

export function ServicesEditor({ services, onChanged }: Props) {
  const [editing, setEditing] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Service | null>(null);

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await db.deleteService(confirmDelete.id);
      showToast('تم الحذف', 'success');
      setConfirmDelete(null);
      onChanged();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  return (
    <div className="admin-section">
      <div className="list-toolbar">
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ إضافة خدمة</button>
      </div>
      <div className="cards-grid">
        {services.map((s) => (
          <div key={s.id} className="card item-card">
            <div className="item-icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
            <div className="item-actions">
              <button className="btn btn-sm" onClick={() => { setEditing(s); setShowForm(true); }}>تعديل</button>
              <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(s)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={showForm} title={editing ? 'تعديل خدمة' : 'إضافة خدمة'} onClose={() => setShowForm(false)}>
        <ServiceForm service={editing} onDone={() => { setShowForm(false); onChanged(); }} />
      </Modal>
      <ConfirmDialog open={!!confirmDelete} title="حذف" message={`حذف "${confirmDelete?.title}"؟`} confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

function ServiceForm({ service, onDone }: { service: Service | null; onDone: () => void }) {
  const [form, setForm] = useState({
    icon: service?.icon ?? '🪟',
    title: service?.title ?? '',
    description: service?.description ?? '',
    sort_order: service?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (service) { await db.updateService(service.id, form); showToast('تم التحديث', 'success'); }
      else { await db.createService(form); showToast('تمت الإضافة', 'success'); }
      onDone();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="form-field">
        <label>الأيقونة (إيموجي)</label>
        <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={4} />
      </div>
      <div className="form-field">
        <label>الترتيب</label>
        <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
      </div>
      <div className="form-field form-field-full">
        <label>العنوان *</label>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="form-field form-field-full">
        <label>الوصف</label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '...' : 'حفظ'}</button>
      </div>
    </form>
  );
}
