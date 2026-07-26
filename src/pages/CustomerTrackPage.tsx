import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight, Hammer, Search, Loader as Loader2, Camera, CircleCheck as CheckCircle2,
  Clock, DollarSign, MapPin, Ruler, User as UserIcon, Hash, Image as ImageIcon,
} from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../lib/toast";
import { Spinner } from "../components/Spinner";
import { Lightbox } from "../components/Lightbox";
import type { Project } from "../types";
import {
  PROJECT_STATUS_LABELS, STATUS_STYLES, WORK_TYPE_LABELS, WORK_TYPE_ICONS,
  IMAGE_CATEGORY_LABELS,
} from "../types";

const STEPS: { key: Project["status"]; label: string; icon: React.ReactNode }[] = [
  { key: "pending", label: "بانتظار المراجعة", icon: <Clock className="h-5 w-5" /> },
  { key: "in_progress", label: "قيد التنفيذ", icon: <Loader2 className="h-5 w-5" /> },
  { key: "validated", label: "تمت المصادقة", icon: <CheckCircle2 className="h-5 w-5" /> },
  { key: "paid", label: "مكتمل الدفع", icon: <DollarSign className="h-5 w-5" /> },
];

const STEP_ORDER: Project["status"][] = ["pending", "in_progress", "validated", "paid"];

