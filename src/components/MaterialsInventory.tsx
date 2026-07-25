import { useState } from "react";
import { Plus, Package, TriangleAlert as AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { MATERIAL_CATEGORY_LABELS, type MaterialCategory } from "../types";
import { formatSAR } from "../lib/pricing";

export default function MaterialsInventory() {
  const app = useApp();
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">المواد</h2>
        <button className="btn-primary" onClick={() => setShow(true)}>
          <Plus className="h-4 w-4" /> مادة جديدة
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {app.materials.map((m) => {
          const low = m.stock <= m.minStock;
          return (
            <div key={m.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold">{m.name}</p>
                    <p className="text-xs text-slate-500">{MATERIAL_CATEGORY_LABELS[m.category]}</p>
                  </div>
                </div>
                {low && (
                  <span className="chip bg-rose-100 text-rose-700">
                    <AlertTriangle className="h-3 w-3" /> منخفض
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className={low ? "font-bold text-rose-600" : "text-slate-700"}>
                  {m.stock} {m.unit}
                </span>
                <span className="font-semibold text-brand-700">{formatSAR(m.price)}</span>
              </div>
            </div>
          );
        })}
        {app.materials.length === 0 && (
          <div className="card col-span-full grid place-items-center p-10 text-slate-400">
            <Package className="mb-2 h-8 w-8" /> لا توجد مواد
          </div>
        )}
      </div>

      {show && <AddModal onClose={() => setShow(false)} />}
    </div>
  );
}

function AddModal({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const [form, setForm] = useState({
    name: "",
    category: "paint" as MaterialCategory,
    unit: "",
    stock: 0,
    minStock: 0,
    price: 0,
  });

  const submit = () => {
    if (!form.name || !form.unit) return;
    app.addMaterial(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-lg font-bold">مادة جديدة</h3>
        <div className="space-y-3">
          <div>
            <label className="label">الاسم</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">الفئة</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MaterialCategory })}>
                {Object.entries(MATERIAL_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">الوحدة</label>
              <input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div>
              <label className="label">المخزون</label>
              <input type="number" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} />
            </div>
            <div>
              <label className="label">حد التنبيه</label>
              <input type="number" className="input" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: +e.target.value })} />
            </div>
            <div>
              <label className="label">السعر</label>
              <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
            </div>
          </div>
          <button className="btn-primary w-full" onClick={submit}>إضافة</button>
        </div>
      </div>
    </div>
  );
}
