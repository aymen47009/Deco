import { useState } from "react";
import { LogOut, Lock } from "lucide-react";
import { useAuth } from "./lib/auth";
import AdminDashboard from "./components/AdminDashboard";
import WorkerDashboard from "./components/WorkerDashboard";
import CustomerPortal from "./components/CustomerPortal";

export default function App() {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!user) {
    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      const r = login(email, password);
      if (!r.ok) setError(r.error ?? "خطأ");
    };
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-50 to-slate-100 p-4">
        <div className="card w-full max-w-sm p-6">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold">ديكو ورش</h1>
            <p className="text-sm text-slate-500">سجّل الدخول للمتابعة</p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@deco.sa" />
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin123" />
            </div>
            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
            <button className="btn-primary w-full" type="submit">دخول</button>
          </form>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-600">حسابات تجريبية:</p>
            <p>admin@deco.sa / admin123</p>
            <p>worker@deco.sa / worker123</p>
            <p>customer@deco.sa / cust123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white font-bold">د</div>
            <div>
              <p className="text-sm font-bold">ديكو ورش</p>
              <p className="text-xs text-slate-500">{roleLabel(user.role)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-600 sm:inline">{user.name}</span>
            <button className="btn-ghost text-xs" onClick={logout}>
              <LogOut className="h-4 w-4" /> خروج
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {user.role === "admin" && <AdminDashboard />}
        {user.role === "worker" && <WorkerDashboard workerId="w1" />}
        {user.role === "customer" && <CustomerPortal customerId="c1" />}
      </main>
    </div>
  );
}

function roleLabel(role: string): string {
  if (role === "admin") return "لوحة المدير";
  if (role === "worker") return "لوحة العامل";
  return "بوابة العميل";
}
