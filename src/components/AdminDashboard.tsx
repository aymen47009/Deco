import { useState } from 'react';
import { ProjectsManager } from './ProjectsManager';
import { WorkersManager } from './WorkersManager';
import { MaterialsManager } from './MaterialsManager';
import { GalleryManager } from './GalleryManager';
import { SiteSettings } from './SiteSettings';
import { ToastContainer } from './ui';

type Tab = 'projects' | 'workers' | 'materials' | 'gallery' | 'site';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'projects', label: 'المشاريع', icon: '📋' },
  { key: 'gallery', label: 'إدارة الصور', icon: '🖼' },
  { key: 'workers', label: 'العمال', icon: '👷' },
  { key: 'materials', label: 'المواد', icon: '📦' },
  { key: 'site', label: 'إعدادات الموقع', icon: '⚙' },
];

interface Props { onExit: () => void; }

export function AdminDashboard({ onExit }: Props) {
  const [tab, setTab] = useState<Tab>('projects');
  return (
    <div className="admin">
      <aside className="admin-side">
        <div className="admin-brand">
          <span className="admin-logo">D</span>
          <span className="admin-name">ديكو ورشات</span>
        </div>
        <nav className="admin-nav">
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
              <span className="nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-foot">
          <button className="admin-exit" onClick={onExit}>← العودة للموقع</button>
        </div>
      </aside>
      <main className="admin-body">
        <header className="admin-top">
          <h1>{TABS.find((t) => t.key === tab)?.label}</h1>
          <span className="admin-badge">لوحة التحكم</span>
        </header>
        <div className="admin-content">
          {tab === 'projects' && <ProjectsManager />}
          {tab === 'gallery' && <GalleryManager />}
          {tab === 'workers' && <WorkersManager />}
          {tab === 'materials' && <MaterialsManager />}
          {tab === 'site' && <SiteSettings />}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
