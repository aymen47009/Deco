import { useState } from 'react';
import { db } from '../lib/db';
import { showToast, Modal, ConfirmDialog } from './ui';
import type { PortfolioItem } from '../types';

interface Props {
  items: PortfolioItem[];
  onChanged: () => void;
}

export function PortfolioEditor({ items, onChanged }: Props) {
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<PortfolioItem | null>(null);

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await db.deletePortfolioItem(confirmDelete.id);
      showToast('تم الحذف', 'success');
      setConfirmDelete(null);
      onChanged();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  return (
    <div className="admin-section">
      <div className="list-toolbar">
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ إضافة عمل</button>
      </div>
      <div className="portfolio-admin-grid">
        {items.map((item) => (
          <div key={item.id} className="card portfolio-admin-card">
            <img src={item.image} alt={item.title} className="portfolio-admin-img" />
            <h3>{item.title}</h3>
            <p>{item.category} — {item.location}</p>
            <div className="item-actions">
              <button className="btn btn-sm" onClick={() => { setEditing(item); setShowForm(true); }}>تعديل</button>
              <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(item)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={showForm} title={editing ? 'تعديل عمل' : 'إضافة عمل'} onClose={() => setShowForm(false)}>
        <PortfolioForm item={editing} onDone={() => { setShowForm(false); onChanged(); }} />
      </Modal>
      <ConfirmDialog open={!!confirmDelete} title="حذف" message={`حذف "${confirmDelete?.title}"؟`} confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

function PortfolioForm({ item, onDone }: { item: PortfolioItem | null; onDone: () => void }) {
  const [form, setForm] = useState({
    image: item?.image ?? '',
    title: item?.title ?? '',
    category: item?.category ?? '',
    location: item?.location ?? '',
    sort_order: item?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (item) { await db.updatePortfolioItem(item.id, form); showToast('تم التحديث', 'success'); }
      else { await db.createPortfolioItem(form); showToast('تمت الإضافة', 'success'); }
      onDone();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="form-field form-field-full">
        <label>رابط الصورة *</label>
        <input required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        {form.image && <img src={form.image} alt="معاينة" className="image-preview" />}
      </div>
      <div className="form-field">
        <label>العنوان *</label>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="form-field">
        <label>التصنيف</label>
        <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      </div>
      <div className="form-field">
        <label>الموقع</label>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      </div>
      <div className="form-field">
        <label>الترتيب</label>
        <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '...' : 'حفظ'}</button>
      </div>
    </form>
  );
}
