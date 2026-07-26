import { useState } from 'react';
import { CustomerPage } from './components/CustomerPage';
import { ProjectsList } from './components/ProjectsList';
import { WorkersList } from './components/WorkersList';
import { MaterialsList } from './components/MaterialsList';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { ToastContainer } from './components/ui';
import { siteConfig } from './config/site';

type Role = 'customer' | 'admin' | 'worker';
type AdminView = 'dashboard' | 'projects' | 'workers' | 'materials' | 'track';

export default function App() {
  const [role, setRole] = useState<Role>('customer');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');

  if (role === 'customer') {
    return (
      <>
        <RoleSwitcher role={role} setRole={setRole} />
        <CustomerPage />
        <ToastContainer />
      </>
    );
  }

  const adminNavItems: { key: AdminView; label: string }[] = [
    { key: 'dashboard', label: 'لوحة التحكم' },
    { key: 'projects', label: 'المشاريع' },
    { key: 'workers', label: 'العمال' },
    { key: 'materials', label: 'المخزون' },
    { key: 'track', label: 'تتبع مشروع' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">{siteConfig.brand.logo}</span>
          <span className="sidebar-name">{siteConfig.brand.name}</span>
        </div>
        <nav className="sidebar-nav">
          {adminNavItems.map((item) => (
            <button
              key={item.key}
              className={adminView === item.key ? 'active' : ''}
              onClick={() => setAdminView(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-role-btn" onClick={() => setRole('customer')}>واجهة الزبون</button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>{adminNavItems.find((n) => n.key === adminView)?.label}</h1>
          <RoleSwitcher role={role} setRole={setRole} />
        </header>
        <div className="admin-content">
          {adminView === 'dashboard' && <AdminDashboard />}
          {adminView === 'projects' && <ProjectsList />}
          {adminView === 'workers' && <WorkersList />}
          {adminView === 'materials' && <MaterialsList />}
          {adminView === 'track' && <CustomerPortal />}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}

function RoleSwitcher({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  return (
    <div className="role-switcher">
      <button className={role === 'customer' ? 'active' : ''} onClick={() => setRole('customer')}>الزبون</button>
      <button className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>الإدارة</button>
      <button className={role === 'worker' ? 'active' : ''} onClick={() => setRole('worker')}>العامل</button>
    </div>
  );
}
