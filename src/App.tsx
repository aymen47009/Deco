import { useState } from 'react';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';

type View = 'customer' | 'admin' | 'worker';

export default function App() {
  const [view, setView] = useState<View>('customer');
  const [workerId, setWorkerId] = useState<string>('');

  if (view === 'admin') return <AdminDashboard onExit={() => setView('customer')} />;
  if (view === 'worker') return <WorkerDashboard workerId={workerId} onExit={() => setView('customer')} />;

  return (
    <>
      <div className="role-switcher">
        <button className="role-btn" onClick={() => setView('admin')} title="لوحة الإدارة">⚙ الإدارة</button>
        <button className="role-btn" onClick={() => { const id = prompt('أدخل معرف العامل:'); if (id) { setWorkerId(id); setView('worker'); } }} title="بوابة العامل">👤 عامل</button>
      </div>
      <CustomerPortal />
    </>
  );
}
