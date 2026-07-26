import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, StatusPill, EmptyState, showToast, ConfirmDialog, Modal } from './ui';
import {
  MATERIAL_CATEGORY_LABELS,
  MATERIAL_CATEGORIES,
  type Material,
  type MaterialInput,
} from '../types';

export function MaterialsList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Material | null>(null);
  const [restockTarget, setRestockTarget] = useState<Material | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMaterials({ category: categoryFilter, lowStock: lowStockOnly });
      setMaterials(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل تحميل المواد';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [categoryFilter, lowStockOnly]);

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await api.deleteMaterial(confirmDelete._id);
      showToast('تم حذف المادة', 'success');
      setConfirmDelete(null);
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الحذف';
      showToast(msg, 'error');
    }
  }

  if (loading) return <Spinner label="جاري تحميل المواد..." />;
  if (error) return <EmptyState title="حدث خطأ" message={error} />;

  return (
    <div className="list-section">
      <div className="list-toolbar">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">كل الفئات</option>
          {MATERIAL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{MATERIAL_CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          المخزون المنخفض فقط
        </label>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          + إضافة مادة
        </button>
      </div>

      {materials.length === 0 ? (
        <EmptyState title="لا توجد مواد" message="لم يتم إضافة أي مواد بعد." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الفئة</th>
                <th>المخزون</th>
                <th>الحد الأدنى</th>
                <th>التكلفة</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>{MATERIAL_CATEGORY_LABELS[m.category]}</td>
                  <td className={m.lowStock ? 'text-danger' : ''}>{m.stock} {m.unit}</td>
                  <td>{m.minStock}</td>
                  <td>{m.unitCost} د.أ</td>
                  <td>
                    {m.lowStock ? (
                      <span className="pill pill-low">مخزون منخفض</span>
                    ) : (
                      <span className="pill pill-completed">متوفر</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-sm" onClick={() => setRestockTarget(m)}>تزويد</button>
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

      {restockTarget && (
        <RestockDialog material={restockTarget} onClose={() => setRestockTarget(null)} onDone={() => { setRestockTarget(null); load(); }} />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="حذف المادة"
        message={`هل تريد حذف "${confirmDelete?.name}"؟`}
        confirmLabel="حذف"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function MaterialForm({ material, onDone }: { material: Material | null; onDone: () => void }) {
  const [form, setForm] = useState<MaterialInput>({
    name: material?.name ?? '',
    category: material?.category ?? 'other',
    unit: material?.unit ?? 'piece',
    stock: material?.stock ?? 0,
    minStock: material?.minStock ?? 0,
    unitCost: material?.unitCost ?? 0,
    supplier: material?.supplier ?? '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (material) {
        await api.updateMaterial(material._id, form);
        showToast('تم تحديث المادة', 'success');
      } else {
        await api.createMaterial(form);
        showToast('تم إضافة المادة', 'success');
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
        <label>الفئة</label>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MaterialInput['category'] })}>
          {MATERIAL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{MATERIAL_CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label>الوحدة</label>
        <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
      </div>
      <div className="form-field">
        <label>المخزون</label>
        <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
      </div>
      <div className="form-field">
        <label>الحد الأدنى</label>
        <input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
      </div>
      <div className="form-field">
        <label>التكلفة للوحدة</label>
        <input type="number" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })} />
      </div>
      <div className="form-field form-field-full">
        <label>المورد</label>
        <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
      </div>
      <div className="form-actions form-field-full">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </div>
    </form>
  );
}

function RestockDialog({ material, onClose, onDone }: { material: Material; onClose: () => void; onDone: () => void }) {
  const [quantity, setQuantity] = useState('10');
  const [loading, setLoading] = useState(false);

  async function handleRestock() {
    setLoading(true);
    try {
      await api.restockMaterial(material._id, Number(quantity));
      showToast('تم تزويد المخزون', 'success');
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل التزويد';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={true} title={`تزويد المخزون — ${material.name}`} onClose={onClose} size="sm">
      <div className="restock-content">
        <p>المخزون الحالي: {material.stock} {material.unit}</p>
        <div className="form-field">
          <label>الكمية المضافة</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="confirm-actions">
          <button className="btn btn-primary" onClick={handleRestock} disabled={loading}>
            {loading ? 'جاري...' : 'تزويد'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </Modal>
  );
}
