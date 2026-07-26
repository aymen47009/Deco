import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, EmptyState } from './ui';
import {
  PROJECT_STATUS_LABELS,
  WORKER_STATUS_LABELS,
  type Project,
  type Worker,
  type Material,
} from '../types';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, w, m] = await Promise.all([api.getProjects(), api.getWorkers(), api.getMaterials()]);
        setProjects(p);
        setWorkers(w);
        setMaterials(m);
      } catch {
        // ignore — dashboard shows empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner label="جاري تحميل لوحة التحكم..." />;

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'in_progress' || p.status === 'approved').length,
    completedProjects: projects.filter((p) => p.status === 'completed').length,
    availableWorkers: workers.filter((w) => w.status === 'available').length,
    busyWorkers: workers.filter((w) => w.status === 'busy').length,
    lowStockMaterials: materials.filter((m) => m.lowStock).length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
  };

  const recentProjects = projects.slice(0, 5);
  const statusCounts = Object.keys(PROJECT_STATUS_LABELS).map((status) => ({
    status,
    label: PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS],
    count: projects.filter((p) => p.status === status).length,
  }));

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProjects}</span>
            <span className="stat-label">إجمالي المشاريع</span>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">🔧</div>
          <div className="stat-info">
            <span className="stat-value">{stats.activeProjects}</span>
            <span className="stat-label">مشاريع نشطة</span>
          </div>
        </div>
        <div className="stat-card stat-teal">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.completedProjects}</span>
            <span className="stat-label">مشاريع مكتملة</span>
          </div>
        </div>
        <div className="stat-card stat-amber">
          <div className="stat-icon">👷</div>
          <div className="stat-info">
            <span className="stat-value">{stats.availableWorkers}</span>
            <span className="stat-label">عمال متاحون</span>
          </div>
        </div>
        <div className="stat-card stat-red">
          <div className="stat-icon">⚠</div>
          <div className="stat-info">
            <span className="stat-value">{stats.lowStockMaterials}</span>
            <span className="stat-label">مواد منخفضة المخزون</span>
          </div>
        </div>
        <div className="stat-card stat-indigo">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalBudget.toLocaleString()}</span>
            <span className="stat-label">إجمالي الميزانية (د.أ)</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card dashboard-panel">
          <div className="panel-header">
            <h3>أحدث المشاريع</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => onNavigate('projects')}>
              عرض الكل
            </button>
          </div>
          {recentProjects.length === 0 ? (
            <EmptyState title="لا توجد مشاريع" />
          ) : (
            <ul className="recent-list">
              {recentProjects.map((p) => (
                <li key={p._id}>
                  <div className="recent-info">
                    <span className="recent-title">{p.title}</span>
                    <span className="recent-code mono">{p.code}</span>
                  </div>
                  <span className={`pill pill-${p.status}`}>{PROJECT_STATUS_LABELS[p.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card dashboard-panel">
          <div className="panel-header">
            <h3>توزيع حالات المشاريع</h3>
          </div>
          <div className="status-distribution">
            {statusCounts.map((s) => (
              <div key={s.status} className="dist-row">
                <span className="dist-label">
                  <span className={`pill pill-${s.status}`}>{s.label}</span>
                </span>
                <div className="dist-bar-wrap">
                  <div
                    className={`dist-bar pill-bg-${s.status}`}
                    style={{ width: `${stats.totalProjects ? (s.count / stats.totalProjects) * 100 : 0}%` }}
                  />
                </div>
                <span className="dist-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card dashboard-panel">
          <div className="panel-header">
            <h3>حالة العمال</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => onNavigate('workers')}>
              عرض الكل
            </button>
          </div>
          {workers.length === 0 ? (
            <EmptyState title="لا يوجد عمال" />
          ) : (
            <ul className="recent-list">
              {workers.slice(0, 5).map((w) => (
                <li key={w._id}>
                  <div className="recent-info">
                    <span className="recent-title">{w.name}</span>
                    <span className="recent-code">{w.assignedProjects.length} مشاريع</span>
                  </div>
                  <span className={`pill pill-${w.status}`}>{WORKER_STATUS_LABELS[w.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card dashboard-panel">
          <div className="panel-header">
            <h3>تنبيهات المخزون</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => onNavigate('materials')}>
              عرض الكل
            </button>
          </div>
          {stats.lowStockMaterials === 0 ? (
            <EmptyState title="لا توجد تنبيهات" message="كل المواد متوفرة بكميات كافية." />
          ) : (
            <ul className="recent-list">
              {materials.filter((m) => m.lowStock).map((m) => (
                <li key={m._id}>
                  <div className="recent-info">
                    <span className="recent-title">{m.name}</span>
                    <span className="recent-code">المتبقي: {m.stock} {m.unit}</span>
                  </div>
                  <span className="pill pill-low">منخفض</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
