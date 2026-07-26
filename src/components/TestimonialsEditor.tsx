import { useState } from 'react';
import { db } from '../lib/db';
import { showToast, Modal, ConfirmDialog } from './ui';
import type { Testimonial } from '../types';

interface Props {
  items: Testimonial[];
  onChanged: () => void;
}

export function TestimonialsEditor({ items, onChanged }: Props) {
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Testimonial | null>(null);

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await db.deleteTestimonial(confirmDelete.id);
      showToast('تم الحذف', 'success');
      setConfirmDelete(null);
      onChanged();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  return (
    <div className="admin-section">
      <div className="list-toolbar">
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ إضافة رأي</button>
      </div>
      <div className="cards-grid">
        {items.map((t) => (
          <div key={t.id} className="card item-card">
            <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
            <p className="testimonial-text">"{t.text}"</p>
            <div className="testimonial-author">
              <img src={t.avatar} alt={t.name} />
              <div>
                <span className="testimonial-name">{t.name}</span>
                <span className="testimonial-role">{t.role}</span>
              </div>
            </div>
            <div className="item-actions">
              <button className="btn btn-sm" onClick={() => { setEditing(t); setShowForm(true); }}>تعديل</button>
              <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(t)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={showForm} title={editing ? 'تعديل رأي' : 'إضافة رأي'} onClose={() => setShowForm(false)}>
        <TestimonialForm item={editing} onDone={() => { setShowForm(false); onChanged(); }} />
      </Modal>
      <ConfirmDialog open={!!confirmDelete} title="حذف" message={`حذف رأي "${confirmDelete?.name}"؟`} confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

function TestimonialForm({ item, onDone }: { item: Testimonial | null; onDone: () => void }) {
  const [form, setForm] = useState({
    name: item?.name ?? '',
    role: item?.role ?? '',
    text: item?.text ?? '',
    rating: item?.rating ?? 5,
    avatar: item?.avatar ?? '',
    sort_order: item?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (item) { await db.updateTestimonial(item.id, form); showToast('تم التحديث', 'success'); }
      else { await db.createTestimonial(form); showToast('تمت الإضافة', 'success'); }
      onDone();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="form-field">
        <label>الاسم *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="form-field">
        <label>الصفة</label>
        <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
      </div>
      <div className="form-field">
        <label>التقييم (1-5)</label>
        <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
      </div>
      <div className="form-field">
        <label>الترتيب</label>
        <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
      </div>
      <div className="form-field form-field-full">
        <label>رابط صورة العميل</label>
        <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
        {form.avatar && <img src={form.avatar} alt="معاينة" className="image-preview avatar-preview" />}
      </div>
      <div className="form-field form-field-full">
        <label>النص *</label>
        <textarea required rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '...' : 'حفظ'}</button>
      </div>
    </form>
  );
}
