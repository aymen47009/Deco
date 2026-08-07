import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Spinner, ConfirmDialog, EmptyState, showToast, Modal } from './ui';
import {
  PROJECT_STATUS_LABELS, PROJECT_STATUSES,
  type Project, type ProjectStatus,
  type ProjectMaterialInput, type Worker,
} from '../types';

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);

  async function load() {
    setLoading(true);
    try { setProjects(await api.getProjects(filter || undefined)); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filter]);

  async function handleStatus(id: string, status: ProjectStatus) {
    try { await api.updateProjectStatus(id, status); showToast('تم تحديث الحالة', 'success'); load(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  async function handleProgress(id: string, progress: number) {
    try { await api.updateProjectProgress(id, progress); load(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try { await api.deleteProject(confirmDelete._id); showToast('تم الحذف', 'success'); setConfirmDelete(null); load(); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل', 'error'); }
  }

  if (loading) return <Spinner label="جاري التحميل..." />;

  return (
    <div className="mgr-section">
      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">كل الحالات</option>
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
        </select>
        <span className="toolbar-count">{projects.length} مشروع</span>
      </div>
      {projects.length === 0 ? (
        <EmptyState title="لا توجد مشاريع" message="ستظهر هنا الطلبات المرسلة من الزبائن" />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>الاسم</th><th>الهاتف</th><th>أنواع العمل</th><th>المساحة</th>
                <th>المبلغ المتفق عليه</th><th>الحالة</th><th>التقدم</th><th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id}>
                  <td className="td-strong">{p.customer.name}</td>
                  <td dir="ltr">{p.customer.phone}</td>
                  <td>{p.workshopTypes.join('، ')}</td>
                  <td>{p.spaceSize}</td>
                  <td className="td-strong">{p.totalAgreedAmount ? `${p.totalAgreedAmount} دج` : '—'}</td>
                  <td>
                    <select className="status-select" value={p.status} onChange={(e) => handleStatus(p._id, e.target.value as ProjectStatus)}>
                      {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="progress-cell">
                      <input type="range" min={0} max={100} value={p.progress} onChange={(e) => handleProgress(p._id, Number(e.target.value))} />
                      <span>{p.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-ghost" onClick={() => setSelected(p)}>إدارة</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(p)}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selected && (
        <ProjectDetailModal
          project={selected}
          onClose={() => setSelected(null)}
          onChanged={() => { load(); }}
        />
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title="حذف"
        message={`حذف طلب "${confirmDelete?.customer.name}"؟`}
        confirmLabel="حذف"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function ProjectDetailModal({ project, onClose, onChanged }: { project: Project; onClose: () => void; onChanged: () => void }) {
  const [tab, setTab] = useState<'overview' | 'materials' | 'payments' | 'artisan' | 'media' | 'link'>('overview');
  const [workers] = useState<Worker[]>([]);
  const [detail, setDetail] = useState<Project | null>(null);

  async function loadDetail() {
    try {
      const d = await api.getProject(project._id);
      setDetail(d);
    } catch { /* ignore */ }
  }

  useEffect(() => { loadDetail(); }, []);

  const p = detail || project;
  const fin = p.financials;

  return (
    <Modal open={true} title={`مشروع ${p.code} — ${p.customer.name}`} onClose={onClose} size="lg">
      <div className="pdt-tabs">
        {([
          ['overview', 'نظرة عامة'],
          ['materials', 'المواد والتكلفة'],
          ['payments', 'الدفعات'],
          ['artisan', 'الحرفي والأجرة'],
          ['media', 'الصور'],
          ['link', 'رابط التتبع'],
        ] as const).map(([k, label]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      <div className="pdt-body">
        {tab === 'overview' && (
          <div className="pdt-overview">
            <div className="pdt-info-grid">
              <InfoRow label="الزبون" value={p.customer.name} />
              <InfoRow label="الهاتف" value={p.customer.phone} ltr />
              <InfoRow label="العنوان" value={p.customer.address || '—'} />
              <InfoRow label="أنواع العمل" value={p.workshopTypes.join('، ') || '—'} />
              <InfoRow label="المساحة" value={p.spaceSize} />
              <InfoRow label="المبلغ المتفق عليه" value={p.totalAgreedAmount ? `${p.totalAgreedAmount} دج` : 'غير محدد'} />
            </div>
            {fin && (
              <div className="pdt-fin-grid">
                <FinCard label="تكلفة المواد" value={fin.materialsCost} color="var(--err)" />
                <FinCard label="إجمالي المسدد" value={fin.totalPaid} color="var(--ok)" />
                <FinCard label="المتبقي" value={fin.remaining} color="var(--warn)" />
                <FinCard label="أجرة الحرفي" value={fin.artisanWage} color="var(--info)" />
                <FinCard label="الربح الصافي" value={fin.netProfit} color="var(--brand)" highlight />
              </div>
            )}
            <div className="pdt-edit-amount">
              <label>تعديل المبلغ المتفق عليه</label>
              <div className="pdt-edit-row">
                <input
                  type="number"
                  defaultValue={p.totalAgreedAmount || 0}
                  onBlur={async (e) => {
                    const val = Number(e.target.value);
                    if (val !== p.totalAgreedAmount) {
                      await api.updateProject(p._id, { totalAgreedAmount: val } as any);
                      showToast('تم تحديث المبلغ', 'success');
                      loadDetail(); onChanged();
                    }
                  }}
                />
                <span>دج</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'materials' && (
          <MaterialsTab project={p} onChanged={loadDetail} />
        )}

        {tab === 'payments' && (
          <PaymentsTab project={p} onChanged={loadDetail} />
        )}

        {tab === 'artisan' && (
          <ArtisanTab project={p} workers={workers} onChanged={loadDetail} />
        )}

        {tab === 'media' && (
          <MediaTab project={p} onChanged={loadDetail} />
        )}

        {tab === 'link' && (
          <div className="pdt-link-box">
            <p className="pdt-link-desc">رابط التتبع الخاص بهذا الزبون. شاركه معه لمتابعة المشروع:</p>
            <div className="pdt-link-row">
              <input readOnly value={`${window.location.origin}/#track/${p.trackingToken}`} dir="ltr" />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/#track/${p.trackingToken}`);
                  showToast('تم نسخ الرابط', 'success');
                }}
              >
                نسخ
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function InfoRow({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="pdt-info-row">
      <span className="pdt-info-label">{label}</span>
      <span className="pdt-info-value" dir={ltr ? 'ltr' : undefined}>{value}</span>
    </div>
  );
}

function FinCard({ label, value, color, highlight }: { label: string; value: number; color: string; highlight?: boolean }) {
  return (
    <div className={`pdt-fin-card ${highlight ? 'pdt-fin-highlight' : ''}`} style={{ borderRightColor: color }}>
      <span className="pdt-fin-label">{label}</span>
      <span className="pdt-fin-value" style={{ color }}>{value.toLocaleString()} دج</span>
    </div>
  );
}

function MaterialsTab({ project, onChanged }: { project: Project; onChanged: () => void }) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [sell, setSell] = useState('');
  const [qty, setQty] = useState('1');
  const [saving, setSaving] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !cost || !sell) { showToast('أدخل جميع الحقول', 'error'); return; }
    setSaving(true);
    try {
      await api.addProjectMaterial(project._id, {
        materialName: name.trim(),
        costPrice: Number(cost),
        sellPrice: Number(sell),
        quantity: Number(qty),
      });
      setName(''); setCost(''); setSell(''); setQty('1');
      showToast('تمت إضافة المادة', 'success');
      onChanged();
    } catch (e) { showToast('فشل', 'error'); }
    finally { setSaving(false); }
  }

  async function remove(index: number) {
    try {
      await api.removeProjectMaterial(project._id, index);
      showToast('تم الحذف', 'success');
      onChanged();
    } catch { showToast('فشل', 'error'); }
  }

  return (
    <div className="pdt-materials">
      <form className="pdt-mat-form" onSubmit={add}>
        <input className="pdt-mat-input" placeholder="اسم المادة" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="pdt-mat-input" type="number" placeholder="سعر التكلفة" value={cost} onChange={(e) => setCost(e.target.value)} />
        <input className="pdt-mat-input" type="number" placeholder="سعر البيع" value={sell} onChange={(e) => setSell(e.target.value)} />
        <input className="pdt-mat-input" type="number" placeholder="الكمية" value={qty} onChange={(e) => setQty(e.target.value)} />
        <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>إضافة</button>
      </form>
      {project.materials.length === 0 ? (
        <p className="pdt-empty">لا توجد مواد مسجلة</p>
      ) : (
        <table className="data-table">
          <thead><tr><th>المادة</th><th>التكلفة</th><th>البيع</th><th>الكمية</th><th>الإجمالي</th><th></th></tr></thead>
          <tbody>
            {project.materials.map((m, i) => (
              <tr key={i}>
                <td className="td-strong">{m.materialName}</td>
                <td>{m.costPrice} دج</td>
                <td>{m.sellPrice} دج</td>
                <td>{m.quantity}</td>
                <td>{m.costPrice * m.quantity} دج</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => remove(i)}>حذف</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PaymentsTab({ project, onChanged }: { project: Project; onChanged: () => void }) {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) { showToast('أدخل المبلغ', 'error'); return; }
    setSaving(true);
    try {
      await api.addProjectPayment(project._id, { amount: Number(amount), collectedBy: 'admin' });
      setAmount('');
      showToast('تم تسجيل الدفعة', 'success');
      onChanged();
    } catch { showToast('فشل', 'error'); }
    finally { setSaving(false); }
  }

  async function verify(payIndex: number) {
    try {
      await api.verifyProjectPayment(project._id, payIndex);
      showToast('تم اعتماد الدفعة', 'success');
      onChanged();
    } catch { showToast('فشل', 'error'); }
  }

  return (
    <div className="pdt-payments">
      <form className="pdt-pay-form" onSubmit={add}>
        <input className="pdt-mat-input" type="number" placeholder="مبلغ الدفعة (دج)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>تسجيل دفعة (الإدارة)</button>
      </form>
      {project.payments.length === 0 ? (
        <p className="pdt-empty">لا توجد دفعات مسجلة</p>
      ) : (
        <table className="data-table">
          <thead><tr><th>المبلغ</th><th>المستلم</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead>
          <tbody>
            {project.payments.map((pay, i) => (
              <tr key={i}>
                <td className="td-strong">{pay.amount} دج</td>
                <td>{pay.collectedBy === 'admin' ? 'الإدارة' : 'الحرفي'}</td>
                <td>
                  {pay.isVerified
                    ? <span className="pdt-badge pdt-badge-ok">معتمدة</span>
                    : <span className="pdt-badge pdt-badge-pending">في الانتظار</span>}
                </td>
                <td>{new Date(pay.date).toLocaleDateString('ar-DZ')}</td>
                <td>
                  {!pay.isVerified && pay.collectedBy === 'artisan' && (
                    <button className="btn btn-sm btn-ghost" onClick={() => verify(i)}>اعتماد</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ArtisanTab({ project, workers, onChanged }: { project: Project; workers: Worker[]; onChanged: () => void }) {
  const [wage, setWage] = useState(String(project.artisanDetails?.agreedWage || 0));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.updateArtisanWage(project._id, { agreedWage: Number(wage) });
      showToast('تم حفظ الأجرة', 'success');
      onChanged();
    } catch { showToast('فشل', 'error'); }
    finally { setSaving(false); }
  }

  async function togglePaid() {
    try {
      await api.updateArtisanWage(project._id, { agreedWage: Number(wage), isWagePaid: !project.artisanDetails?.isWagePaid });
      showToast('تم التحديث', 'success');
      onChanged();
    } catch { showToast('فشل', 'error'); }
  }

  return (
    <div className="pdt-artisan">
      <div className="pdt-artisan-row">
        <label>أجرة الحرفي المتفق عليها</label>
        <div className="pdt-edit-row">
          <input type="number" value={wage} onChange={(e) => setWage(e.target.value)} />
          <span>دج</span>
        </div>
      </div>
      <div className="pdt-artisan-actions">
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>حفظ الأجرة</button>
        <button
          className={`btn btn-sm ${project.artisanDetails?.isWagePaid ? 'btn-ghost' : 'btn-primary'}`}
          onClick={togglePaid}
        >
          {project.artisanDetails?.isWagePaid ? 'تم تسديد الأجرة' : 'تحديد كغير مسدد'}
        </button>
      </div>
      <div className="pdt-artisan-status">
        {project.artisanDetails?.isWagePaid
          ? <span className="pdt-badge pdt-badge-ok">الأجرة مسددة</span>
          : <span className="pdt-badge pdt-badge-pending">الأجرة غير مسددة</span>}
      </div>
    </div>
  );
}

function MediaTab({ project, onChanged }: { project: Project; onChanged: () => void }) {
  const [stage, setStage] = useState<'before' | 'during' | 'after'>('during');
  const [visible, setVisible] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      await api.uploadProjectMedia(project._id, file, stage, visible, 'admin');
      showToast('تم رفع الصورة', 'success');
      onChanged();
    } catch { showToast('فشل الرفع', 'error'); }
    finally { setUploading(false); }
  }

  async function removeMedia(mediaId: string) {
    try {
      await api.deleteProjectMedia(project._id, mediaId);
      showToast('تم الحذف', 'success');
      onChanged();
    } catch { showToast('فشل', 'error'); }
  }

  return (
    <div className="pdt-media">
      <div className="pdt-media-controls">
        <select value={stage} onChange={(e) => setStage(e.target.value as any)}>
          <option value="before">قبل</option>
          <option value="during">أثناء</option>
          <option value="after">بعد</option>
        </select>
        <label className="check-label">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          ظاهر للزبون
        </label>
        <label className="pdt-upload-btn">
          <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
          <span className="btn btn-primary btn-sm">{uploading ? 'جاري الرفع...' : 'رفع صورة'}</span>
        </label>
      </div>
      {project.media.length === 0 ? (
        <p className="pdt-empty">لا توجد صور</p>
      ) : (
        <div className="pdt-media-grid">
          {project.media.map((m) => (
            <div key={m._id} className="pdt-media-item">
              <img src={m.url} alt="" />
              <div className="pdt-media-overlay">
                <span>{m.stage === 'before' ? 'قبل' : m.stage === 'during' ? 'أثناء' : 'بعد'}</span>
                {m.visibleToClient && <span className="pdt-badge pdt-badge-ok">ظاهر</span>}
                <button className="btn btn-sm btn-danger" onClick={() => removeMedia(m._id)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
