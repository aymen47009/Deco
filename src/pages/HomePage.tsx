import { Link } from "react-router-dom";
import {
  Hammer, Camera, ShieldCheck, Users, ArrowLeft, Sparkles, Phone,
} from "lucide-react";

export function HomePage() {
  return (
    <div className="min-h-screen bg-brand-50">
      <header className="border-b border-brand-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-900 text-gold-400">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-900">ديكو ورشات</p>
              <p className="text-xs text-brand-500">إدارة مشاريع الديكور والبلاكو بلاتر</p>
            </div>
          </div>
          <Link to="/login" className="btn-outline text-sm">
            <ShieldCheck className="h-4 w-4" /> دخول الإدارة
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center">
          <span className="chip bg-gold-100 text-gold-700">
            <Sparkles className="h-3.5 w-3.5" /> منصة إدارة احترافية
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-brand-900 sm:text-4xl">
            نُنفّذ مشاريع الديكور والبلاكو بلاتر
            <span className="block text-emerald-600">بأعلى جودة واحترافية</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-brand-500">
            من طلب الزبون إلى المصادقة النهائية — تابع كل خطوة في مشروعك مع شفافية كاملة.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/request" className="btn-primary">
              <Camera className="h-4 w-4" /> اطلب مشروعك الآن
            </Link>
            <Link to="/login" className="btn-outline">
              <ArrowLeft className="h-4 w-4" /> دخول العامل / الإدارة
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <FeatureCard icon={<Camera className="h-6 w-6 text-emerald-600" />} title="طلب الزبون" desc="املأ النموذج وارفع صور مساحتك أو تصميمك المطلوب مباشرة." />
          <FeatureCard icon={<Users className="h-6 w-6 text-gold-600" />} title="تعيين العامل" desc="تراجع الإدارة الطلب، تحدد السعر وتعيّن العامل المناسب." />
          <FeatureCard icon={<ShieldCheck className="h-6 w-6 text-brand-700" />} title="مصادقة ودفع" desc="بعد التنفيذ تتم المصادقة وتسوية المستحقات بشفافية." />
        </div>
      </section>

      <footer className="border-t border-brand-200 bg-white py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-brand-400">
          <p className="flex items-center justify-center gap-1">
            <Phone className="h-3 w-3" /> ديكو ورشات © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card p-5 transition hover:shadow-md">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50">{icon}</div>
      <h3 className="mt-3 font-bold text-brand-900">{title}</h3>
      <p className="mt-1 text-xs text-brand-500">{desc}</p>
    </div>
  );
}
