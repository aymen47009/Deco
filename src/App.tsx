import { useEffect, useState } from "react";
import { Plus, FolderKanban, Users, Phone, MapPin, Ruler, Hash, Trash2, Pencil, ImagePlus, Loader as Loader2, CircleAlert as AlertCircle, X } from "lucide-react";
import { api } from "./lib/api";
import type { Customer, Project, ProjectStatus, ProjectType } from "./types";
import {
  PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS, STATUS_STYLES,
} from "./types";

type Tab = "projects" | "customers";

export default function App() {
  const [tab, setTab] = useState<Tab>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [p, c] = await Promise.all([api.projects.list(), api.customers.list()]);
      setProjects(p);
      setCustomers(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل التحميل");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white font-bold">د</div>
            <div>
              <p className="text-sm font-bold">ديكو ورشات</p>
              <p className="text-xs text-slate-500">إدارة المشاريع والعملاء</p>
            </div>
          </div>
          <nav className="flex gap-1">
            <TabBtn active={tab === "projects"} onClick={() => setTab("projects")} icon={<FolderKanban className="h-4 w-4" />}>المشاريع</TabBtn>
            <TabBtn active={tab === "customers"} onClick={() => setTab("customers")} icon={<Users className="h-4 w-4" />}>العملاء</TabBtn>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        {loading ? (
          <div className="grid place-items-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : tab === "projects" ? (
          <ProjectsView projects={projects} customers={customers} onChange={load} />
        ) : (
          <CustomersView customers={customers} onChange={load} />
        )}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon} {children}
    </button>
  );
}

