import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api, clearAuthToken, getAuthToken } from '../lib/api';
import { Spinner, EmptyState, Modal, showToast } from './ui';
import { PROJECT_STATUS_LABELS, type Project, type ProjectStage } from '../types';

type AuthUser = { _id: string; name: string; phone: string; role: string };
type PortalTab = 'tasks' | 'media' | 'payments';

const STAGE_LABELS: Record<ProjectStage, string> = {
  before: 'قبل',
  during: 'أثناء',
  after: 'بعد',
};

export function ArtisanPortal({ onExit }: { onExit: () => void }) {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  async function refreshProjects() {
    const list = await api.getArtisanProjects();
    setProjects(list);
    if (selectedProject) {
      const updated = list.find((item) => item._id === selectedProject._id);
      if (updated) setSelectedProject(updated);
    }
  }

  async function bootstrap() {
    const token = getAuthToken();
    if (!token) {
      setBooting(false);
      return;
    }
    try {
      const me = await api.getAuthUser();
      setUser(me);
      await refreshProjects();
    } catch {
      clearAuthToken();
    } finally {
      setBooting(false);
    }
  }

  useEffect(() => {
    bootstrap();
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.loginArtisan(phone.trim(), password);
      setUser(result.user);
      await refreshProjects();
      showToast(`مرحباً ${result.user.name}`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'فشل الدخول', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (booting) return <Spinner label="جاري تحميل فضاء الحرفي..." />;

  if (!user) {
    return (
      <div className="worker-login">
        <div className="worker-login-card">
          <div className="worker-login-logo">A</div>
          <h2>فضاء الحرفي</h2>
          <p className="worker-login-sub">سجل الدخول لعرض المشاريع المسندة إليك</p>
          <form className="worker-login-form" onSubmit={handleLogin}>
            <input
              type="tel"
              dir="ltr"
              placeholder="رقم الهاتف"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              required
            />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'دخول'}
            </button>
          </form>
          <button className="worker-login-exit" onClick={onExit}>← العودة للموقع</button>
        </div>
      </div>
    );
  }

  const activeProjects = projects.filter((project) => !['completed', 'cancelled'].includes(project.status));
  const totalPayout = projects.reduce((sum, project) => sum + (project.totalArtisanPayout || 0), 0);

  return (
    <div className="worker-dash">
      <header className="worker-head">
        <div className="worker-head-info">
          <div className="worker-avatar-lg">{user.name.charAt(0)}</div>
          <div>
            <h1>{user.name}</h1>
            <div className="worker-role-tag">{user.phone}</div>
          </div>
        </div>
        <button
          className="worker-logout"
          onClick={() => {
            api.logoutArtisan();
            setUser(null);
            setPassword('');
            setPhone('');
            setProjects([]);
          }}
        >
          خروج
        </button>
      </header>

      <section className="worker-stats">
        <div className="worker-stat">
          <span className="worker-stat-num">{activeProjects.length}</span>
          <span className="worker-stat-label">مشاريع نشطة</span>
        </div>
        <div className="worker-stat">
          <span className="worker-stat-num">{projects.length}</span>
          <span className="worker-stat-label">إجمالي المشاريع</span>
        </div>
        <div className="worker-stat">
          <span className="worker-stat-num">{totalPayout.toLocaleString()}</span>
          <span className="worker-stat-label">إجمالي المستحقات دج</span>
        </div>
      </section>

      <section className="worker-section">
        <h2 className="worker-section-title">مشاريعي المسندة</h2>
        {projects.length === 0 ? (
          <EmptyState title="لا توجد مشاريع مسندة الآن" message="ستظهر المشاريع هنا عندما يعيّنها المدير" />
        ) : (
          <div className="worker-projects">
            {projects.map((project) => (
              <article key={project._id} className="worker-project-card">
                <div className="worker-project-head">
                  <h3>{project.customer.name}</h3>
                  <span className={`worker-status-badge worker-status-${project.status}`}>{PROJECT_STATUS_LABELS[project.status]}</span>
                </div>
                <div className="worker-project-meta">
                  <span>📞 <span dir="ltr">{project.customer.phone}</span></span>
                  <span>💰 {project.totalArtisanPayout.toLocaleString()} دج</span>
                </div>
                <div className="worker-project-types">{project.workshopTypes.join(' • ') || 'بدون أنواع عمل'}</div>
                <div className="worker-project-space">المساحة: {project.spaceSize}</div>
                <div className="worker-progress">
                  <div className="worker-progress-bar" style={{ width: `${project.progress}%` }} />
                  <span>{project.progress}%</span>
                </div>
                <button className="btn btn-primary btn-sm btn-block worker-open-btn" onClick={() => setSelectedProject(project)}>
                  فتح المشروع
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedProject && (
        <ArtisanProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onChanged={async () => { await refreshProjects(); }}
        />
      )}
    </div>
  );
}

function ArtisanProjectModal({ project, onClose, onChanged }: { project: Project; onClose: () => void; onChanged: () => void }) {
  const [tab, setTab] = useState<PortalTab>('tasks');
  const [detail, setDetail] = useState<Project>(project);
  const [taskName, setTaskName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [stage, setStage] = useState<ProjectStage>('during');
  const [visibleToClient, setVisibleToClient] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadDetail() {
    const updated = await api.getProject(project._id);
    setDetail(updated);
  }

  useEffect(() => {
    loadDetail().catch(() => undefined);
  }, []);

  async function addTask(e: FormEvent) {
    e.preventDefault();
    if (!taskName.trim() || !quantity || !unitPrice) {
      showToast('أدخل اسم المهمة والكمية والسعر', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.addArtisanTask(project._id, {
        taskName: taskName.trim(),
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
      });
      setTaskName('');
      setQuantity('1');
      setUnitPrice('');
      showToast('تمت إضافة المهمة', 'success');
      await loadDetail();
      onChanged();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'فشل', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function addPayment(e: FormEvent) {
    e.preventDefault();
    if (!paymentAmount) {
      showToast('أدخل مبلغ الدفعة', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.addArtisanPayment(project._id, Number(paymentAmount));
      setPaymentAmount('');
      showToast('تم تسجيل الدفعة غير المعتمدة', 'success');
      await loadDetail();
      onChanged();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'فشل', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function uploadMedia(file: File) {
    setUploading(true);
    try {
      await api.uploadArtisanMedia(project._id, file, stage, visibleToClient);
      showToast('تم رفع الصورة', 'success');
      await loadDetail();
      onChanged();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'فشل الرفع', 'error');
    } finally {
      setUploading(false);
    }
  }

  const p = detail;
  const ownPayments = useMemo(() => p.payments.filter((payment) => payment.collectedBy === 'artisan'), [p.payments]);

  return (
    <Modal open={true} title={`مشروع ${p.customer.name}`} onClose={onClose} size="lg">
      <div className="wp-tabs">
        {([
          ['tasks', 'المهام'],
          ['media', 'الصور'],
          ['payments', 'الدفعات'],
        ] as const).map(([key, label]) => (
          <button key={key} className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      <div className="wp-body">
        {tab === 'tasks' && (
          <div className="wp-actions">
            <div className="pdt-fin-grid">
              <div className="pdt-fin-card pdt-fin-highlight">
                <span className="pdt-fin-label">إجمالي مستحقات المهام</span>
                <span className="pdt-fin-value" style={{ color: 'var(--brand)' }}>{p.totalArtisanPayout.toLocaleString()} دج</span>
              </div>
              <div className="pdt-fin-card">
                <span className="pdt-fin-label">عدد المهام</span>
                <span className="pdt-fin-value">{p.artisanTasks.length}</span>
              </div>
            </div>

            <form className="wp-payment" onSubmit={addTask}>
              <input className="wp-pay-input" placeholder="اسم المهمة مثل: Separation PVC" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
              <div className="pdt-link-row">
                <input className="wp-pay-input" type="number" min="1" placeholder="الكمية" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                <input className="wp-pay-input" type="number" min="0" placeholder="سعر الوحدة" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={saving}>إضافة المهمة</button>
            </form>

            {p.artisanTasks.length === 0 ? (
              <EmptyState title="لا توجد مهام بعد" message="أضف أول مهمة ليتم احتساب مستحقاتك تلقائياً" />
            ) : (
              <div className="table-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>المهمة</th>
                      <th>الكمية</th>
                      <th>سعر الوحدة</th>
                      <th>الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.artisanTasks.map((task, index) => (
                      <tr key={`${task.taskName}-${index}`}>
                        <td className="td-strong">{task.taskName}</td>
                        <td>{task.quantity}</td>
                        <td>{task.unitPrice.toLocaleString()} دج</td>
                        <td>{task.totalTaskPrice.toLocaleString()} دج</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                <input type="checkbox" checked={visibleToClient} onChange={(e) => setVisibleToClient(e.target.checked)} />
                ظاهر للزبون
              </label>
            </div>
            <label className="wp-upload-area">
              <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadMedia(file); }} />
              <div className="wp-upload-icon">{uploading ? '⏳' : '📷'}</div>
              <span>{uploading ? 'جاري الرفع...' : 'رفع صورة من الهاتف'}</span>
            </label>
            {p.media.length === 0 ? (
              <EmptyState title="لا توجد صور" message="ارفع صور قبل أو أثناء أو بعد التنفيذ" />
            ) : (
              <div className="pdt-media-grid">
                {p.media.map((media) => (
                  <div key={media._id} className="pdt-media-item">
                    <img src={media.url} alt="" />
                    <div className="pdt-media-overlay">
                      <span>{STAGE_LABELS[media.stage]}</span>
                      {media.visibleToClient && <span className="pdt-badge pdt-badge-ok">ظاهر</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'payments' && (
          <div className="wp-payment">
            <p className="wp-payment-info">سجل دفعة نقدية جديدة، وستظل غير معتمدة إلى أن يراجعها المدير.</p>
            <form className="wp-pay-form" onSubmit={addPayment}>
              <input className="wp-pay-input" type="number" min="0" placeholder="المبلغ (دج)" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
              <button className="btn btn-primary btn-block" type="submit" disabled={saving}>تسجيل الدفعة</button>
            </form>
            <div className="wp-pay-history">
              <h4>الدفعات المسجلة</h4>
              {ownPayments.length === 0 ? (
                <EmptyState title="لا توجد دفعات بعد" />
              ) : (
                ownPayments.map((payment, index) => (
                  <div key={`${payment.amount}-${index}`} className="wp-pay-item">
                    <span>{payment.amount.toLocaleString()} دج</span>
                    {payment.isVerified ? (
                      <span className="pdt-badge pdt-badge-ok">معتمدة</span>
                    ) : (
                      <span className="pdt-badge pdt-badge-pending">غير معتمدة</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}