export function CustomerTrackPage() {
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const [code, setCode] = useState(params.get("code") || "");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);

  const track = async (c: string) => {
    const trimmed = c.trim().toUpperCase();
    if (!trimmed) {
      toast("أدخل رمز المتابعة", "error");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const p = await api.projects.track(trimmed);
      setProject(p);
      setParams({ code: trimmed });
    } catch (e) {
      setProject(null);
      toast(e instanceof Error ? e.message : "تعذّر العثور على المشروع", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const c = params.get("code");
    if (c) void track(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStep = project ? STEP_ORDER.indexOf(project.status) : -1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <header className="border-b border-brand-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-900 text-gold-400">
              <Hammer className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-brand-900">ديكو ورشات</p>
          </Link>
          <Link to="/request" className="btn-outline text-sm">
            <Camera className="h-4 w-4" /> طلب مشروع جديد
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center">
          <span className="chip bg-emerald-100 text-emerald-700">
            <Search className="h-3.5 w-3.5" /> متابعة المشروع
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-brand-900 sm:text-3xl">
            تتبع مشروعك
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-brand-500">
            أدخل رمز المتابعة الذي حصلت عليه عند إرسال الطلب لعرض حالة مشروعك.
          </p>
        </div>

        <div className="card mt-8 p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Hash className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
              <input
                className="input pr-9 text-center text-lg font-bold tracking-wider"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && track(code)}
                placeholder="DW-XXXXXX"
              />
            </div>
            <button className="btn-primary" onClick={() => track(code)} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span>تتبع</span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-8">
            <Spinner size={32} />
          </div>
        )}

        {!loading && searched && !project && (
          <div className="card mt-6 grid place-items-center p-12 text-center text-brand-400">
            <Search className="mb-3 h-12 w-12" />
            <p className="text-sm font-semibold">لم يتم العثور على المشروع</p>
            <p className="mt-1 text-xs">تأكد من صحة رمز المتابعة وحاول مرة أخرى</p>
          </div>
        )}

        {!loading && project && (
          <div className="mt-8 space-y-6 animate-slide-up">
            {/* Project header */}
            <div className="card overflow-hidden">
              {project.images[0] && (
                <div className="relative h-48 overflow-hidden bg-brand-100">
                  <img src={project.images[0].url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 to-transparent" />
                  <div className="absolute bottom-3 right-4 left-4 flex items-end justify-between">
                    <div>
                      <span className={`chip ${STATUS_STYLES[project.status]}`}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </span>
                      <p className="mt-2 text-lg font-extrabold text-white drop-shadow">
                        {project.title || "طلب مشروع"}
                      </p>
                    </div>
                    <span className="chip bg-white/90 text-brand-800">
                      <Hash className="h-3 w-3" /> {project.trackingCode}
                    </span>
                  </div>
                </div>
              )}
              {!project.images[0] && (
                <div className="flex items-center justify-between bg-brand-50 p-4">
                  <span className={`chip ${STATUS_STYLES[project.status]}`}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </span>
                  <span className="chip bg-white text-brand-800">
                    <Hash className="h-3 w-3" /> {project.trackingCode}
                  </span>
                </div>
              )}

              <div className="p-5">
                <div className="flex flex-wrap gap-2 text-xs text-brand-500">
                  {project.customer && (
                    <span className="chip bg-brand-50"><UserIcon className="h-3 w-3" /> {project.customer.name}</span>
                  )}
                  {project.city && (
                    <span className="chip bg-brand-50"><MapPin className="h-3 w-3" /> {project.city}</span>
                  )}
                  {project.area && (
                    <span className="chip bg-brand-50"><Ruler className="h-3 w-3" /> {project.area} م²</span>
                  )}
                  {project.worker && (
                    <span className="chip bg-emerald-50 text-emerald-700"><UserIcon className="h-3 w-3" /> {project.worker.name}</span>
                  )}
                </div>

                {project.workTypes.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs font-semibold text-brand-600">أنواع العمل</p>
                    <div className="flex flex-wrap gap-2">
                      {project.workTypes.map((t) => (
                        <span key={t} className="chip bg-gold-100 text-gold-700">
                          <span>{WORK_TYPE_ICONS[t]}</span> {WORK_TYPE_LABELS[t]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.description && (
                  <p className="mt-3 text-sm text-brand-600">{project.description}</p>
                )}
              </div>
            </div>

            {/* Progress timeline */}
            <div className="card p-6">
              <h3 className="mb-5 text-base font-bold text-brand-900">مراحل المشروع</h3>
              <div className="relative">
                <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-brand-100" />
                <div
                  className="absolute right-5 top-0 w-0.5 bg-emerald-500 transition-all duration-500"
                  style={{ height: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />
                <div className="space-y-6">
                  {STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    const current = i === currentStep;
                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div
                          className={
                            done
                              ? "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-white shadow-md"
                              : "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-400"
                          }
                        >
                          {step.icon}
                        </div>
                        <div>
                          <p className={done ? "text-sm font-bold text-brand-900" : "text-sm font-semibold text-brand-400"}>
                            {step.label}
                          </p>
                          {current && (
                            <p className="text-xs text-emerald-600">الحالة الحالية</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Financials */}
            {(project.financials.totalCost > 0 || project.financials.workerFee > 0) && (
              <div className="card p-6">
                <h3 className="mb-4 text-base font-bold text-brand-900">المالية</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-brand-50 p-3">
                    <span className="text-sm text-brand-500">التكلفة الإجمالية</span>
                    <span className="text-lg font-extrabold text-brand-900">{project.financials.totalCost} دج</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-brand-50 p-3">
                    <span className="text-sm text-brand-500">حالة دفع العميل</span>
                    <span className={project.financials.customerPaid ? "chip bg-emerald-100 text-emerald-700" : "chip bg-amber-100 text-amber-700"}>
                      <DollarSign className="h-3.5 w-3.5" /> {project.financials.customerPaid ? "مدفوع" : "غير مدفوع"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Images */}
            <div className="card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-brand-900">
                <ImageIcon className="h-5 w-5" /> صور المشروع
              </h3>
              <ImageGroup
                label={IMAGE_CATEGORY_LABELS.request}
                urls={project.images.filter((i) => i.category === "request").map((i) => i.url)}
                onOpen={(idx) => setLightbox({ urls: project.images.filter((i) => i.category === "request").map((i) => i.url), index: idx })}
              />
              <ImageGroup
                label={IMAGE_CATEGORY_LABELS.progress}
                urls={project.images.filter((i) => i.category === "progress").map((i) => i.url)}
                onOpen={(idx) => setLightbox({ urls: project.images.filter((i) => i.category === "progress").map((i) => i.url), index: idx })}
              />
              <ImageGroup
                label={IMAGE_CATEGORY_LABELS.completion}
                urls={project.images.filter((i) => i.category === "completion").map((i) => i.url)}
                onOpen={(idx) => setLightbox({ urls: project.images.filter((i) => i.category === "completion").map((i) => i.url), index: idx })}
              />
              {project.images.length === 0 && (
                <p className="text-sm text-brand-400">لا توجد صور بعد</p>
              )}
            </div>
          </div>
        )}

        {!loading && !searched && (
          <div className="mt-6 text-center text-xs text-brand-400">
            <p>ليس لديك رمز متابعة؟</p>
            <Link to="/request" className="mt-1 inline-block font-semibold text-emerald-600 hover:underline">
              اطلب مشروعاً جديداً للحصول على رمز
            </Link>
          </div>
        )}
      </section>

      {lightbox && (
        <Lightbox images={lightbox.urls} index={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

function ImageGroup({ label, urls, onOpen }: { label: string; urls: string[]; onOpen: (idx: number) => void }) {
  if (urls.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold text-brand-600">{label} ({urls.length})</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {urls.map((url, i) => (
          <button
            key={i}
            onClick={() => onOpen(i)}
            className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-brand-100 transition hover:ring-emerald-400"
          >
            <img src={url} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
          </button>
        ))}
      </div>
    </div>
  );
}
