import { useState } from "react";
import { Hammer, MapPin, Star, CircleCheck as CheckCircle2, Clock, Gavel } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Job } from "../types";
import { PROPERTY_TYPE_LABELS, JOB_COMPLEXITY_LABELS, RETURN_METHOD_LABELS } from "../types";
import StatusPill from "./ui/StatusPill";
import { estimateJobPrice, formatSAR } from "../lib/pricing";

export default function WorkerDashboard({ workerId }: { workerId: string }) {
  const app = useApp();
  const worker = app.workers.find((w) => w.id === workerId);

  const myJobs = app.jobs.filter((j) => j.assignedWorkerId === workerId);
  const available = app.jobs.filter((j) => j.status === "pending" && !j.bids.some((b) => b.workerId === workerId));

  return (
    <div className="space-y-6">
      <div className="card flex items-center gap-4 p-5">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <Hammer className="h-7 w-7" />
        </div>
        <div>
          <p className="text-xl font-bold">{worker?.name ?? "عامل"}</p>
          <div className="mt-1 flex gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> {worker?.rating.toFixed(1)}</span>
            <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {worker?.jobsCompleted} مهمة</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {worker?.city}</span>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">طلبات متاحة للتقديم</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {available.map((j) => (
            <AvailableJobCard key={j.id} job={j} workerId={workerId} />
          ))}
          {available.length === 0 && <div className="card col-span-full grid place-items-center p-10 text-slate-400">لا توجد طلبات متاحة</div>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">مهامي</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {myJobs.map((j) => (
            <MyJobCard key={j.id} job={j} />
          ))}
          {myJobs.length === 0 && <div className="card col-span-full grid place-items-center p-10 text-slate-400">لا توجد مهام</div>}
        </div>
      </section>
    </div>
  );
}

function AvailableJobCard({ job, workerId }: { job: Job; workerId: string }) {
  const app = useApp();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const est = estimateJobPrice(job, app.materials);

  const submit = () => {
    if (amount <= 0) return;
    app.placeBid(job.id, workerId, amount, note || undefined);
    setOpen(false);
  };

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold">{job.title}</p>
          <p className="text-sm text-slate-500"><MapPin className="inline h-3 w-3" /> {job.city}</p>
        </div>
        <span className="chip bg-slate-100 text-slate-600"><Clock className="h-3 w-3" /> متاح</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="chip bg-slate-100">{PROPERTY_TYPE_LABELS[job.propertyType]}</span>
        <span className="chip bg-slate-100">{JOB_COMPLEXITY_LABELS[job.complexity]}</span>
        <span className="chip bg-slate-100">{RETURN_METHOD_LABELS[job.returnMethod]}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-slate-500">السعر التقديري: <span className="font-semibold text-brand-700">{formatSAR(est)}</span></span>
        <button className="btn-primary text-xs" onClick={() => setOpen((o) => !o)}>
          <Gavel className="h-3 w-3" /> تقديم عرض
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          <input type="number" className="input" placeholder="السعر المعروض" value={amount} onChange={(e) => setAmount(+e.target.value)} />
          <input className="input" placeholder="ملاحظة (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn-primary w-full text-xs" onClick={submit}>إرسال العرض</button>
        </div>
      )}
    </div>
  );
}

function MyJobCard({ job }: { job: Job }) {
  const app = useApp();
  const progress = job.execution?.progress ?? 0;

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold">{job.title}</p>
          <p className="text-sm text-slate-500">{job.city}</p>
        </div>
        <StatusPill status={job.status} />
      </div>
      {job.status === "in_progress" && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>التقدّم</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex gap-2">
            <button className="btn-outline text-xs" onClick={() => app.updateProgress(job.id, progress + 25)}>تحديث التقدّم</button>
            <button className="btn-primary text-xs" onClick={() => app.setJobStatus(job.id, "inspection")}>إنهاء للفحص</button>
          </div>
        </div>
      )}
      {job.price && (
        <p className="mt-3 text-sm font-semibold text-brand-700">السعر: {formatSAR(job.price)}</p>
      )}
    </div>
  );
}
