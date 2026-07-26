import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, EmptyState, showToast, Modal, ConfirmDialog } from './ui';
import { MATERIAL_CATEGORY_LABELS, MATERIAL_CATEGORIES, type Material, type MaterialInput } from '../types';

export function MaterialsList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Material | null>(null);

  async function load() {
    setLoading(true);
    try { setMaterials(await api.getMaterials()); }
    catch { setMaterials([]); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!confirmDelete) return;
    try { await api.deleteMaterial(confirmDelete._id); showToast('تم الحذف', 'success'); setConfirmDelete(null); load(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  if (loading) return <Spinner label="جاري التحميل..." />;

  return (
    <div className="admin-section">
      <div className="list-toolbar">
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ إضافة مادة</button>
      </div>
      {materials.length === 0 ? <EmptyState title="لا توجد مواد" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>الاسم</th><th>الفئة</th><th>المخزون</th><th>الحد الأدنى</th><th>التكلفة</th><th>الحالة</th><th>إجراءات</th></tr></thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>{MATERIAL_CATEGORY_LABELS[m.category]}</td>
                  <td className={m.lowStock ? 'text-danger' : ''}>{m.stock} {m.unit}</td>
                  <td>{m.minStock}</td>
                  <td>{m.unitCost}</td>
                  <td>{m.lowStock ? <span className="pill pill-low">منخفض</span> : <span className="pill pill-completed">متوفر</span>}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => { setEditing(m); setShowForm(true); }}>تعديل</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(m)}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={showForm} title={editing ? 'تعديل مادة' : 'إضافة مادة'} onClose={() => setShowForm(false)}>
        <MaterialForm material={editing} onDone={() => { setShowForm(false); load(); }} />
      </Modal>
      <ConfirmDialog open={!!confirmDelete} title="حذف" message={`حذف "${confirmDelete?.name}"؟`} confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

function MaterialForm({ material, onDone }: { material: Material | null; onDone: () => void }) {
  const [form, setForm] = useState<MaterialInput>({
    name: material?.name ?? '', category: material?.category ?? 'other', unit: material?.unit ?? 'piece',
    stock: material?.stock ?? 0, minStock: material?.minStock ?? 0, unitCost: material?.unitCost ?? 0, supplier: material?.supplier ?? '',
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (material) { await api.updateMaterial(material._id, form); showToast('تم التحديث', 'success'); }
      else { await api.createMaterial(form); showToast('تمت الإضافة', 'success'); }
      onDone();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <div className="form-field"><label>الاسم *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div className="form-field"><label>الفئة</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MaterialInput['category'] })}>{MATERIAL_CATEGORIES.map((c) => <option key={c} value={c}>{MATERIAL_CATEGORY_LABELS[c]}</option>)}</select></div>
      <div className="form-field"><label>الوحدة</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
      <div className="form-field"><label>المخزون</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
      <div className="form-field"><label>الحد الأدنى</label><input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} /></div>
      <div className="form-field"><label>التكلفة</label><input type="number" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })} /></div>
      <div className="form-field form-field-full"><label>المورد</label><input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
      <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'حفظ'}</button></div>
    </form>
  );
}
