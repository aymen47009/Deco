import { Link } from "react-router-dom";
import { Hammer, Camera, Search, Sparkles, Phone, ShieldCheck, Clock, Award, ArrowLeft, CircleCheck as CheckCircle2, Ruler, Users } from "lucide-react";

const HERO_IMG = "https://images.pexels.com/photos/7567307/pexels-photo-7567307.jpeg?auto=compress&cs=tinysrgb&w=1400";
const WORK_IMG_1 = "https://images.pexels.com/photos/6492383/pexels-photo-6492383.jpeg?auto=compress&cs=tinysrgb&w=800";
const WORK_IMG_2 = "https://images.pexels.com/photos/5824477/pexels-photo-5824477.jpeg?auto=compress&cs=tinysrgb&w=800";
const WORK_IMG_3 = "https://images.pexels.com/photos/6492392/pexels-photo-6492392.jpeg?auto=compress&cs=tinysrgb&w=800";

const SERVICES = [
  { icon: "🧱", title: "بلاكو بلاتر", desc: "أسقف وجدران بلاكو بلاتر بأدق التفاصيل" },
  { icon: "⚪", title: "بي في سي السقف", desc: "أسقف بي في سي عصرية ومتينة" },
  { icon: "🪨", title: "سيباراسيون", desc: "فواصل وتقسيمات داخلية احترافية" },
  { icon: "◈", title: "بديل الرخام", desc: "أرضيات وجدران بديل الرخام الفاخر" },
  { icon: "🪵", title: "بديل الخشب", desc: "تشطيبات بديل الخشب الأنيق" },
];

const STEPS = [
  { icon: <Camera className="h-6 w-6" />, title: "اطلب مشروعك", desc: "املأ النموذج وارفع صور مساحتك — في دقائق فقط." },
  { icon: <Search className="h-6 w-6" />, title: "احصل على رمز المتابعة", desc: "نرسل لك رمزاً فريداً لتتبع مشروعك خطوة بخطوة." },
  { icon: <Hammer className="h-6 w-6" />, title: "ننفّذ باحترافية", desc: "فريقنا المتخصص ينفذ المشروع بأعلى معايير الجودة." },
  { icon: <CheckCircle2 className="h-6 w-6" />, title: "تابع وأنهِ", desc: "شاهد صور التقدم والإنجاز وأكّد التسليم بشفافية." },
];

export function HomePage() {
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
            <Link to="/request" className="btn-primary text-sm">
              <Camera className="h-4 w-4" /> اطلب الآن
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="h-full w-full object-cover" />
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
              من طلب الزبون إلى المصادقة النهائية — تابع كل خطوة في مشروعك بشفافية كاملة، واعرف حالة العمل في أي وقت.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/request" className="btn-primary text-base">
                <Camera className="h-5 w-5" /> اطلب مشروعك الآن
              </Link>
              <Link to="/track" className="btn text-base bg-white/10 text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/20">
                <Search className="h-5 w-5" /> تتبع مشروعي
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-brand-100">
              <span className="flex items-center gap-2"><Award className="h-4 w-4 text-gold-400" /> خبرة أكثر من 10 سنوات</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold-400" /> تسليم في الموعد</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold-400" /> ضمان الجودة</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <span className="chip bg-emerald-100 text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" /> خدماتنا
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-brand-900">أنواع الأعمال التي ننفّذها</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-brand-500">
            نختص في مجموعة واسعة من أعمال الديكور والتشطيب — اختر ما يناسب مشروعك.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICES.map((s) => (
            <div key={s.title} className="card p-5 text-center transition hover:shadow-md hover:-translate-y-1">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-2xl">
                {s.icon}
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
            <span className="chip bg-gold-100 text-gold-700">
              <Camera className="h-3.5 w-3.5" /> كيف نعمل
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-brand-900">من الطلب إلى التسليم في 4 خطوات</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={i} className="card relative p-6">
                <span className="absolute left-4 top-4 text-4xl font-extrabold text-brand-100">
                  {i + 1}
                </span>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                  {s.icon}
                </div>
                <h3 className="mt-4 font-bold text-brand-900">{s.title}</h3>
                <p className="mt-1 text-xs text-brand-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <span className="chip bg-emerald-100 text-emerald-700">
            <Award className="h-3.5 w-3.5" /> أعمالنا
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-brand-900">مشاريع نفّذناها باحترافية</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[WORK_IMG_1, WORK_IMG_2, WORK_IMG_3].map((img, i) => (
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
          <p className="mt-3 text-sm text-brand-200">
            أرسل طلبك الآن واحصل على رمز متابعة لتتبع مشروعك في كل مرحلة.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/request" className="btn-gold text-base">
              <Camera className="h-5 w-5" /> اطلب مشروعك الآن
            </Link>
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
              <Link to="/request" className="hover:text-emerald-600">طلب مشروع</Link>
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
