import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, ConfirmDialog, EmptyState, showToast, Modal } from './ui';
import { MATERIAL_CATEGORY_LABELS, MATERIAL_CATEGORIES, type Material, type MaterialInput } from '../types';

export function MaterialsList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Material | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Material | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showLowStock, setShowLowStock] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setMaterials(await api.getMaterials({ category: filterCategory || undefined, lowStock: showLowStock || undefined }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterCategory, showLowStock]);

  async function handleDelete() {
    if (!confirmDelete) return;
    try { await api.deleteMaterial(confirmDelete._id); showToast('تم الحذف', 'success'); setConfirmDelete(null); load(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  if (loading) return <Spinner label="جاري التحميل..." />;

  return (
    <div className="admin-section">
      <div className="list-toolbar">
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ مادة جديدة</button>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">كل التصنيفات</option>
          {MATERIAL_CATEGORIES.map((c) => <option key={c} value={c}>{MATERIAL_CATEGORY_LABELS[c]}</option>)}
        </select>
        <label className="checkbox-label">
          <input type="checkbox" checked={showLowStock} onChange={(e) => setShowLowStock(e.target.checked)} />
          مخزون منخفض فقط
        </label>
      </div>
      {materials.length === 0 ? (
        <EmptyState title="لا توجد مواد" message="أضف مادة جديدة" />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>الاسم</th><th>التصنيف</th><th>المخزون</th><th>الوحدة</th><th>السعر</th><th>المورد</th><th>إجراءات</th></tr>
            </thead>
            <tbody>
              {materials.map((m) => {
                const lowStock = m.stock <= m.lowStockThreshold;
                return (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td>{MATERIAL_CATEGORY_LABELS[m.category]}</td>
                    <td className={lowStock ? 'text-danger' : ''}>{m.stock} {lowStock && '⚠'}</td>
                    <td>{m.unit}</td>
                    <td>{m.pricePerUnit}</td>
                    <td>{m.supplier || '—'}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => { setEditing(m); setShowForm(true); }}>تعديل</button>
                      <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(m)}>حذف</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={showForm} title={editing ? 'تعديل مادة' : 'مادة جديدة'} onClose={() => setShowForm(false)}>
        <MaterialForm material={editing} onDone={() => { setShowForm(false); load(); }} />
      </Modal>
      <ConfirmDialog open={!!confirmDelete} title="حذف" message={`حذف "${confirmDelete?.name}"؟`} confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

function MaterialForm({ material, onDone }: { material: Material | null; onDone: () => void }) {
  const [form, setForm] = useState<MaterialInput>({
    name: material?.name ?? '',
    category: material?.category ?? 'other',
    unit: material?.unit ?? 'piece',
    stock: material?.stock ?? 0,
    lowStockThreshold: material?.lowStockThreshold ?? 10,
    pricePerUnit: material?.pricePerUnit ?? 0,
    supplier: material?.supplier ?? '',
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      if (material) { await api.updateMaterial(material._id, form); showToast('تم التحديث', 'success'); }
      else { await api.createMaterial(form); showToast('تمت الإضافة', 'success'); }
      onDone();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="form-field"><label>الاسم *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div className="form-field"><label>التصنيف *</label>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MaterialInput['category'] })}>
          {MATERIAL_CATEGORIES.map((c) => <option key={c} value={c}>{MATERIAL_CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>
      <div className="form-field"><label>الوحدة</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
      <div className="form-field"><label>المخزون</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
      <div className="form-field"><label>حد المخزون المنخفض</label><input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} /></div>
      <div className="form-field"><label>السعر للوحدة</label><input type="number" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: Number(e.target.value) })} /></div>
      <div className="form-field form-field-full"><label>المورد</label><input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
      <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '...' : 'حفظ'}</button></div>
    </form>
  );
}
