import { useMemo, useState } from "react";
import { Plus, Hammer, ClipboardList, Trash2, Phone, MapPin, Star, CircleCheck as CheckCircle2, Circle as XCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Job, JobStatus } from "../types";
import {
  PROPERTY_TYPE_LABELS,
  JOB_COMPLEXITY_LABELS,
  RETURN_METHOD_LABELS,
  MATERIAL_CATEGORY_LABELS,
  type MaterialCategory,
} from "../types";
import StatusPill from "./ui/StatusPill";
import { estimateJobPrice, formatSAR } from "../lib/pricing";

type Tab = "jobs" | "workers" | "customers" | "materials";

export default function AdminDashboard() {
  const app = useApp();
  const [tab, setTab] = useState<Tab>("jobs");
  const [showAddJob, setShowAddJob] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  const stats = useMemo(() => {
    const byStatus = (s: JobStatus) => app.jobs.filter((j) => j.status === s).length;
    return {
      total: app.jobs.length,
      pending: byStatus("pending"),
      active: byStatus("in_progress") + byStatus("assigned"),
      done: byStatus("done"),
    };
  }, [app.jobs]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<ClipboardList className="h-5 w-5" />} label="إجمالي الطلبات" value={stats.total} tone="brand" />
        <StatCard icon={<Hammer className="h-5 w-5" />} label="قيد العمل" value={stats.active} tone="indigo" />
        <StatCard icon={<Star className="h-5 w-5" />} label="بانتظار الموافقة" value={stats.pending} tone="amber" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="مكتملة" value={stats.done} tone="emerald" />
      </div>

      <div className="flex flex-wrap gap-2">
        <TabBtn active={tab === "jobs"} onClick={() => setTab("jobs")}>الطلبات</TabBtn>
        <TabBtn active={tab === "workers"} onClick={() => setTab("workers")}>العمال</TabBtn>
        <TabBtn active={tab === "customers"} onClick={() => setTab("customers")}>العملاء</TabBtn>
        <TabBtn active={tab === "materials"} onClick={() => setTab("materials")}>المواد</TabBtn>
      </div>

      {tab === "jobs" && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">الطلبات</h2>
            <button className="btn-primary" onClick={() => setShowAddJob(true)}>
              <Plus className="h-4 w-4" /> طلب جديد
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {app.jobs.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
            {app.jobs.length === 0 && <Empty text="لا توجد طلبات بعد" />}
          </div>
        </div>
      )}

      {tab === "workers" && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">العمال</h2>
            <button className="btn-primary" onClick={() => setShowAddWorker(true)}>
              <Plus className="h-4 w-4" /> عامل جديد
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {app.workers.map((w) => (
              <div key={w.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{w.name}</p>
                    <p className="text-sm text-slate-500">{w.specialty}</p>
                  </div>
                  <span className="chip bg-amber-100 text-amber-700">
                    <Star className="h-3 w-3" /> {w.rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {w.phone}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {w.city}</span>
                  <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {w.jobsCompleted} مهمة</span>
                </div>
              </div>
            ))}
            {app.workers.length === 0 && <Empty text="لا يوجد عمال" />}
          </div>
        </div>
      )}

      {tab === "customers" && (
        <div>
          <h2 className="mb-3 text-lg font-bold">العملاء</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {app.customers.map((c) => (
              <div key={c.id} className="card p-4">
                <p className="font-bold">{c.name}</p>
                <div className="mt-2 flex gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.city}</span>
                </div>
              </div>
            ))}
            {app.customers.length === 0 && <Empty text="لا يوجد عملاء" />}
          </div>
        </div>
      )}

      {tab === "materials" && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">المواد</h2>
            <button className="btn-primary" onClick={() => setShowAddMaterial(true)}>
              <Plus className="h-4 w-4" /> مادة جديدة
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {app.materials.map((m) => {
              const low = m.stock <= m.minStock;
              return (
                <div key={m.id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold">{m.name}</p>
                      <p className="text-sm text-slate-500">{m.category}</p>
                    </div>
                    <span className={`chip ${low ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {m.stock} {m.unit}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">السعر: {formatSAR(m.price)} / {m.unit}</p>
                  {low && <p className="mt-1 text-xs font-semibold text-rose-600">المخزون منخفض</p>}
                </div>
              );
            })}
            {app.materials.length === 0 && <Empty text="لا توجد مواد" />}
          </div>
        </div>
      )}

      {showAddJob && <AddJobModal onClose={() => setShowAddJob(false)} />}
      {showAddWorker && <AddWorkerModal onClose={() => setShowAddWorker(false)} />}
      {showAddMaterial && <AddMaterialModal onClose={() => setShowAddMaterial(false)} />}
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    indigo: "bg-indigo-50 text-indigo-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-brand-600 text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="card col-span-full grid place-items-center p-10 text-slate-400">{text}</div>;
}

function JobCard({ job }: { job: Job }) {
  const app = useApp();
  const [open, setOpen] = useState(false);
  const customer = app.customers.find((c) => c.id === job.customerId);
  const worker = job.assignedWorkerId ? app.workers.find((w) => w.id === job.assignedWorkerId) : null;
  const price = job.price ?? estimateJobPrice(job, app.materials);

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold">{job.title}</p>
          <p className="text-sm text-slate-500">{customer?.name ?? "—"}</p>
        </div>
        <StatusPill status={job.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="chip bg-slate-100">{PROPERTY_TYPE_LABELS[job.propertyType]}</span>
        <span className="chip bg-slate-100">{JOB_COMPLEXITY_LABELS[job.complexity]}</span>
        <span className="chip bg-slate-100">{RETURN_METHOD_LABELS[job.returnMethod]}</span>
        <span className="chip bg-slate-100"><MapPin className="h-3 w-3" /> {job.city}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-700">{formatSAR(price)}</span>
        <button className="btn-ghost text-xs" onClick={() => setOpen((o) => !o)}>
          {open ? "إخفاء" : "تفاصيل"}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3 text-sm">
          <p className="text-slate-600">{job.description}</p>
          {worker && <p className="text-slate-600">العامل: <span className="font-semibold">{worker.name}</span></p>}
          {job.bids.length > 0 && (
            <div>
              <p className="mb-1 font-semibold">العروض ({job.bids.length}):</p>
              <ul className="space-y-1">
                {job.bids.map((b, i) => {
                  const bw = app.workers.find((w) => w.id === b.workerId);
                  return (
                    <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5">
                      <span>{bw?.name ?? "—"}</span>
                      <span className="font-semibold">{formatSAR(b.amount)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {job.status === "pending" && (
              <>
                <button className="btn-primary text-xs" onClick={() => app.setJobStatus(job.id, "assigned")}>
                  موافقة
                </button>
                <button className="btn-outline text-xs" onClick={() => app.setJobStatus(job.id, "cancelled")}>
                  <XCircle className="h-3 w-3" /> رفض
                </button>
              </>
            )}
            {job.status === "assigned" && (
              <button className="btn-primary text-xs" onClick={() => app.setJobStatus(job.id, "in_progress")}>
                بدء التنفيذ
              </button>
            )}
            {job.status === "in_progress" && (
              <button className="btn-primary text-xs" onClick={() => app.setJobStatus(job.id, "inspection")}>
                للفحص
              </button>
            )}
            {job.status === "inspection" && (
              <>
                <button
                  className="btn-primary text-xs"
                  onClick={() => app.completeInspection(job.id, true, "تم القبول", "admin")}
                >
                  <CheckCircle2 className="h-3 w-3" /> قبول
                </button>
                <button
                  className="btn-outline text-xs"
                  onClick={() => app.completeInspection(job.id, false, "يحتاج تعديل", "admin")}
                >
                  <XCircle className="h-3 w-3" /> رفض
                </button>
              </>
            )}
            <button
              className="btn-outline text-xs text-rose-600"
              onClick={() => {
                app.updateJob(job.id, { status: "cancelled" });
              }}
            >
              <Trash2 className="h-3 w-3" /> حذف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddJobModal({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const [form, setForm] = useState({
    customerId: app.customers[0]?.id ?? "",
    title: "",
    description: "",
    propertyType: "home" as Job["propertyType"],
    city: "",
    complexity: "simple" as Job["complexity"],
    returnMethod: "pickup" as Job["returnMethod"],
  });

  const submit = () => {
    if (!form.customerId || !form.title || !form.city) return;
    app.addJob(form);
    onClose();
  };

  return (
    <Modal title="طلب جديد" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="label">العميل</label>
          <select className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
            {app.customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">العنوان</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="label">الوصف</label>
          <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">نوع العقار</label>
            <select className="input" value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value as Job["propertyType"] })}>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">المدينة</label>
            <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="label">التعقيد</label>
            <select className="input" value={form.complexity} onChange={(e) => setForm({ ...form, complexity: e.target.value as Job["complexity"] })}>
              {Object.entries(JOB_COMPLEXITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">طريقة الإرجاع</label>
            <select className="input" value={form.returnMethod} onChange={(e) => setForm({ ...form, returnMethod: e.target.value as Job["returnMethod"] })}>
              {Object.entries(RETURN_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn-primary w-full" onClick={submit}>إنشاء</button>
      </div>
    </Modal>
  );
}

function AddWorkerModal({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const [form, setForm] = useState({ name: "", phone: "", city: "", specialty: "" });
  const submit = () => {
    if (!form.name || !form.phone) return;
    app.addWorker(form);
    onClose();
  };
  return (
    <Modal title="عامل جديد" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="label">الاسم</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">الهاتف</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="label">المدينة</label>
          <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <label className="label">التخصص</label>
          <input className="input" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
        </div>
        <button className="btn-primary w-full" onClick={submit}>إضافة</button>
      </div>
    </Modal>
  );
}

function AddMaterialModal({ onClose }: { onClose: () => void }) {
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
    <Modal title="مادة جديدة" onClose={onClose}>
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
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button className="btn-ghost h-8 w-8 p-0" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
