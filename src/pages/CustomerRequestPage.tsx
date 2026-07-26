import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Send, Loader as Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../lib/toast";
import { ImageUploader } from "../components/ImageUploader";
import type { ProjectType } from "../types";
import { PROJECT_TYPE_LABELS } from "../types";

export function CustomerRequestPage() {
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    title: "",
    description: "",
    type: "decor" as ProjectType,
    area: 0,
  });
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name || !form.phone || !form.title) {
      toast("يرجى تعبئة الاسم، الهاتف، والعنوان", "error");
      return;
    }
    setSaving(true);
    try {
      await api.projects.publicRequest({ ...form, images });
      toast("تم إرسال طلبك بنجاح! سنتواصل معك قريباً", "success");
      nav("/");
    } catch (e) {
      toast(e instanceof Error ? e.message : "فشل الإرسال", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50">
      <header className="border-b border-brand-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-900">
            <ArrowRight className="inline h-4 w-4" /> العودة للرئيسية
          </Link>
          <h1 className="text-sm font-bold text-brand-900">طلب مشروع جديد</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="card p-6">
          <p className="mb-5 text-sm text-brand-500">
            املأ تفاصيل مشروعك وارفع صور مساحتك أو التصميم المرغوب. ستتواصل معك الإدارة بعد المراجعة.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">الاسم الكامل *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">الهاتف *</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="06xx xxx xxx" />
              </div>
              <div>
                <label className="label">المدينة</label>
                <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className="label">المساحة (م²)</label>
                <input type="number" className="input" value={form.area} onChange={(e) => setForm({ ...form, area: +e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">عنوان المشروع *</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: ديكور صالون + بلاكو بلاتر السقف" />
            </div>
            <div>
              <label className="label">نوع المشروع</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ProjectType })}>
                {Object.entries(PROJECT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">وصف المشروع</label>
              <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="اشرح فكرتك أو متطلباتك بالتفصيل..." />
            </div>
            <div>
              <label className="label">صور المساحة / التصميم المرغوب</label>
              <ImageUploader images={images} onChange={setImages} label="ارفع صور مساحتك أو تصميمك" />
            </div>
            <button className="btn-primary w-full" onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {saving ? "جارٍ الإرسال..." : "إرسال الطلب"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
