import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Hammer, LogOut, FolderKanban } from "lucide-react";
import { useAuth } from "../lib/auth";
import type { Project, User } from "../types";
import { api } from "../lib/api";
import { useToast } from "../lib/toast";
import { Spinner } from "../components/Spinner";
import { ProjectCard } from "../components/ProjectCard";
import { Modal } from "../components/Modal";
import { ImageUploader } from "../components/ImageUploader";
import { PROJECT_STATUS_LABELS } from "../types";

export function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const nav = useNavigate();
  const toast = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [assignProject, setAssignProject] = useState<Project | null>(null);
  const [addImagesFor, setAddImagesFor] = useState<{ project: Project; category: string } | null>(null);

  const isAdmin = user?.role === "admin";

  const load = async () => {
    setDataLoading(true);
    try {
      const [p, w] = await Promise.all([
        api.projects.list(),
        isAdmin ? api.workers.list() : Promise.resolve([]),
      ]);
      setProjects(p);
      setWorkers(w);
    } catch (e) {
      toast(e instanceof Error ? e.message : "فشل تحميل البيانات", "error");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) nav("/login");
  }, [loading, user, nav]);

  useEffect(() => {
    if (user) void load();
  }, [user]);

  if (loading) return <Spinner size={32} />;
  if (!user) return null;

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  const stats = {
    total: projects.length,
    pending: projects.filter((p) => p.status === "pending").length,
    inProgress: projects.filter((p) => p.status === "in_progress").length,
    paid: projects.filter((p) => p.status === "paid").length,
  };

  const handleValidate = async (id: string) => {
    try { await api.projects.validate(id); toast("تمت مصادقة المشروع", "success"); void load(); }
    catch (e) { toast(e instanceof Error ? e.message : "فشل", "error"); }
  };

  const handleCustomerPaid = async (id: string) => {
    if (!confirm("تأكيد استلام المبلغ من العميل؟")) return;
    try { await api.projects.customerPaid(id); toast("تم تسجيل دفع العميل وإضافة أتعاب العامل", "success"); void load(); }
    catch (e) { toast(e instanceof Error ? e.message : "فشل", "error"); }
  };

  const handleWorkerPaid = async (id: string) => {
    if (!confirm("تأكيد دفع مستحقات العامل؟")) return;
    try { await api.projects.workerPaid(id); toast("تم تسجيل دفع العامل", "success"); void load(); }
    catch (e) { toast(e instanceof Error ? e.message : "فشل", "error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذا المشروع نهائياً؟")) return;
    try { await api.projects.remove(id); toast("تم حذف المشروع", "success"); void load(); }
    catch (e) { toast(e instanceof Error ? e.message : "فشل", "error"); }
  };

  const handleAddImages = async (projectId: string, urls: string[], category: string) => {
    try { await api.projects.addImages(projectId, urls, category); toast("تمت إضافة الصور", "success"); setAddImagesFor(null); void load(); }
    catch (e) { toast(e instanceof Error ? e.message : "فشل", "error"); }
  };

  return (
    <div className="min-h-screen bg-brand-50">
      <header className="sticky top-0 z-40 border-b border-brand-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-900 text-gold-400">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-900">ديكو ورشات</p>
              <p className="text-xs text-brand-500">{isAdmin ? "لوحة الإدارة" : "لوحة العامل"} — {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && <Link to="/workers" className="btn-outline text-xs">إدارة العمال</Link>}
            <Link to="/" className="btn-ghost text-xs">الموقع</Link>
            <button onClick={() => { logout(); nav("/"); }} className="btn-outline text-xs text-rose-600">
              <LogOut className="h-4 w-4" /> خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="إجمالي المشاريع" value={stats.total} />
          <StatCard label="بانتظار المراجعة" value={stats.pending} accent="text-amber-600" />
          <StatCard label="قيد التنفيذ" value={stats.inProgress} accent="text-blue-600" />
          <StatCard label="مكتملة الدفع" value={stats.paid} accent="text-emerald-600" />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <FolderKanban className="h-5 w-5 text-brand-600" />
          <h2 className="text-base font-bold text-brand-900">المشاريع</h2>
          <div className="mr-auto flex flex-wrap gap-1.5">
            <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>الكل</FilterBtn>
            {Object.entries(PROJECT_STATUS_LABELS).map(([k, v]) => (
              <FilterBtn key={k} active={filter === k} onClick={() => setFilter(k)}>{v}</FilterBtn>
            ))}
          </div>
        </div>

        {dataLoading ? (
          <Spinner size={28} />
        ) : filtered.length === 0 ? (
          <div className="card grid place-items-center p-12 text-brand-400">
            <FolderKanban className="mb-2 h-10 w-10" />
            <p className="text-sm">لا توجد مشاريع {filter !== "all" ? "بهذه الحالة" : "بعد"}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard
                key={p._id}
                project={p}
                canEdit
                onEdit={isAdmin ? () => setAssignProject(p) : undefined}
                onValidate={isAdmin ? () => handleValidate(p._id) : undefined}
                onCustomerPaid={isAdmin ? () => handleCustomerPaid(p._id) : undefined}
                onWorkerPaid={isAdmin ? () => handleWorkerPaid(p._id) : undefined}
                onAddImages={(cat) => setAddImagesFor({ project: p, category: cat })}
                onDelete={isAdmin ? () => handleDelete(p._id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {isAdmin && assignProject && (
        <AssignModal
          project={assignProject}
          workers={workers}
          onClose={() => setAssignProject(null)}
          onAssign={async (id, data) => {
            try { await api.projects.assign(id, data); toast("تم تعيين المشروع وتحديد الأسعار", "success"); setAssignProject(null); void load(); }
            catch (e) { toast(e instanceof Error ? e.message : "فشل", "error"); }
          }}
        />
      )}

      {addImagesFor && (
        <AddImagesModal
          project={addImagesFor.project}
          category={addImagesFor.category}
          onClose={() => setAddImagesFor(null)}
          onSubmit={(urls) => handleAddImages(addImagesFor.project._id, urls, addImagesFor.category)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, accent = "text-brand-900" }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-brand-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent}`}>{value}</p>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        active ? "bg-brand-900 text-white" : "bg-white text-brand-600 ring-1 ring-brand-200 hover:bg-brand-50"
      }`}
    >
      {children}
    </button>
  );
}

function AssignModal({ project, workers, onClose, onAssign }: {
  project: Project;
  workers: User[];
  onClose: () => void;
  onAssign: (id: string, data: { workerId?: string; totalCost?: number; workerFee?: number }) => void;
}) {
  const [workerId, setWorkerId] = useState(project.workerId || "");
  const [totalCost, setTotalCost] = useState(project.financials.totalCost || 0);
  const [workerFee, setWorkerFee] = useState(project.financials.workerFee || 0);

  return (
    <Modal open onClose={onClose} title="تعيين العامل وتحديد الأسعار">
      <div className="space-y-4">
        <div>
          <label className="label">المشروع</label>
          <p className="text-sm font-semibold text-brand-900">{project.title}</p>
          {project.customer && <p className="text-xs text-brand-500">العميل: {project.customer.name} — {project.customer.phone}</p>}
        </div>
        <div>
          <label className="label">العامل المسؤول</label>
          <select className="input" value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
            <option value="">— اختر عاملاً —</option>
            {workers.map((w) => <option key={w._id} value={w._id}>{w.name} ({w.phone})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">التكلفة الإجمالية (دج)</label>
            <input type="number" className="input" value={totalCost} onChange={(e) => setTotalCost(+e.target.value)} />
          </div>
          <div>
            <label className="label">أتعاب العامل (دج)</label>
            <input type="number" className="input" value={workerFee} onChange={(e) => setWorkerFee(+e.target.value)} />
          </div>
        </div>
        <button className="btn-primary w-full" onClick={() => onAssign(project._id, { workerId, totalCost, workerFee })}>
          حفظ التعيين
        </button>
      </div>
    </Modal>
  );
}

function AddImagesModal({ project, category, onClose, onSubmit }: {
  project: Project;
  category: string;
  onClose: () => void;
  onSubmit: (urls: string[]) => void;
}) {
  const [urls, setUrls] = useState<string[]>([]);
  return (
    <Modal open onClose={onClose} title={`إضافة ${category === "progress" ? "صور تقدم" : "صور إنجاز"} — ${project.title}`}>
      <div className="space-y-4">
        <ImageUploader images={urls} onChange={setUrls} label="ارفع الصور" />
        <button className="btn-primary w-full" disabled={urls.length === 0} onClick={() => onSubmit(urls)}>
          إضافة {urls.length > 0 ? `(${urls.length})` : ""}
        </button>
      </div>
    </Modal>
  );
}
