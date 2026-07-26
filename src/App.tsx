import { useState } from 'react';
import { Hero } from './components/Hero';
import { OrderForm } from './components/OrderForm';
import { ProjectsList } from './components/ProjectsList';
import { WorkersList } from './components/WorkersList';
import { MaterialsList } from './components/MaterialsList';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { ToastContainer } from './components/ui';

type View = 'home' | 'order' | 'projects' | 'workers' | 'materials' | 'track' | 'admin' | 'worker';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [lastCode, setLastCode] = useState<string | null>(null);

  function handleOrderDone() {
    setView('projects');
  }

  function handleOrderSubmit() {
    setLastCode('DW-' + String(Math.floor(Math.random() * 9000) + 1000));
  }

  const navItems: { key: View; label: string }[] = [
    { key: 'home', label: 'الرئيسية' },
    { key: 'order', label: 'طلب تصميم' },
    { key: 'projects', label: 'المشاريع' },
    { key: 'workers', label: 'العمال' },
    { key: 'materials', label: 'المخزون' },
    { key: 'track', label: 'تتبع مشروع' },
    { key: 'admin', label: 'لوحة الإدارة' },
    { key: 'worker', label: 'لوحة العامل' },
  ];

  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          <button className="brand" onClick={() => setView('home')}>
            <span className="brand-mark">DW</span>
            <span className="brand-name">ديكو وركشوبس</span>
          </button>
          <nav className="nav">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={view === item.key ? 'active' : ''}
                onClick={() => setView(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="container main">
        {view === 'home' && (
          <Hero onOrder={() => setView('order')} lastCode={lastCode} />
        )}
        {view === 'order' && (
          <OrderForm onDone={handleOrderDone} />
        )}
        {view === 'projects' && <ProjectsList />}
        {view === 'workers' && <WorkersList />}
        {view === 'materials' && <MaterialsList />}
        {view === 'track' && <CustomerPortal />}
        {view === 'admin' && <AdminDashboard onNavigate={(v) => setView(v as View)} />}
        {view === 'worker' && <WorkerDashboard />}
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} ديكو وركشوبس — جميع الحقوق محفوظة</p>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
}
