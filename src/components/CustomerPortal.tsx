import { useState } from 'react';
import { api } from '../lib/api';
import { Spinner, EmptyState, showToast } from './ui';
import { PROJECT_STATUS_LABELS, type Project } from '../types';

export function CustomerPortal() {
  const [code, setCode] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true); setSearched(true);
    try {
      setProject(await api.getProjectByCode(code.trim()));
    } catch {
      setProject(null);
      showToast('لم يتم العثور على المشروع', 'error');
    } finally { setLoading(false); }
  }

  return (
    <div className="customer-portal">
      <div className="card portal-card">
        <h2>تتبع مشروعك</h2>
        <p className="portal-desc">أدخل كود المشروع لتتبع حالته</p>
        <form onSubmit={handleSearch} className="portal-search">
          <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="DW-0001" className="portal-input" />
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'بحث'}</button>
        </form>
      </div>
      {loading && <Spinner />}
      {!loading && searched && !project && <EmptyState title="لم يتم العثور على المشروع" />}
      {!loading && project && (
        <div className="card tracking-card">
          <div className="tracking-header">
            <div><h3>{project.title}</h3><span className="mono">{project.code}</span></div>
            <span className={`pill pill-${project.status}`}>{PROJECT_STATUS_LABELS[project.status]}</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${project.progress}%` }} /><span>{project.progress}%</span></div>
          {project.description && <p className="tracking-desc">{project.description}</p>}
        </div>
      )}
    </div>
  );
}
