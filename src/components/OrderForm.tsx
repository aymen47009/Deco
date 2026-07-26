import { useState } from 'react';
import { api } from '../lib/api';
import { siteConfig } from '../config/site';
import type { WorkType } from '../types';

interface OrderFormProps {
  onDone: () => void;
}

export function OrderForm({ onDone }: OrderFormProps) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    workType: '',
    spaceSize: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const workTypeMap: Record<string, WorkType> = {
        'تجديد شامل': 'full_renovation',
        'مطبخ': 'kitchen',
        'حمام': 'bathroom',
        'دهانات': 'painting',
        'أرضيات': 'flooring',
        'أسقف': 'ceiling',
        'أخرى': 'custom',
      };
      const mappedWorkType = workTypeMap[form.workType] ?? 'custom';

      const project = await api.createProject({
        title: `${form.workType} — ${form.spaceSize}`,
        description: `مساحة العمل: ${form.spaceSize}`,
        customer: {
          name: form.name,
          phone: form.phone,
        },
        workType: mappedWorkType,
      });
      setSuccess(project.code);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل إرسال الطلب';
      alert(msg);
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
          <p className="order-success-note">
            احتفظ بهذا الكود لتتبع حالة مشروعك في أي وقت من صفحة "تتبع مشروع".
          </p>
          <button className="btn btn-primary btn-lg" onClick={onDone}>
            العودة للرئيسية
          </button>
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
            <h2>نموذج طلب تصميم</h2>
            <p>املأ النموذج التالي وسنتواصل معك في أقرب وقت</p>
          </div>
          <form onSubmit={handleSubmit} className="order-form">
            <div className="order-form-field">
              <label>الاسم *</label>
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="الاسم الكامل"
              />
            </div>

            <div className="order-form-field">
              <label>رقم الهاتف *</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="07XXXXXXXX"
              />
            </div>

            <div className="order-form-field">
              <label>نوع العمل *</label>
              <select required value={form.workType} onChange={(e) => update('workType', e.target.value)}>
                <option value="" disabled>اختر نوع العمل</option>
                {siteConfig.workTypes.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div className="order-form-field">
              <label>مساحة العمل *</label>
              <select required value={form.spaceSize} onChange={(e) => update('spaceSize', e.target.value)}>
                <option value="" disabled>اختر المساحة</option>
                {siteConfig.spaceSizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
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
