import { useState } from 'react';
import { api } from '../lib/api';
import { Spinner, showToast } from './ui';
import { WORKSHOP_TYPES, SPACE_SIZES, type Project, type ProjectInput } from '../types';

export function CustomerPortal() {
  const [form, setForm] = useState<ProjectInput>({
    title: '',
    customer: '',
    phone: '',
    workshopType: '',
    spaceSize: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<Project | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const project = await api.createProject(form);
      setSubmitted(project);
      showToast('تم إرسال طلبك بنجاح', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'فشل إرسال الطلب', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="customer-portal">
        <div className="order-success-card">
          <div className="order-success-icon">✓</div>
          <h2>تم استلام طلبك بنجاح!</h2>
          <p>عنوان المشروع: {submitted.title}</p>
          <p>الزبون: {submitted.customer}</p>
          <p>النوع: {submitted.workshopType}</p>
          <p className="order-success-note">سنتواصل معك قريباً على الرقم: {submitted.phone}</p>
          <button className="btn btn-primary btn-lg" onClick={() => {
            setSubmitted(null);
            setForm({ title: '', customer: '', phone: '', workshopType: '', spaceSize: '' });
          }}>طلب جديد</button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-portal">
      <section className="hero" id="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-badge">ديكو ورشات</span>
          <h1>ألواح جدارية احترافية — بلاكو بلاتر، بديل الخشب، بديل الرخام، PVC، ديمونطابل</h1>
          <p className="hero-subtitle">عمل احترافي — تسليم في الوقت المناسب — أسعار مناسبة</p>
        </div>
      </section>

      <section className="order-section" id="order">
        <div className="container">
          <div className="order-card">
            <div className="section-header">
              <span className="section-tag">اطلب الآن</span>
              <h2>نموذج طلب</h2>
              <p>املأ النموذج التالي وسنتواصل معك في أقرب وقت</p>
            </div>
            <form onSubmit={handleSubmit} className="order-form">
              <div className="order-form-field">
                <label>عنوان المشروع *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: تركيب بلاكو للصالة" />
              </div>
              <div className="order-form-field">
                <label>الاسم *</label>
                <input required value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="الاسم الكامل" />
              </div>
              <div className="order-form-field">
                <label>رقم الهاتف *</label>
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07XXXXXXXX" />
              </div>
              <div className="order-form-field">
                <label>نوع العمل *</label>
                <select required value={form.workshopType} onChange={(e) => setForm({ ...form, workshopType: e.target.value })}>
                  <option value="" disabled>اختر نوع العمل</option>
                  {WORKSHOP_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div className="order-form-field">
                <label>مساحة العمل</label>
                <select value={form.spaceSize} onChange={(e) => setForm({ ...form, spaceSize: e.target.value })}>
                  <option value="">اختر المساحة</option>
                  {SPACE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="order-form-field">
                <label>الميزانية (اختياري)</label>
                <input type="number" value={form.budget ?? ''} onChange={(e) => setForm({ ...form, budget: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div className="order-form-field form-field-full">
                <label>الوصف</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="تفاصيل إضافية عن المشروع" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg order-submit-btn" disabled={loading}>
                {loading ? <Spinner /> : 'إرسال الطلب'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} ديكو ورشات — جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
