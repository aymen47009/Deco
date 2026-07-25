import { useState } from "react";
import { Plus, ClipboardList, MapPin, Phone } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { PropertyType, JobComplexity, ReturnMethod, Job } from "../types";
import { PROPERTY_TYPE_LABELS, JOB_COMPLEXITY_LABELS, RETURN_METHOD_LABELS } from "../types";
import StatusPill from "./ui/StatusPill";
import { estimateJobPrice, formatSAR } from "../lib/pricing";

export default function CustomerPortal({ customerId }: { customerId: string }) {
  const app = useApp();
  const customer = app.customers.find((c) => c.id === customerId);
  const myJobs = app.jobs.filter((j) => j.customerId === customerId);
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <p className="text-xl font-bold">{customer?.name ?? "عميل"}</p>
        <div className="mt-1 flex gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {customer?.phone}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {customer?.city}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">طلباتي</h2>
        <button className="btn-primary" onClick={() => setShow(true)}>
          <Plus className="h-4 w-4" /> طلب جديد
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {myJobs.map((j) => (
          <CustomerJobCard key={j.id} job={j} />
        ))}
        {myJobs.length === 0 && (
          <div className="card col-span-full grid place-items-center p-10 text-slate-400">
            <ClipboardList className="mb-2 h-8 w-8" /> لا توجد طلبات
          </div>
        )}
      </div>

      {show && <NewJobModal customerId={customerId} onClose={() => setShow(false)} />}
    </div>
  );
}

function CustomerJobCard({ job }: { job: Job }) {
  const app = useApp();
  const worker = job.assignedWorkerId ? app.workers.find((w) => w.id === job.assignedWorkerId) : null;
  const price = job.price ?? estimateJobPrice(job, app.materials);
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold">{job.title}</p>
          <p className="text-sm text-slate-500">{job.city}</p>
        </div>
        <StatusPill status={job.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="chip bg-slate-100">{PROPERTY_TYPE_LABELS[job.propertyType]}</span>
        <span className="chip bg-slate-100">{JOB_COMPLEXITY_LABELS[job.complexity]}</span>
        <span className="chip bg-slate-100">{RETURN_METHOD_LABELS[job.returnMethod]}</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-brand-700">{formatSAR(price)}</span>
        {worker && <span className="text-slate-500">العامل: {worker.name}</span>}
      </div>
      {job.bids.length > 0 && job.status === "pending" && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="mb-1 text-xs font-semibold text-slate-600">العروض ({job.bids.length}):</p>
          <ul className="space-y-1">
            {job.bids.map((b, i) => {
              const bw = app.workers.find((w) => w.id === b.workerId);
              return (
                <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
                  <span>{bw?.name ?? "—"}</span>
                  <span className="font-semibold">{formatSAR(b.amount)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function NewJobModal({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const app = useApp();
  const customer = app.customers.find((c) => c.id === customerId);
  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "home" as PropertyType,
    city: customer?.city ?? "",
    complexity: "simple" as JobComplexity,
    returnMethod: "pickup" as ReturnMethod,
  });

  const submit = () => {
    if (!form.title || !form.city) return;
    app.addJob({ customerId, ...form });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-lg font-bold">طلب جديد</h3>
        <div className="space-y-3">
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
              <select className="input" value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value as PropertyType })}>
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
              <select className="input" value={form.complexity} onChange={(e) => setForm({ ...form, complexity: e.target.value as JobComplexity })}>
                {Object.entries(JOB_COMPLEXITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">طريقة الإرجاع</label>
              <select className="input" value={form.returnMethod} onChange={(e) => setForm({ ...form, returnMethod: e.target.value as ReturnMethod })}>
                {Object.entries(RETURN_METHOD_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn-primary w-full" onClick={submit}>إنشاء الطلب</button>
        </div>
      </div>
    </div>
  );
}
