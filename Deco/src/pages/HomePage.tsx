import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Hammer, Camera, Search, Sparkles, Phone, ShieldCheck, Clock, Award,
  CircleCheck as CheckCircle2, Send, Copy,
} from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../lib/toast";
import { Spinner } from "../components/Spinner";
import type { WorkType, Project, SiteSettings } from "../types";
import { WORK_TYPE_LABELS } from "../types";

const TYPES: WorkType[] = ["placo", "pvc", "separation", "marble", "wood"];

function isImageUrl(v: string) {
  return /^https?:\/\//.test(v) || v.startsWith("/");
}

function ServiceIcon({ value, className }: { value: string; className?: string }) {
  if (isImageUrl(value)) {
    return <img src={value} alt="" className={`object-contain ${className ?? ""}`} />;
  }
  return <span className={className}>{value || "❓"}</span>;
}

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

export function HomePage() {
  const toast = useToast();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.settings.get().then(setSettings).catch(() => {});
  }, []);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-900 text-gold-400">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-900">ديكو ورشات</p>
              <p className="text-xs text-brand-500">ديكور · بلاكو بلاتر · تشطيبات</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/track" className="btn-outline text-sm">
              <Search className="h-4 w-4" /> تتبع مشروع
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={settings.heroImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-brand-900/90 via-brand-900/70 to-brand-900/40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="max-w-xl">
            <span className="chip bg-gold-500/20 text-gold-300 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> منصة إدارة احترافية للمشاريع
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              نُنفّذ مشاريع الديكور
              <span className="block text-gold-400">بأعلى جودة واحترافية</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-brand-100">
              أرسل طلبك الآن واحصل على رمز متابعة لتتبع مشروعك في كل مرحلة — من المراجعة إلى التسليم.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={scrollToForm} className="btn-gold animate-pulse text-base shadow-lg">
                <Camera className="h-5 w-5" /> اطلب مشروعك الآن
              </button>
              <Link to="/track" className="btn text-base bg-white/10 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/20">
                <Search className="h-5 w-5" /> تتبع مشروعي
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-brand-100">
              <span className="flex items-center gap-2"><Award className="h-4 w-4 text-gold-400" /> خبرة في المجال</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold-400" /> تسليم في الموعد</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold-400" /> ضمان الجودة</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <span className="chip bg-emerald-100 text-emerald-700"><Sparkles className="h-3.5 w-3.5" /> خدماتنا</span>
          <h2 className="mt-4 text-3xl font-extrabold text-brand-900">أنواع الأعمال التي ننفّذها</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-brand-500">
            نختص في مجموعة واسعة من أعمال الديكور والتشطيب — اختر ما يناسب مشروعك.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {settings.services.map((s, i) => (
            <div key={i} className="card p-5 text-center transition hover:shadow-md hover:-translate-y-1">
              <div className="mx-auto grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-brand-50">
                <ServiceIcon value={s.icon} className="h-10 w-10 text-2xl" />
              </div>
              <h3 className="mt-3 font-bold text-brand-900">{s.title}</h3>
              <p className="mt-1 text-xs text-brand-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brand-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <span className="chip bg-gold-100 text-gold-700"><Camera className="h-3.5 w-3.5" /> كيف نعمل</span>
            <h2 className="mt-4 text-3xl font-extrabold text-brand-900">من الطلب إلى التسليم في 4 خطوات</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Camera className="h-6 w-6" />, title: "اطلب مشروعك", desc: "املأ النموذج — في دقائق فقط." },
              { icon: <Search className="h-6 w-6" />, title: "احصل على رمز المتابعة", desc: "نرسل لك رمزاً فريداً لتتبع مشروعك." },
              { icon: <Hammer className="h-6 w-6" />, title: "ننفّذ باحترافية", desc: "فريقنا المتخصص ينفذ المشروع بأعلى معايير الجودة." },
              { icon: <CheckCircle2 className="h-6 w-6" />, title: "تابع وأنهِ", desc: "شاهد صور التقدم والإنجاز وأكّد التسليم." },
            ].map((s, i) => (
              <div key={i} className="card relative p-6">
                <span className="absolute left-4 top-4 text-4xl font-extrabold text-brand-100">{i + 1}</span>
                <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-emerald-100 text-emerald-600">
                  {s.icon}
                </div>
                <h3 className="mt-4 font-bold text-brand-900">{s.title}</h3>
                <p className="mt-1 text-xs text-brand-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Embedded request form */}
      <section ref={formRef} className="mx-auto max-w-2xl px-4 py-16">
        <div className="text-center">
          <span className="chip bg-gold-100 text-gold-700"><Camera className="h-3.5 w-3.5" /> طلب مشروع</span>
          <h2 className="mt-4 text-3xl font-extrabold text-brand-900">اطلب مشروعك الآن</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-brand-500">
            املأ النموذج أدناه. ستتواصل معك الإدارة بعد مراجعة الطلب.
          </p>
        </div>
        <div className="mt-8">
          <EmbeddedRequestForm settings={settings} toast={toast} />
        </div>
      </section>

      {/* Gallery preview */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <span className="chip bg-emerald-100 text-emerald-700"><Award className="h-3.5 w-3.5" /> أعمالنا</span>
          <h2 className="mt-4 text-3xl font-extrabold text-brand-900">مشاريع نفّذناها باحترافية</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {settings.galleryImages.map((img, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-brand-200/60">
              <img src={img} alt="" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-900 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white">جاهز لبدء مشروعك؟</h2>
          <p className="mt-3 text-sm text-brand-200">أرسل طلبك الآن واحصل على رمز متابعة لتتبع مشروعك في كل مرحلة.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={scrollToForm} className="btn-gold animate-pulse text-base shadow-lg">
              <Camera className="h-5 w-5" /> اطلب مشروعك الآن
            </button>
            <Link to="/track" className="btn text-base bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20">
              <Search className="h-5 w-5" /> تتبع مشروع
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-100 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-900 text-gold-400">
                <Hammer className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-brand-900">ديكو ورشات</p>
            </div>
            <div className="flex gap-4 text-xs text-brand-500">
              <button onClick={scrollToForm} className="hover:text-emerald-600">طلب مشروع</button>
              <Link to="/track" className="hover:text-emerald-600">تتبع مشروع</Link>
            </div>
            <p className="flex items-center gap-1 text-xs text-brand-400">
              <Phone className="h-3 w-3" /> ديكو ورشات © 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function EmbeddedRequestForm({ settings, toast }: { settings: SiteSettings; toast: (m: string, t?: "success" | "error" | "info") => void }) {
  const [form, setForm] = useState({ name: "", phone: "", area: "", description: "" });
  const [selectedTypes, setSelectedTypes] = useState<WorkType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Project | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.phone.trim() && selectedTypes.length > 0;
  const toggleType = (t: WorkType) =>
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) { toast("يرجى إدخال الاسم والهاتف واختيار نوع العمل", "error"); return; }
    setSubmitting(true);
    try {
      const project = await api.projects.publicRequest({
        name: form.name.trim(),
        phone: form.phone.trim(),
        area: form.area.trim(),
        description: form.description.trim(),
        workTypes: selectedTypes,
      });
      setDone(project);
      toast("تم إرسال طلبك بنجاح", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذّر إرسال الطلب", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="card w-full p-8 text-center animate-scale-in">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="mt-6 text-2xl font-extrabold text-brand-900">تم استلام طلبك!</h3>
        <p className="mt-2 text-sm text-brand-500">احفظ رمز المتابعة أدناه لتتبع حالة مشروعك في أي وقت.</p>
        <div className="mt-6 rounded-2xl bg-brand-50 p-4">
          <p className="text-xs font-semibold text-brand-500">رمز المتابعة</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-2xl font-extrabold tracking-wider text-brand-900">{done.trackingCode}</span>
            <button
              onClick={() => { navigator.clipboard?.writeText(done.trackingCode); toast("تم نسخ الرمز", "success"); }}
              className="btn-ghost h-9 w-9 p-0" title="نسخ"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to={`/track?code=${done.trackingCode}`} className="btn-primary"><Search className="h-4 w-4" /> تتبع مشروعي الآن</Link>
          <button
            onClick={() => { setDone(null); setForm({ name: "", phone: "", area: "", description: "" }); setSelectedTypes([]); }}
            className="btn-outline"
          >
            <Send className="h-4 w-4" /> طلب جديد
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6 animate-slide-up">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="الاسم الكامل" required>
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="مثال: محمد الأمين" required />
        </Field>
        <Field label="رقم الهاتف" required>
          <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="مثال: 06 12 34 56 78" inputMode="tel" required />
        </Field>
      </div>

      <Field label="المساحة (م²)">
        <input className="input" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="مثال: 25,5 أو 30" inputMode="decimal" />
      </Field>

      <Field label="نوع العمل المطلوب" required>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TYPES.map((t) => {
            const active = selectedTypes.includes(t);
            return (
              <button
                key={t} type="button" onClick={() => toggleType(t)}
                className={
                  active
                    ? "flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700 transition"
                    : "flex items-center justify-center gap-2 rounded-xl border-2 border-brand-200 bg-white px-3 py-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
                }
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden">
                  <ServiceIcon value={settings.workTypeIcons[t]} className="h-6 w-6 text-base" />
                </span>
                {WORK_TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>
        {selectedTypes.length > 0 && (
          <p className="mt-2 text-xs text-emerald-600">تم اختيار {selectedTypes.length} نوع عمل</p>
        )}
      </Field>

      <Field label="تفاصيل إضافية (اختياري)">
        <textarea className="input min-h-[100px] resize-y" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="أي تفاصيل تساعد على فهم مشروعك..." />
      </Field>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={submitting || !valid}>
          {submitting ? <Spinner size={18} /> : <Send className="h-4 w-4" />}
          <span>{submitting ? "جارٍ الإرسال..." : "إرسال الطلب"}</span>
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-brand-800">
        {label}{required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
