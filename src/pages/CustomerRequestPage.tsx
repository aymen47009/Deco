import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Camera, CircleCheck as CheckCircle2, Hammer, Loader as Loader2, Send } from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../lib/toast";
import { ImageUploader } from "../components/ImageUploader";
import { Spinner } from "../components/Spinner";
import type { ProjectType } from "../types";
import { PROJECT_TYPE_LABELS } from "../types";

const TYPES: ProjectType[] = ["decor", "placo", "pmma", "other"];

export function CustomerRequestPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    title: "",
    description: "",
    type: "decor" as ProjectType,
    area: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const valid = form.name.trim() && form.phone.trim() && form.title.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      toast("يرجى ملء الحقول المطلوبة", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.projects.publicRequest({
        name: form.name.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        area: Number(form.area) || 0,
        images,
      });
      setDone(true);
      toast("تم إرسال طلبك بنجاح", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "تعذّر إرسال الطلب", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-brand-50">
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

        <div className="mx-auto grid max-w-md place-items-center px-4 py-20 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-brand-900">تم استلام طلبك</h1>
          <p className="mt-2 text-sm text-brand-500">
            شكراً لك. ستراجع الإدارة طلبك وتتواصل معك في أقرب وقت على الرقم الذي أدخلته.
          </p>
          <div className="mt-8 flex gap-3">
            <button onClick={() => navigate("/")} className="btn-primary">
              <ArrowRight className="h-4 w-4" /> العودة للرئيسية
            </button>
            <button
              onClick={() => {
                setDone(false);
                setForm({ name: "", phone: "", city: "", title: "", description: "", type: "decor", area: "" });
                setImages([]);
              }}
              className="btn-outline"
            >
              <Send className="h-4 w-4" /> طلب جديد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-50">
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
          <Link to="/" className="btn-outline text-sm">
            <ArrowRight className="h-4 w-4" /> الرئيسية
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
            املأ النموذج أدناه وارفع صور مساحتك أو تصميمك المطلوب. ستتواصل معك الإدارة بعد مراجعة الطلب.
          </p>
        </div>

        <form onSubmit={submit} className="card mt-8 space-y-5 p-6">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="المدينة">
              <input
                className="input"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="مثال: الجزائر العاصمة"
              />
            </Field>
            <Field label="المساحة (م²)">
              <input
                className="input"
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                placeholder="مثال: 25"
                inputMode="numeric"
              />
            </Field>
          </div>

          <Field label="عنوان المشروع" required>
            <input
              className="input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="مثال: ديكور صالون بلاكو بلاتر"
              required
            />
          </Field>

          <Field label="نوع المشروع">
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  className={
                    form.type === t
                      ? "btn-primary text-xs"
                      : "btn-outline text-xs"
                  }
                >
                  {PROJECT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="تفاصيل المشروع">
            <textarea
              className="input min-h-[110px] resize-y"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="صف مشروعك: الغرف المطلوبة، الألوان، المواد، أي تفاصيل تساعد على الفهم..."
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