function ProjectsView({ projects, customers, onChange }: { projects: Project[]; customers: Customer[]; onChange: () => void }) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">المشاريع ({projects.length})</h2>
        <button className="btn-primary" onClick={() => setShow(true)}>
          <Plus className="h-4 w-4" /> مشروع جديد
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p._id} project={p} onEdit={() => setEditing(p)} onChange={onChange} />
        ))}
        {projects.length === 0 && (
          <div className="card col-span-full grid place-items-center p-10 text-slate-400">
            <FolderKanban className="mb-2 h-8 w-8" /> لا توجد مشاريع بعد
          </div>
        )}
      </div>

      {(show || editing) && (
        <ProjectModal
          project={editing}
          customers={customers}
          onClose={() => { setShow(false); setEditing(null); }}
          onSaved={() => { setShow(false); setEditing(null); onChange(); }}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, onEdit, onChange }: { project: Project; onEdit: () => void; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const del = async () => {
    if (!confirm("حذف هذا المشروع؟")) return;
    await api.projects.remove(project._id);
    onChange();
  };
  return (
    <div className="card overflow-hidden">
      {project.images[0] && (
        <img src={project.images[0]} alt={project.title} className="h-40 w-full object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold">{project.title}</p>
            <p className="text-xs text-slate-500"><Hash className="inline h-3 w-3" /> {project.code}</p>
          </div>
          <span className={`chip ${STATUS_STYLES[project.status]}`}>{PROJECT_STATUS_LABELS[project.status]}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="chip bg-slate-100">{PROJECT_TYPE_LABELS[project.type]}</span>
          <span className="chip bg-slate-100"><MapPin className="h-3 w-3" /> {project.city || "—"}</span>
          <span className="chip bg-slate-100"><Ruler className="h-3 w-3" /> {project.area} م²</span>
        </div>
        {project.customer && (
          <p className="mt-2 text-xs text-slate-500">العميل: {project.customer.name}</p>
        )}
        <div className="mt-3 flex gap-2">
          <button className="btn-outline text-xs" onClick={onEdit}><Pencil className="h-3 w-3" /> تعديل</button>
          <button className="btn-outline text-xs" onClick={() => setOpen((o) => !o)}>تفاصيل</button>
          <button className="btn-outline text-xs text-rose-600" onClick={del}><Trash2 className="h-3 w-3" /></button>
        </div>
        {open && project.images.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
            {project.images.map((url, i) => (
              <img key={i} src={url} alt="" className="h-20 w-full rounded-lg object-cover" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectModal({ project, customers, onClose, onSaved }: {
  project: Project | null;
  customers: Customer[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: project?.title ?? "",
    customerId: project?.customerId ?? customers[0]?._id ?? "",
    city: project?.city ?? "",
    area: project?.area ?? 0,
    type: (project?.type ?? "decor") as ProjectType,
    status: (project?.status ?? "pending") as ProjectStatus,
    notes: project?.notes ?? "",
    images: project?.images ?? [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setErr("");
    try {
      const urls = await Promise.all(Array.from(files).map((f) => api.upload(f)));
      setForm((f) => ({ ...f, images: [...f.images, ...urls.map((u) => u.url)] }));
    } catch (e) {
      setErr("تعذّر رفع الصورة — تحقق من إعدادات Cloudinary");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.title || !form.customerId) { setErr("العنوان والعميل مطلوبان"); return; }
    setSaving(true);
    setErr("");
    try {
      if (project) await api.projects.update(project._id, form);
      else await api.projects.create(form);
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{project ? "تعديل مشروع" : "مشروع جديد"}</h3>
          <button className="btn-ghost h-8 w-8 p-0" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">العنوان</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">العميل</label>
              <select className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">المدينة</label>
              <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="label">المساحة (م²)</label>
              <input type="number" className="input" value={form.area} onChange={(e) => setForm({ ...form, area: +e.target.value })} />
            </div>
            <div>
              <label className="label">النوع</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ProjectType })}>
                {Object.entries(PROJECT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">الحالة</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                {Object.entries(PROJECT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">ملاحظات</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div>
            <label className="label">صور المشروع</label>
            <div className="flex items-center gap-2">
              <label className="btn-outline cursor-pointer text-xs">
                <ImagePlus className="h-4 w-4" /> رفع صور
                <input type="file" multiple accept="image/*" className="hidden" onChange={onFile} />
              </label>
              {uploading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            </div>
            {form.images.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="h-16 w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-rose-600 text-white"
                      onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {err && <p className="text-xs font-semibold text-rose-600">{err}</p>}
          <button className="btn-primary w-full" onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomersView({ customers, onChange }: { customers: Customer[]; onChange: () => void }) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">العملاء ({customers.length})</h2>
        <button className="btn-primary" onClick={() => setShow(true)}>
          <Plus className="h-4 w-4" /> عميل جديد
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((c) => (
          <div key={c._id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold">{c.name}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone || "—"}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.city || "—"}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="btn-ghost h-8 w-8 p-0" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></button>
                <button
                  className="btn-ghost h-8 w-8 p-0 text-rose-600"
                  onClick={async () => { if (confirm("حذف العميل؟")) { await api.customers.remove(c._id); onChange(); } }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {c.notes && <p className="mt-2 text-xs text-slate-500">{c.notes}</p>}
          </div>
        ))}
        {customers.length === 0 && (
          <div className="card col-span-full grid place-items-center p-10 text-slate-400">
            <Users className="mb-2 h-8 w-8" /> لا يوجد عملاء بعد
          </div>
        )}
      </div>

      {(show || editing) && (
        <CustomerModal
          customer={editing}
          onClose={() => { setShow(false); setEditing(null); }}
          onSaved={() => { setShow(false); setEditing(null); onChange(); }}
        />
      )}
    </div>
  );
}

function CustomerModal({ customer, onClose, onSaved }: {
  customer: Customer | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    city: customer?.city ?? "",
    notes: customer?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!form.name) { setErr("الاسم مطلوب"); return; }
    setSaving(true);
    setErr("");
    try {
      if (customer) await api.customers.update(customer._id, form);
      else await api.customers.create(form);
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{customer ? "تعديل عميل" : "عميل جديد"}</h3>
          <button className="btn-ghost h-8 w-8 p-0" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">الاسم</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">الهاتف</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">المدينة</label>
              <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">ملاحظات</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {err && <p className="text-xs font-semibold text-rose-600">{err}</p>}
          <button className="btn-primary w-full" onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}
