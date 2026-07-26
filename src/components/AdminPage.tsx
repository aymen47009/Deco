import { useEffect, useState, useCallback } from 'react';
import { db } from '../lib/db';
import { ConfigEditor } from './ConfigEditor';
import { ServicesEditor } from './ServicesEditor';
import { PortfolioEditor } from './PortfolioEditor';
import { TestimonialsEditor } from './TestimonialsEditor';
import { ProjectsManager } from './ProjectsManager';
import { Spinner, ToastContainer } from './ui';
import type { SiteConfig, Service, PortfolioItem, Testimonial, Project } from '../types';
import { DEFAULT_CONFIG } from '../types';

type AdminTab = 'config' | 'services' | 'portfolio' | 'testimonials' | 'projects';

const TABS: { key: AdminTab; label: string }[] = [
  { key: 'config', label: 'الإعدادات والشعار' },
  { key: 'services', label: 'الخدمات' },
  { key: 'portfolio', label: 'معرض الأعمال' },
  { key: 'testimonials', label: 'آراء العملاء' },
  { key: 'projects', label: 'الطلبات الواردة' },
];

interface Props { onExit: () => void; }

export function AdminPage({ onExit }: Props) {
  const [tab, setTab] = useState<AdminTab>('config');
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const loadAll = useCallback(async () => {
    const [c, s, p, t] = await Promise.all([db.getConfig(), db.getServices(), db.getPortfolio(), db.getTestimonials()]);
    setConfig(c); setServices(s); setPortfolio(p); setTestimonials(t);
  }, []);

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    try { setProjects(await db.getProjects()); } catch (e) { console.error(e); } finally { setProjectsLoading(false); }
  }, []);

  useEffect(() => {
    (async () => {
      try { await loadAll(); await loadProjects(); } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, [loadAll, loadProjects]);

  if (loading) return <div className="page-loading"><Spinner label="جاري التحميل..." /><ToastContainer /></div>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">{config.brand_logo}</span>
          <span className="sidebar-name">{config.brand_name}</span>
        </div>
        <nav className="sidebar-nav">
          {TABS.map((t) => <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>{t.label}</button>)}
        </nav>
        <div className="sidebar-footer"><button className="sidebar-role-btn" onClick={onExit}>← واجهة الزبون</button></div>
      </aside>
      <main className="admin-main">
        <header className="admin-header"><h1>{TABS.find((t) => t.key === tab)?.label}</h1></header>
        <div className="admin-content">
          {tab === 'config' && <ConfigEditor config={config} onSaved={loadAll} />}
          {tab === 'services' && <ServicesEditor services={services} onChanged={loadAll} />}
          {tab === 'portfolio' && <PortfolioEditor items={portfolio} onChanged={loadAll} />}
          {tab === 'testimonials' && <TestimonialsEditor items={testimonials} onChanged={loadAll} />}
          {tab === 'projects' && <ProjectsManager projects={projects} loading={projectsLoading} onChanged={loadProjects} />}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
