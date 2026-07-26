import { useState } from 'react';
import { ProjectsList } from './ProjectsList';
import { WorkersList } from './WorkersList';
import { MaterialsList } from './MaterialsList';
import { ToastContainer } from './ui';

type AdminTab = 'projects' | 'workers' | 'materials';

const TABS: { key: AdminTab; label: string }[] = [
  { key: 'projects', label: 'المشاريع' },
  { key: 'workers', label: 'العمال' },
  { key: 'materials', label: 'المواد' },
];

interface Props {
  onExit: () => void;
}

export function AdminDashboard({ onExit }: Props) {
  const [tab, setTab] = useState<AdminTab>('projects');

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">DP</span>
          <span className="sidebar-name">ديكو ورشات</span>
        </div>
        <nav className="sidebar-nav">
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-role-btn" onClick={onExit}>← واجهة الزبون</button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>{TABS.find((t) => t.key === tab)?.label}</h1>
        </header>
        <div className="admin-content">
          {tab === 'projects' && <ProjectsList />}
          {tab === 'workers' && <WorkersList />}
          {tab === 'materials' && <MaterialsList />}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
