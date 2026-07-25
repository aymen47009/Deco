import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, UserPlus, Users, Trash2, DollarSign, Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";
import type { User } from "../types";
import { api } from "../lib/api";
import { useToast } from "../lib/toast";
import { Spinner } from "../components/Spinner";
import { Modal } from "../components/Modal";

export function WorkersPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [workers, setWorkers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setDataLoading(true);
    try {
      const w = await api.workers.list();
      setWorkers(w);
    } catch (e) {
      toast(e instanceof Error ? e.message : "فشل تحميل العمال", "error");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) nav("/dashboard");
  }, [loading, user, nav]);

  useEffect(() => {
    if (user?.role === "admin") void load();
  }, [user]);

  if (loading) return <Spinner size={32} />;

  const handlePayDues = async (id: string) => {
    if (!confirm("تأكيد دفع جميع مستحقات هذا العامل؟")) return;
    try { await api.workers.payDues(id); toast("تم دفع المستحقات", "success"); void load(); }
    catch (e) { toast(e instanceof Error ? e.message : "فشل", "error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذا العامل؟")) return;
    try { await api.workers.remove(id); toast("تم حذف العامل", "success"); void load(); }
    catch (e) { toast(e instanceof Error ? e.message : "فشل", "error"); }
  };

  return (
    <div className="min-h-screen bg-brand-50">
      <header className="sticky top-0 z-40 border-b border-brand-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="text-sm font-semibold text-brand-600 hover:text-brand-900">
            <ArrowRight className="inline h-4 w-4" /> لوحة التحكم
          </Link>
          <h1 className="text-sm font-bold text-brand-900">إدارة العمال</h1>
          <button className="btn-primary text-xs" onClick={() => setShowAdd(true)}>
            <UserPlus className="h-4 w-4" /> عامل جديد
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {dataLoading ? (
          <Spinner size={28} />
        ) : workers.length === 0 ? (
          <div className="card grid place-items-center p-12 text-brand-400">
            <Users className="mb-2 h-10 w-10" />
            <p className="text-sm">لا يوجد عمال بعد</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {workers.map((w) => (
              <div key={w._id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-brand-900">{w.name}</p>
                    <p className="text-xs text-brand-500">{w.phone}</p>
                  </div>
                  <span className="chip bg-emerald-50 text-emerald-700">عامل</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-brand-50 p-2 text-center">
                    <p className="text-xs text-brand-500">إجمالي الأرباح</p>
                    <p className="font-bold text-brand-900">{w.totalEarnings || 0} دج</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-2 text-center">
                    <p className="text-xs text-amber-600">مستحقات معلقة</p>
                    <p className="font-bold text-amber-700">{w.pendingDues || 0} دج</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {(w.pendingDues || 0) > 0 && (
                    <button className="btn-emerald text-xs flex-1" onClick={() => handlePayDues(w._id)}>
                      <DollarSign className="h-3.5 w-3.5" /> دفع المستحقات
                    </button>
                  )}
                  <button className="btn-outline text-xs text-rose-600" onClick={() => handleDelete(w._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddWorkerModal
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); void load(); }}
        />
      )}
    </div>
  );
}

function AddWorkerModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name || !form.phone || !form.password) {
      toast("جميع الحقول مطلوبة", "error");
      return;
    }
    setSaving(true);
    try { await api.workers.create(form); toast("تمت إضافة العامل بنجاح", "success"); onAdded(); }
    catch (e) { toast(e instanceof Error ? e.message : "فشل", "error"); }
    finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title="إضافة عامل جديد">
      <div className="space-y-3">
        <div>
          <label className="label">الاسم</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">الهاتف</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="06xx xxx xxx" />
        </div>
        <div>
          <label className="label">كلمة المرور</label>
          <input className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        </div>
        <button className="btn-primary w-full" onClick={submit} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "إضافة"}
        </button>
      </div>
    </Modal>
  );
}
