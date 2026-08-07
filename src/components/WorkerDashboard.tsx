import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Spinner, showToast, Modal } from './ui';
import {
  WORKER_ROLE_LABELS, PROJECT_STATUS_LABELS, PROJECT_STATUSES,
  type Worker, type Project, type ProjectStatus, type ProjectStage,
} from '../types';

type WorkerWithProjects = Worker & { assignedProjects: Project[] };

export function WorkerDashboard({ onExit }: { onExit: () => void }) {
  const [phone, setPhone] = useState('');
  const [worker, setWorker] = useState<WorkerWithProjects | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const w = await api.getWorkerByPhone(phone.trim());
      setWorker(w);
      showToast(`مرحباً ${w.name}`, 'success');
    } catch {
      showToast('رقم الهاتف غير مسجل', 'error');
    } finally { setLoading(false); }
  }

  if (!worker) {
    return (
      <div className="worker-login">
        <div className="worker-login-card">
          <div className="worker-login-logo">D</div>
          <h2>فضاء العامل</h2>
          <p className="worker-login-sub">أدخل رقم هاتفك للدخول</p>
          <form onSubmit={login} className="worker-login-form">
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX"
              dir="ltr"
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? <Spinner /> : 'دخول'}
            </button>
          </form>
          <button className="worker-login-exit" onClick={onExit}>← العودة للموقع</button>
        </div>
      </div>
    );
  }

  const activeProjects = worker.assignedProjects.filter((p) => !['completed', 'cancelled'].includes(p.status));
  const doneProjects = worker.assignedProjects.filter((p) => ['completed', 'cancelled'].includes(p.status));

  return (
    <div className="worker-dash">
      <header className="worker-head">
        <div className="worker-head-info">
          <div className="worker-avatar-lg">{worker.avatar ? <img src={worker.avatar} alt={worker.name} /> : worker.name.charAt(0)}</div>
          <div>
            <h1>{worker.name}</h1>
            <span className="worker-role-tag">{WORKER_ROLE_LABELS[worker.role]}</span>
          </div>
        </div>
        <button className="worker-logout" onClick={() => { setWorker(null); setPhone(''); }}>خروج</button>
      </header>

      <section className="worker-stats">
        <div className="worker-stat">
          <span className="worker-stat-num">{activeProjects.length}</span>
          <span className="worker-stat-label">مشاريع نشطة</span>
        </div>
        <div className="worker-stat">
          <span className="worker-stat-num">{doneProjects.length}</span>
          <span className="worker-stat-label">مشاريع منتهية</span>
        </div>
        <div className="worker-stat">
          <span className="worker-stat-num">{worker.assignedProjects.length}</span>
          <span className="worker-stat-label">إجمالي</span>
        </div>
      </section>

      <section className="worker-section">
        <h2 className="worker-section-title">المشاريع المسندة إليك</h2>
        {worker.assignedProjects.length === 0 ? (
          <div className="worker-empty">لا توجد مشاريع مسندة إليك حالياً</div>
        ) : (
          <div className="worker-projects">
            {worker.assignedProjects.map((p) => (
              <div key={p._id} className={`worker-project-card ${['completed', 'cancelled'].includes(p.status) ? 'is-done' : ''}`}>
                <div className="worker-project-head">
                  <h3>{p.title || p.customer.name}</h3>
                  <span className={`worker-status-badge worker-status-${p.status}`}>{PROJECT_STATUS_LABELS[p.status]}</span>
                </div>
                <div className="worker-project-meta">
                  <span>👤 {p.customer.name}</span>
                  <span>📞 <span dir="ltr">{p.customer.phone}</span></span>
                </div>
                <div className="worker-project-types">{p.workshopTypes.join(' • ')}</div>
                <div className="worker-project-space">المساحة: {p.spaceSize}</div>
                <div className="worker-progress">
                  <div className="worker-progress-bar" style={{ width: `${p.progress}%` }} />
                  <span>{p.progress}%</span>
                </div>
                {!['completed', 'cancelled'].includes(p.status) && (
                  <button className="btn btn-primary btn-sm btn-block worker-open-btn" onClick={() => setActiveProject(p)}>
                    إدارة المشروع
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {activeProject && (
        <WorkerProjectModal
          project={activeProject}
          workerName={worker.name}
          onClose={() => setActiveProject(null)}
        />
      )}
    </div>
  );
}

function WorkerProjectModal({ project, workerName, onClose }: { project: Project; workerName: string; onClose: () => void }) {
  const [tab, setTab] = useState<'actions' | 'media' | 'payment'>('actions');
  const [progress, setProgress] = useState(project.progress);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<Project | null>(null);

  // Media upload state
  const [stage, setStage] = useState<ProjectStage>('during');
  const [visible, setVisible] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Payment state
  const [payAmount, setPayAmount] = useState('');

  async function loadDetail() {
    try { setDetail(await api.getProject(project._id)); } catch { /* ignore */ }
  }

  useEffect(() => { loadDetail(); }, []);

  async function saveProgress() {
    setSaving(true);
    try {
      await api.updateProjectProgress(project._id, progress);
      showToast('تم تحديث التقدم', 'success');
      loadDetail();
    } catch { showToast('فشل', 'error'); }
    finally { setSaving(false); }
  }

  async function saveStatus() {
    setSaving(true);
    try {
      await api.updateProjectStatus(project._id, status);
      showToast('تم تحديث الحالة', 'success');
      loadDetail();
    } catch { showToast('فشل', 'error'); }
    finally { setSaving(false); }
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      await api.uploadProjectMedia(project._id, file, stage, visible, 'artisan');
      showToast('تم رفع الصورة', 'success');
      loadDetail();
    } catch { showToast('فشل الرفع', 'error'); }
    finally { setUploading(false); }
  }

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!payAmount) { showToast('أدخل المبلغ', 'error'); return; }
    setSaving(true);
    try {
      await api.addProjectPayment(project._id, { amount: Number(payAmount), collectedBy: 'artisan' });
      setPayAmount('');
      showToast('تم تسجيل الدفعة، بانتظار اعتماد الإدارة', 'success');
      loadDetail();
    } catch { showToast('فشل', 'error'); }
    finally { setSaving(false); }
  }

  const p = detail || project;

  return (
    <Modal open={true} title={`${p.title || p.customer.name}`} onClose={onClose} size="md">
      <div className="wp-tabs">
        {([
          ['actions', 'الحالة والتقدم'],
          ['media', 'رفع صور'],
          ['payment', 'تحصيل دفعة'],
        ] as const).map(([k, label]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      <div className="wp-body">
        {tab === 'actions' && (
          <div className="wp-actions">
            <div className="wp-field-group">
              <label>حالة المشروع</label>
              <select className="wp-select" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
                {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
              </select>
              <button className="btn btn-primary btn-sm btn-block" onClick={saveStatus} disabled={saving}>حفظ الحالة</button>
            </div>
            <div className="wp-field-group">
              <label>نسبة التقدم: {progress}%</label>
              <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="wp-range" />
              <button className="btn btn-primary btn-sm btn-block" onClick={saveProgress} disabled={saving}>حفظ التقدم</button>
            </div>
          </div>
        )}

        {tab === 'media' && (
          <div className="wp-media">
            <div className="wp-media-controls">
              <select value={stage} onChange={(e) => setStage(e.target.value as ProjectStage)}>
                <option value="before">قبل</option>
                <option value="during">أثناء</option>
                <option value="after">بعد</option>
              </select>
              <label className="check-label">
                <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
                ظاهر للزبون
              </label>
            </div>
            <label className="wp-upload-area">
              <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
              <div className="wp-upload-icon">{uploading ? '⏳' : '📷'}</div>
              <span>{uploading ? 'جاري الرفع...' : 'التقط صورة من الهاتف'}</span>
            </label>
            {p.media.length > 0 && (
              <div className="wp-media-grid">
                {p.media.map((m) => (
                  <div key={m._id} className="wp-media-thumb">
                    <img src={m.url} alt="" />
                    <span className="wp-media-stage">{m.stage === 'before' ? 'قبل' : m.stage === 'during' ? 'أثناء' : 'بعد'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'payment' && (
          <div className="wp-payment">
            <p className="wp-payment-info">سجل دفعة استلمتها نقداً من الزبون. سيتم إشعار الإدارة للاعتماد.</p>
            <form onSubmit={recordPayment} className="wp-pay-form">
              <input
                type="number"
                className="wp-pay-input"
                placeholder="المبلغ (دج)"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
              <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
                {saving ? 'جاري...' : 'تسجيل الدفعة'}
              </button>
            </form>
            {p.payments.filter((pay) => pay.collectedBy === 'artisan').length > 0 && (
              <div className="wp-pay-history">
                <h4>الدفعات التي سجلتها</h4>
                {p.payments.filter((pay) => pay.collectedBy === 'artisan').map((pay, i) => (
                  <div key={i} className="wp-pay-item">
                    <span>{pay.amount} دج</span>
                    {pay.isVerified
                      ? <span className="pdt-badge pdt-badge-ok">معتمدة</span>
                      : <span className="pdt-badge pdt-badge-pending">في الانتظار</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
