import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Loader2, Phone, Lock } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!phone || !password) {
      toast("أدخل الهاتف وكلمة المرور", "error");
      return;
    }
    setSaving(true);
    try {
      await login(phone, password);
      toast("تم تسجيل الدخول بنجاح", "success");
      nav("/dashboard");
    } catch (e) {
      toast(e instanceof Error ? e.message : "فشل تسجيل الدخول", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-brand-50 px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-900 text-gold-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="text-right">
            <p className="font-bold text-brand-900">ديكو ورشات</p>
            <p className="text-xs text-brand-500">دخول الإدارة والعاملين</p>
          </div>
        </Link>

        <div className="card p-6">
          <h2 className="mb-1 text-lg font-bold text-brand-900">تسجيل الدخول</h2>
          <p className="mb-4 text-xs text-brand-500">أدخل بياناتك للوصول إلى لوحة التحكم</p>
          <div className="space-y-3">
            <div>
              <label className="label">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
                <input className="input pr-9" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06xx xxx xxx" />
              </div>
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
                <input type="password" className="input pr-9" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••••••" />
              </div>
            </div>
            <button className="btn-primary w-full" onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "دخول"}
            </button>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-brand-400">
          <Link to="/request" className="hover:text-emerald-600">طلب مشروع جديد؟ اضغط هنا</Link>
        </p>
      </div>
    </div>
  );
}
