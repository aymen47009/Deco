import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { Spinner, showToast } from './ui';
import { WORKSHOP_TYPES, SPACE_SIZES, DEFAULT_SITE_CONFIG, type Project, type ProjectInput, type SiteConfig, type SiteConfigInput } from '../types';

export function CustomerPortal() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [form, setForm] = useState<ProjectInput>({
    title: '',
    customer: '',
    phone: '',
    workshopType: '',
    spaceSize: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Project | null>(null);
  const orderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const c = await api.getSiteConfig();
        setConfig(c);
      } catch {
        setConfig(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const project = await api.createProject(form);
      setSubmitted(project);
      showToast('تم إرسال طلبك بنجاح', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'فشل إرسال الطلب', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function scrollToOrder() {
    orderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (loading) return <div className="page-loading"><Spinner label="جاري التحميل..." /></div>;

  const cfg: SiteConfigInput = config ?? DEFAULT_SITE_CONFIG;

  if (submitted) {
    return (
      <div className="customer-portal">
        <div className="success-overlay">
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
      </div>
    );
  }

  return (
    <div className="customer-portal">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg" style={cfg.heroImage ? { backgroundImage: `url(${cfg.heroImage})` } : undefined} />
        <div className="hero-overlay" />
        <div className="hero-content">
          {cfg.logo ? (
            <img src={cfg.logo} alt={cfg.brandName} className="hero-logo" />
          ) : (
            <span className="hero-badge">{cfg.heroBadge}</span>
          )}
          <h1>{cfg.heroTitle}</h1>
          <p className="hero-subtitle">{cfg.heroSubtitle}</p>
          <p className="hero-tagline">{cfg.heroTagline}</p>
        </div>
      </section>

      {/* Gallery Section */}
      {config && config.galleryImages.length > 0 && (
        <section className="gallery-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">أعمالنا</span>
              <h2>معرض الصور</h2>
            </div>
            <div className="gallery-grid">
              {config.galleryImages.map((img, i) => (
                <div key={i} className="gallery-item">
                  <img src={img} alt={`عمل ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Order Form Section */}
      <section className="order-section" ref={orderRef} id="order">
        <div className="container">
          <div className="order-card">
            <div className="section-header">
              <span className="section-tag">{cfg.ctaText}</span>
              <h2>{cfg.sectionTitle}</h2>
              <p>{cfg.sectionSubtitle}</p>
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
              <button type="submit" className="btn btn-primary btn-lg order-submit-btn" disabled={submitting}>
                {submitting ? <Spinner /> : 'إرسال الطلب'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-content">
            {cfg.logo && <img src={cfg.logo} alt={cfg.brandName} className="footer-logo" />}
            <p className="footer-brand">{cfg.brandName}</p>
            <p className="footer-text">{cfg.footerText}</p>
          </div>
        </div>
      </footer>

      {/* Pulsing CTA Button - fixed at bottom, spans full width */}
      <button
        className={`cta-bar ${cfg.ctaPulse ? 'cta-pulse' : ''}`}
        onClick={scrollToOrder}
      >
        <span className="cta-bar-icon">←</span>
        <span className="cta-bar-text">{cfg.ctaText}</span>
      </button>
    </div>
  );
}
