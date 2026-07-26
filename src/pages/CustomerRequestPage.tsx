import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Camera, CircleCheck as CheckCircle2, Hammer, Send, Copy, Search,
} from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../lib/toast";
import { ImageUploader } from "../components/ImageUploader";
import { Spinner } from "../components/Spinner";
import type { WorkType, Project } from "../types";
import { WORK_TYPE_LABELS, WORK_TYPE_ICONS } from "../types";

const TYPES: WorkType[] = ["placo", "pvc", "separation", "marble", "wood"];

export function CustomerRequestPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    area: "",
    description: "",
  });
  const [selectedTypes, setSelectedTypes] = useState<WorkType[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Project | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const valid = form.name.trim() && form.phone.trim() && selectedTypes.length > 0;

  const toggleType = (t: WorkType) => {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      toast("يرجى إدخال الاسم والهاتف واختيار نوع العمل", "error");
      return;
    }
    setSubmitting(true);
    try {
      const project = await api.projects.publicRequest({
        name: form.name.trim(),
        phone: form.phone.trim(),
        area: form.area.trim(),
        description: form.description.trim(),
        workTypes: selectedTypes,
        images,
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
      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
        <header className="border-b border-brand-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-900 text-gold-400">
                <Hammer className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-brand-900">ديكو ورشات</p>
            </Link>
            <Link to="/" className="btn-outline text-sm">
              <ArrowRight className="h-4 w-4" /> العودة للرئيسية
            </Link>
          </div>
        </header>

        <div className="mx-auto grid max-w-lg place-items-center px-4 py-16">
          <div className="card w-full p-8 text-center animate-scale-in">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="mt-6 text-2xl font-extrabold text-brand-900">تم استلام طلبك!</h1>
            <p className="mt-2 text-sm text-brand-500">
              احفظ رمز المتابعة أدناه لتتبع حالة مشروعك في أي وقت.
            </p>

            <div className="mt-6 rounded-2xl bg-brand-50 p-4">
              <p className="text-xs font-semibold text-brand-500">رمز المتابعة</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-2xl font-extrabold tracking-wider text-brand-900">
                  {done.trackingCode}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(done.trackingCode);
                    toast("تم نسخ الرمز", "success");
                  }}
                  className="btn-ghost h-9 w-9 p-0"
                  title="نسخ"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => navigate(`/track?code=${done.trackingCode}`)}
                className="btn-primary"
              >
                <Search className="h-4 w-4" /> تتبع مشروعي الآن
              </button>
              <button
                onClick={() => {
                  setDone(null);
                  setForm({ name: "", phone: "", area: "", description: "" });
                  setSelectedTypes([]);
                  setImages([]);
                }}
                className="btn-outline"
              >
                <Send className="h-4 w-4" /> طلب جديد
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <header className="border-b border-brand-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-900 text-gold-400">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-900">ديكو ورشات</p>
              <p className="text-xs text-brand-500">طلب مشروع جديد</p>
            </div>
          </Link>
          <Link to="/track" className="btn-outline text-sm">
            <Search className="h-4 w-4" /> تتبع مشروع
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-4 py-10">
        <div className="text-center">
          <span className="chip bg-gold-100 text-gold-700">
            <Camera className="h-3.5 w-3.5" /> طلب الزبون
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-brand-900 sm:text-3xl">
            اطلب مشروعك الآن
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-brand-500">
            املأ النموذج أدناه وارفع صور مساحتك. ستتواصل معك الإدارة بعد مراجعة الطلب.
          </p>
        </div>

        <form onSubmit={submit} className="card mt-8 space-y-5 p-6 animate-slide-up">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم الكامل" required>
              <input
                className="input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="مثال: محمد الأمين"
                required
              />
            </Field>
            <Field label="رقم الهاتف" required>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="مثال: 06 12 34 56 78"
                inputMode="tel"
                required
              />
            </Field>
          </div>

          <Field label="المساحة (م²)">
            <input
              className="input"
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
              placeholder="مثال: 25,5 أو 30"
              inputMode="decimal"
            />
          </Field>

          <Field label="نوع العمل المطلوب" required>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TYPES.map((t) => {
                const active = selectedTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleType(t)}
                    className={
                      active
                        ? "flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700 transition"
                        : "flex items-center justify-center gap-2 rounded-xl border-2 border-brand-200 bg-white px-3 py-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
                    }
                  >
                    <span className="text-base">{WORK_TYPE_ICONS[t]}</span>
                    {WORK_TYPE_LABELS[t]}
                  </button>
                );
              })}
            </div>
            {selectedTypes.length > 0 && (
              <p className="mt-2 text-xs text-emerald-600">
                تم اختيار {selectedTypes.length} نوع عمل
              </p>
            )}
          </Field>

          <Field label="تفاصيل إضافية (اختياري)">
            <textarea
              className="input min-h-[100px] resize-y"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="أي تفاصيل تساعد على فهم مشروعك..."
            />
          </Field>

          <Field label="صور المساحة / التصميم">
            <ImageUploader images={images} onChange={setImages} multiple label="ارفع صور المساحة أو التصميم" />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/" className="btn-outline">
              <ArrowRight className="h-4 w-4" /> إلغاء
            </Link>
            <button type="submit" className="btn-primary" disabled={submitting || !valid}>
              {submitting ? <Spinner size={18} /> : <Send className="h-4 w-4" />}
              <span>{submitting ? "جارٍ الإرسال..." : "إرسال الطلب"}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-brand-800">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
