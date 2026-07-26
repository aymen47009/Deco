import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { Spinner, showToast } from './ui';
import {
  WORKSHOP_TYPES, WORKSHOP_TYPE_ICONS, SPACE_SIZES, DEFAULT_SITE_CONFIG,
  type Project, type ProjectInput, type SiteConfig, type SiteConfigInput,
} from '../types';

export function CustomerPortal() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [form, setForm] = useState<ProjectInput>({
    title: '',
    customer: '',
    phone: '',
    workshopTypes: [],
    spaceSize: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Project | null>(null);
  const orderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try { setConfig(await api.getSiteConfig()); }
      catch { setConfig(null); }
      finally { setLoading(false); }
    })();
  }, []);

  function toggleWorkshopType(type: string) {
    setForm((prev) => {
      const has = prev.workshopTypes.includes(type);
      return {
        ...prev,
        workshopTypes: has ? prev.workshopTypes.filter((t) => t !== type) : [...prev.workshopTypes, type],
      };
    });
  }

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
            <p>الاسم: {submitted.customer}</p>
            <p>الهاتف: {submitted.phone}</p>
            <p>المساحة: {submitted.spaceSize}</p>
            {submitted.workshopTypes.length > 0 && (
              <p>أنواع العمل: {submitted.workshopTypes.join('، ')}</p>
            )}
            <p className="order-success-note">سنتواصل معك قريباً على الرقم: {submitted.phone}</p>
            <button className="btn btn-primary btn-lg" onClick={() => {
              setSubmitted(null);
              setForm({ title: '', customer: '', phone: '', workshopTypes: [], spaceSize: '' });
            }}>طلب جديد</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-portal">
      {/* Hero */}
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

      {/* Services / Workshop Types */}
      <section className="services-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">خدماتنا</span>
            <h2>{cfg.servicesTitle}</h2>
            <p>{cfg.servicesSubtitle}</p>
          </div>
          <div className="services-grid">
            {WORKSHOP_TYPES.map((type) => (
              <div key={type} className="service-card">
                <div className="service-icon">{WORKSHOP_TYPE_ICONS[type] ?? '✨'}</div>
                <h3>{type}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {config && config.galleryImages.length > 0 && (
        <section className="gallery-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">أعمالنا</span>
              <h2>{cfg.galleryTitle}</h2>
              <p>{cfg.gallerySubtitle}</p>
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

      {/* Order Form */}
      <section className="order-section" ref={orderRef} id="order">
        <div className="container">
          <div className="order-card">
            <div className="section-header">
              <span className="section-tag">{cfg.ctaText}</span>
              <h2>{cfg.orderTitle}</h2>
              <p>{cfg.orderSubtitle}</p>
            </div>
            <form onSubmit={handleSubmit} className="order-form">
              <div className="order-form-field">
                <label>الاسم *</label>
                <input required value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="الاسم الكامل" />
              </div>
              <div className="order-form-field">
                <label>رقم الهاتف *</label>
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07XXXXXXXX" />
              </div>
              <div className="order-form-field form-field-full">
                <label>نوع العمل * <span className="field-hint">(يمكنك اختيار عدة أنواع)</span></label>
                <div className="multi-select-grid">
                  {WORKSHOP_TYPES.map((type) => {
                    const selected = form.workshopTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        className={`multi-select-chip ${selected ? 'selected' : ''}`}
                        onClick={() => toggleWorkshopType(type)}
                      >
                        <span className="chip-icon">{WORKSHOP_TYPE_ICONS[type] ?? '✨'}</span>
                        <span>{type}</span>
                        {selected && <span className="chip-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="order-form-field form-field-full">
                <label>المساحة *</label>
                <div className="radio-grid">
                  {SPACE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`radio-chip ${form.spaceSize === size ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, spaceSize: size })}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg order-submit-btn"
                disabled={submitting || form.workshopTypes.length === 0 || !form.spaceSize}
              >
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

      {/* Pulsing CTA */}
      <button
        className={`cta-bar ${cfg.ctaPulse ? 'cta-pulse' : ''}`}
        onClick={scrollToOrder}
      >
        <span className="cta-bar-icon">↑</span>
        <span className="cta-bar-text">{cfg.ctaText}</span>
      </button>
    </div>
  );
}
