import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Hammer, LogOut, FolderKanban, Settings as SettingsIcon, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../lib/auth";
import type { Project, User, SiteSettings, WorkType } from "../types";
import { api } from "../lib/api";
import { useToast } from "../lib/toast";
import { Spinner } from "../components/Spinner";
import { ProjectCard } from "../components/ProjectCard";
import { Modal } from "../components/Modal";
import { ImageUploader } from "../components/ImageUploader";
import { PROJECT_STATUS_LABELS, WORK_TYPE_LABELS } from "../types";

const DEFAULT_SETTINGS: SiteSettings = {
  heroImage: "https://images.pexels.com/photos/7567307/pexels-photo-7567307.jpeg?auto=compress&cs=tinysrgb&w=1400",
  galleryImages: [
    "https://images.pexels.com/photos/6492383/pexels-photo-6492383.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/5824477/pexels-photo-5824477.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/6492392/pexels-photo-6492392.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  workTypeIcons: { placo: "🧱", pvc: "⚪", separation: "🪨", marble: "◈", wood: "🪵" },
  services: [
    { icon: "🧱", title: "بلاكو بلاتر", desc: "أسقف وجدران بلاكو بلاتر بأدق التفاصيل" },
    { icon: "⚪", title: "بي في سي السقف", desc: "أسقف بي في سي عصرية ومتينة" },
    { icon: "🪨", title: "سيباراسيون", desc: "فواصل وتقسيمات داخلية احترافية" },
    { icon: "◈", title: "بديل الرخام", desc: "أرضيات وجدران بديل الرخام الفاخر" },
    { icon: "🪵", title: "بديل الخشب", desc: "تشطيبات بديل الخشب الأنيق" },
  ],
};

const WORK_TYPES: WorkType[] = ["placo", "pvc", "separation", "marble", "wood"];

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
  const [tab, setTab] = useState<"projects" | "content">("projects");
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(false);

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
      if (isAdmin) {
        try { const s = await api.settings.get(); setSettings(s); } catch {}
      }
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
        {isAdmin && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setTab("projects")}
              className={tab === "projects" ? "btn-primary text-sm" : "btn-outline text-sm"}
            >
              <FolderKanban className="h-4 w-4" /> المشاريع
            </button>
            <button
              onClick={() => setTab("content")}
              className={tab === "content" ? "btn-primary text-sm" : "btn-outline text-sm"}
            >
              <SettingsIcon className="h-4 w-4" /> إدارة المحتوى
            </button>
          </div>
        )}

        {(!isAdmin || tab === "projects") && (
          <>
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
          </>
        )}

        {isAdmin && tab === "content" && (
          <ContentManager settings={settings} onSettingsChange={setSettings} toast={toast} />
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

function ContentManager({
  settings,
  onSettingsChange,
  toast,
}: {
  settings: SiteSettings;
  onSettingsChange: (s: SiteSettings) => void;
  toast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => { setDraft(settings); }, [settings]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.settings.update(draft);
      onSettingsChange(updated);
      toast("تم حفظ التغييرات بنجاح", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "فشل الحفظ", "error");
    } finally {
      setSaving(false);
    }
  };

  const onHeroFile = async (file: File) => {
    setHeroUploading(true);
    try {
      const res = await api.upload(file);
      setDraft((d) => ({ ...d, heroImage: res.url }));
    } catch { toast("تعذّر رفع الصورة", "error"); }
    finally { setHeroUploading(false); }
  };

  const onGalleryFiles = async (files: File[]) => {
    setGalleryUploading(true);
    try {
      const results = await api.uploadMultiple(files);
      setDraft((d) => ({ ...d, galleryImages: [...d.galleryImages, ...results.map((r) => r.url)] }));
    } catch { toast("تعذّر رفع الصور", "error"); }
    finally { setGalleryUploading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Hero image */}
      <div className="card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-brand-900">
          <ImageIcon className="h-5 w-5" /> الصورة الرئيسية (Hero)
        </h3>
        <div className="overflow-hidden rounded-xl ring-1 ring-brand-200">
          <img src={draft.heroImage} alt="" className="aspect-[16/6] w-full object-cover" />
        </div>
        <div className="mt-3 flex gap-2">
          <label className="btn-outline cursor-pointer text-sm">
            <ImageIcon className="h-4 w-4" /> {heroUploading ? "جارٍ الرفع..." : "تغيير الصورة"}
            <input
              type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onHeroFile(f); }}
            />
          </label>
          <input
            className="input flex-1 text-xs"
            value={draft.heroImage}
            onChange={(e) => setDraft((d) => ({ ...d, heroImage: e.target.value }))}
            placeholder="أو ألصق رابط الصورة هنا"
          />
        </div>
      </div>

      {/* Gallery images */}
      <div className="card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-brand-900">
          <ImageIcon className="h-5 w-5" /> صور معرض الأعمال
        </h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {draft.galleryImages.map((img, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-brand-200">
              <img src={img} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => setDraft((d) => ({ ...d, galleryImages: d.galleryImages.filter((_, j) => j !== i) }))}
                className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-rose-600 text-white opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-brand-200 text-brand-400 transition hover:border-emerald-400 hover:text-emerald-600">
            {galleryUploading ? <Spinner size={20} /> : <Plus className="h-6 w-6" />}
            <input
              type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) onGalleryFiles(fs); }}
            />
          </label>
        </div>
      </div>

      {/* Work type icons */}
      <div className="card p-6">
        <h3 className="mb-1 flex items-center gap-2 text-base font-bold text-brand-900">
          <SettingsIcon className="h-5 w-5" /> أيقونات أنواع العمل
        </h3>
        <p className="mb-4 text-xs text-brand-500">أدخل إيموجي/رمز قصير، أو ارفع صورة لوجو (PNG خلفها شفاف أفضل).</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WORK_TYPES.map((t) => (
            <IconEditor
              key={t}
              value={draft.workTypeIcons[t] || ""}
              label={WORK_TYPE_LABELS[t]}
              onChange={(v) => setDraft((d) => ({ ...d, workTypeIcons: { ...d.workTypeIcons, [t]: v } }))}
              onUpload={async (file) => {
                try { const r = await api.upload(file); setDraft((d) => ({ ...d, workTypeIcons: { ...d.workTypeIcons, [t]: r.url } })); }
                catch { toast("تعذّر رفع الصورة", "error"); }
              }}
            />
          ))}
        </div>
      </div>

      {/* Service icons */}
      <div className="card p-6">
        <h3 className="mb-1 flex items-center gap-2 text-base font-bold text-brand-900">
          <SettingsIcon className="h-5 w-5" /> أيقونات وعناوين الخدمات
        </h3>
        <p className="mb-4 text-xs text-brand-500">يمكن استخدام إيموجي أو رفع صورة لوجو لكل خدمة.</p>
        <div className="space-y-3">
          {draft.services.map((s, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-brand-50 p-3">
              <IconEditor
                value={s.icon}
                label=""
                compact
                onChange={(v) => setDraft((d) => {
                  const services = [...d.services];
                  services[i] = { ...services[i], icon: v };
                  return { ...d, services };
                })}
                onUpload={async (file) => {
                  try { const r = await api.upload(file); setDraft((d) => {
                    const services = [...d.services];
                    services[i] = { ...services[i], icon: r.url };
                    return { ...d, services };
                  }); }
                  catch { toast("تعذّر رفع الصورة", "error"); }
                }}
              />
              <div className="flex-1 space-y-2">
                <input
                  className="input text-sm font-semibold"
                  value={s.title}
                  onChange={(e) => setDraft((d) => {
                    const services = [...d.services];
                    services[i] = { ...services[i], title: e.target.value };
                    return { ...d, services };
                  })}
                  placeholder="عنوان الخدمة"
                />
                <input
                  className="input text-xs"
                  value={s.desc}
                  onChange={(e) => setDraft((d) => {
                    const services = [...d.services];
                    services[i] = { ...services[i], desc: e.target.value };
                    return { ...d, services };
                  })}
                  placeholder="وصف الخدمة"
                />
              </div>
              <button
                onClick={() => setDraft((d) => ({ ...d, services: d.services.filter((_, j) => j !== i) }))}
                className="btn-ghost mt-1 h-8 w-8 p-0 text-rose-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setDraft((d) => ({ ...d, services: [...d.services, { icon: "✨", title: "", desc: "" }] }))}
            className="btn-outline w-full text-sm"
          >
            <Plus className="h-4 w-4" /> إضافة خدمة
          </button>
        </div>
      </div>

      {/* Save button */}
      <div className="sticky bottom-4 flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary shadow-lg">
          {saving ? <Spinner size={18} /> : <SettingsIcon className="h-4 w-4" />}
          حفظ كل التغييرات
        </button>
      </div>
    </div>
  );
}

function isImageUrl(v: string) {
  return /^https?:\/\//.test(v) || v.startsWith("/");
}

function IconEditor({
  value,
  label,
  compact,
  onChange,
  onUpload,
}: {
  value: string;
  label: string;
  compact?: boolean;
  onChange: (v: string) => void;
  onUpload: (file: File) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const isImg = isImageUrl(value);
  return (
    <div className="flex items-center gap-3 rounded-xl bg-brand-50 p-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-brand-200 bg-white">
        {isImg ? (
          <img src={value} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="text-2xl">{value || "❓"}</span>
        )}
      </div>
      <div className="flex-1">
        {label && <p className="text-sm font-semibold text-brand-900">{label}</p>}
        <div className="mt-1 flex gap-1.5">
          <input
            className="input h-9 min-w-0 flex-1 text-xs"
            value={isImg ? "" : value}
            placeholder={isImg ? "(صورة مرفوعة)" : "إيموجي/رمز"}
            onChange={(e) => onChange(e.target.value)}
            maxLength={2}
          />
          <label className="btn-outline flex h-9 cursor-pointer items-center gap-1 px-2 text-xs">
            {uploading ? <Spinner size={14} /> : <ImageIcon className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">لوجو</span>
            <input
              type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setUploading(true);
                onUpload(f);
                setTimeout(() => setUploading(false), 1500);
              }}
            />
          </label>
          {isImg && (
            <button
              onClick={() => onChange("")}
              className="btn-ghost h-9 w-9 p-0 text-rose-500"
              title="إزالة الصورة"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
