import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, StatusPill, EmptyState, showToast } from './ui';
import {
  PROJECT_STATUS_LABELS,
  WORK_TYPE_LABELS,
  type Project,
} from '../types';

export function CustomerPortal() {
  const [code, setCode] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.getProjectByCode(code.trim());
      setProject(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'لم يتم العثور على المشروع';
      setProject(null);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="customer-portal">
      <div className="card portal-card">
        <h2>تتبع مشروعك</h2>
        <p className="portal-desc">أدخل كود المشروع الذي حصلت عليه عند إنشاء الطلب لتتبع حالته وتقدمه.</p>
        <form onSubmit={handleSearch} className="portal-search">
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="مثال: DW-0001"
            className="portal-input"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري البحث...' : 'بحث'}
          </button>
        </form>
      </div>

      {loading && <Spinner label="جاري البحث..." />}

      {!loading && searched && !project && (
        <EmptyState title="لم يتم العثور على المشروع" message="تأكد من إدخال الكود الصحيح." />
      )}

      {!loading && project && <ProjectTracking project={project} />}
    </div>
  );
}

function ProjectTracking({ project }: { project: Project }) {
  const [timeline, setTimeline] = useState<{ label: string; done: boolean }[]>([]);

  useEffect(() => {
    const steps: { key: string; label: string }[] = [
      { key: 'new', label: 'استلام الطلب' },
      { key: 'in_review', label: 'مراجعة الطلب' },
      { key: 'approved', label: 'قبول الطلب' },
      { key: 'in_progress', label: 'بدء التنفيذ' },
      { key: 'review', label: 'مراجعة العمل' },
      { key: 'completed', label: 'التسليم' },
    ];
    const order = ['new', 'in_review', 'approved', 'in_progress', 'review', 'completed'];
    const currentIdx = order.indexOf(project.status);
    setTimeline(steps.map((s, i) => ({ label: s.label, done: i <= currentIdx })));
  }, [project.status]);

  return (
    <div className="card tracking-card">
      <div className="tracking-header">
        <div>
          <h3>{project.title}</h3>
          <span className="mono">{project.code}</span>
        </div>
        <StatusPill status={project.status} labels={PROJECT_STATUS_LABELS} />
      </div>

      <div className="tracking-info">
        <div className="info-item">
          <span className="info-label">نوع العمل</span>
          <span className="info-value">{WORK_TYPE_LABELS[project.workType]}</span>
        </div>
        <div className="info-item">
          <span className="info-label">الميزانية</span>
          <span className="info-value">{project.budget} د.أ</span>
        </div>
        <div className="info-item">
          <span className="info-label">التقدم</span>
          <span className="info-value">{project.progress}%</span>
        </div>
      </div>

      {project.description && (
        <div className="tracking-section">
          <h4>الوصف</h4>
          <p>{project.description}</p>
        </div>
      )}

      <div className="tracking-section">
        <h4>مراحل المشروع</h4>
        <div className="timeline">
          {timeline.map((step, i) => (
            <div key={i} className={`timeline-step ${step.done ? 'done' : ''}`}>
              <div className="timeline-dot" />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {project.assignedWorkers.length > 0 && (
        <div className="tracking-section">
          <h4>فريق العمل</h4>
          <div className="team-list">
            {project.assignedWorkers.map((w) => (
              <div key={w._id} className="team-member">
                <span className="member-avatar">{w.name.charAt(0)}</span>
                <span>{w.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.images.length > 0 && (
        <div className="tracking-section">
          <h4>صور المشروع</h4>
          <div className="image-grid">
            {project.images.map((img, i) => (
              <img key={i} src={img.url} alt={`صورة ${i + 1}`} />
            ))}
          </div>
        </div>
      )}

      {project.notes && (
        <div className="tracking-section">
          <h4>ملاحظات</h4>
          <p>{project.notes}</p>
        </div>
      )}
    </div>
  );
}
