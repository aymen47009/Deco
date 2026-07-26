import { useState } from 'react';
import { db } from '../lib/db';
import { WORKSHOP_TYPES, SPACE_SIZES, type SiteConfig, type ProjectInput } from '../types';

interface OrderFormProps {
  config: SiteConfig;
}

export function OrderForm({ config }: OrderFormProps) {
  const [form, setForm] = useState<ProjectInput>({ name: '', phone: '', workshop_type: '', space_size: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof ProjectInput>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const project = await db.createProject(form);
      setSuccess(project.code);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل إرسال الطلب');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="order-success" id="order">
        <div className="order-success-card">
          <div className="order-success-icon">✓</div>
          <h2>تم استلام طلبك بنجاح!</h2>
          <p>كود مشروعك هو:</p>
          <div className="order-code">{success}</div>
          <p className="order-success-note">احتفظ بهذا الكود لتتبع حالة مشروعك. سنتواصل معك قريباً.</p>
          <button className="btn btn-primary btn-lg" onClick={() => { setSuccess(null); setForm({ name: '', phone: '', workshop_type: '', space_size: '' }); }}>طلب جديد</button>
        </div>
      </div>
    );
  }

  return (
    <section className="order-section" id="order">
      <div className="container">
        <div className="order-card">
          <div className="section-header">
            <span className="section-tag">اطلب الآن</span>
            <h2>نموذج طلب</h2>
            <p>{config.order_intro}</p>
          </div>
          <form onSubmit={handleSubmit} className="order-form">
            <div className="order-form-field">
              <label>الاسم *</label>
              <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="الاسم الكامل" />
            </div>
            <div className="order-form-field">
              <label>رقم الهاتف *</label>
              <input required type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="07XXXXXXXX" />
            </div>
            <div className="order-form-field">
              <label>نوع العمل *</label>
              <select required value={form.workshop_type} onChange={(e) => update('workshop_type', e.target.value)}>
                <option value="" disabled>اختر نوع العمل</option>
                {WORKSHOP_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="order-form-field">
              <label>مساحة العمل *</label>
              <select required value={form.space_size} onChange={(e) => update('space_size', e.target.value)}>
                <option value="" disabled>اختر المساحة</option>
                {SPACE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-lg order-submit-btn" disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
