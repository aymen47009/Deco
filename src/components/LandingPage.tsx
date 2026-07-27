import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { Spinner, showToast } from './ui';
import {
  WORKSHOP_TYPES, WORKSHOP_TYPE_ICONS, SPACE_SIZES, DEFAULT_SITE_CONFIG,
  type Project, type ProjectInput, type SiteConfig, type SiteConfigInput,
  type GalleryImage,
} from '../types';

export function LandingPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [heroImages, setHeroImages] = useState<GalleryImage[]>([]);
  const [form, setForm] = useState<ProjectInput>({
    title: '', customer: '', phone: '', workshopTypes: [], spaceSize: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Project | null>(null);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const orderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [cfg, gallery, hero] = await Promise.all([
          api.getSiteConfig().catch(() => null),
          api.getGalleryImages('gallery').catch(() => [] as GalleryImage[]),
          api.getGalleryImages('hero').catch(() => [] as GalleryImage[]),
        ]);
        setConfig(cfg);
        setGalleryImages(gallery);
        setHeroImages(hero);
      } finally { setLoading(false); }
    })();
  }, []);

  function toggleWorkshopType(type: string) {
    setForm((prev) => {
      const has = prev.workshopTypes.includes(type);
      return { ...prev, workshopTypes: has ? prev.workshopTypes.filter((t) => t !== type) : [...prev.workshopTypes, type] };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const projectData = { ...form, title: "طلب جديد: " + form.customer };
      const project = await api.createProject(projectData);
      setSubmitted(project);
      showToast('تم إرسال طلبك بنجاح', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'فشل إرسال الطلب', 'error');
    } finally { setSubmitting(false); }
  }

  function scrollToOrder() { orderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function goToAdmin() { window.location.hash = 'admin'; }

  if (loading) return <div className="page-loading"><Spinner label="جاري التحميل..." /></div>;

  const cfg: SiteConfigInput = config ?? DEFAULT_SITE_CONFIG;
  const heroBg = heroImages.length > 0 ? heroImages[0].url : cfg.heroImage;

  if (submitted) {
    return (
      <div className="landing">
        <div className="success-screen">
          <div className="success-card">
            <div className="success-check">✓</div>
            <h2>تم استلام طلبك بنجاح!</h2>
            <div className="success-details">
              <div className="success-row"><span>الاسم</span><strong>{submitted.customer}</strong></div>
              <div className="success-row"><span>الهاتف</span><strong dir="ltr">{submitted.phone}</strong></div>
              <div className="success-row"><span>المساحة</span><strong>{submitted.spaceSize}</strong></div>
              {submitted.workshopTypes.length > 0 && (
                <div className="success-row"><span>أنواع العمل</span><strong>{submitted.workshopTypes.join('، ')}</strong></div>
              )}
            </div>
            <p className="success-note">سنتواصل معك قريباً على الرقم: <span dir="ltr">{submitted.phone}</span></p>
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
    <div className="landing">
      <nav className="nav-bar">
        <div className="container nav-inner">
          <div className="nav-side nav-side-left">
            <div className="nav-links">
              <a href="#services">خدماتنا</a>
              <a href="#gallery">معرض الأعمال</a>
            </div>
          </div>
          <div className="nav-brand-center">
            {cfg.logo ? (
              <img src={cfg.logo} alt={cfg.brandName} className="nav-logo" />
            ) : (
              <span className="nav-logo-mark">{(cfg.brandName ?? 'D').charAt(0)}</span>
            )}
          </div>
          <div className="nav-side nav-side-right">
            <div className="nav-links">
              <a href="#order">اطلب الآن</a>
            </div>
            <button className="btn btn-primary btn-sm nav-cta" onClick={scrollToOrder}>{cfg.ctaText}</button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg" style={heroBg ? { backgroundImage: `url(${heroBg})` } : undefined} />
        <div className="hero-overlay" />
        <div className="container hero-content">
          {cfg.logo && <img src={cfg.logo} alt={cfg.brandName} className="hero-logo" />}
          <span className="hero-badge">{cfg.heroBadge}</span>
          <h1 className="hero-title">{cfg.heroTitle}</h1>
          <p className="hero-subtitle">{cfg.heroSubtitle}</p>
          <p className="hero-tagline">{cfg.heroTagline}</p>
          <button className="btn btn-primary btn-lg hero-cta" onClick={scrollToOrder}>
            {cfg.ctaText}
            <span className="btn-arrow">←</span>
          </button>
        </div>
        <div className="hero-scroll">↓</div>
      </section>

      <section className="section services-section" id="services">
        <div className="container">
          <div className="section-head">
            <span className="section-label">خدماتنا</span>
            <h2 className="section-title">{cfg.servicesTitle}</h2>
            <p className="section-desc">{cfg.servicesSubtitle}</p>
          </div>
          <div className="services-grid">
            {WORKSHOP_TYPES.map((type, i) => (
              <div className="service-card" key={type} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="service-icon-wrap">
                  <span className="service-icon">{cfg.serviceIcons?.[type] ? <img src={cfg.serviceIcons[type]} alt={type} className="service-icon-img" /> : (WORKSHOP_TYPE_ICONS[type] ?? '✨')}</span>
                </div>
                <h3 className="service-name">{type}</h3>
                <div className="service-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section gallery-section" id="gallery">
        <div className="container">
          <div className="section-head">
            <span className="section-label">أعمالنا</span>
            <h2 className="section-title">{cfg.galleryTitle}</h2>
            <p className="section-desc">{cfg.gallerySubtitle}</p>
          </div>
          {galleryImages.length > 0 ? (
            <div className="gallery-grid">
              {galleryImages.map((img, i) => (
                <div className="gallery-tile" key={img._id} onClick={() => setLightbox(img)} style={{ animationDelay: `${i * 60}ms` }}>
                  <img src={img.url} alt={img.title || `عمل ${i + 1}`} loading="lazy" />
                  <div className="gallery-overlay">
                    {img.title && <span className="gallery-title">{img.title}</span>}
                    <span className="gallery-zoom">🔍</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <p>سيتم عرض معرض الأعمال هنا بمجرد إضافة الصور من لوحة التحكم.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section order-section" id="order" ref={orderRef}>
        <div className="container">
          <div className="order-card">
            <div className="section-head section-head-light">
              <span className="section-label section-label-light">{cfg.ctaText}</span>
              <h2 className="section-title">{cfg.orderTitle}</h2>
              <p className="section-desc section-desc-light">{cfg.orderSubtitle}</p>
            </div>
            <form onSubmit={handleSubmit} className="order-form">
              <div className="form-row">
                <div className="form-group">
                  <label>الاسم الكامل *</label>
                  <input required value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="اكتب اسمك" />
                </div>
                <div className="form-group">
                  <label>رقم الهاتف *</label>
                  <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07XXXXXXXX" dir="ltr" />
                </div>
              </div>
              <div className="form-group">
                <label>نوع العمل * <span className="form-hint">(يمكنك اختيار عدة أنواع)</span></label>
                <div className="chips-grid">
                  {WORKSHOP_TYPES.map((type) => {
                    const selected = form.workshopTypes.includes(type);
                    return (
                      <button key={type} type="button" className={`chip ${selected ? 'chip-selected' : ''}`} onClick={() => toggleWorkshopType(type)}>
                        <span className="chip-icon">{cfg.serviceIcons?.[type] ? <img src={cfg.serviceIcons[type]} alt={type} className="chip-icon-img" /> : (WORKSHOP_TYPE_ICONS[type] ?? '✨')}</span>
                        <span>{type}</span>
                        {selected && <span className="chip-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="form-group">
                <label>المساحة *</label>
                <div className="chips-grid">
                  {SPACE_SIZES.map((size) => (
                    <button key={size} type="button" className={`chip ${form.spaceSize === size ? 'chip-selected' : ''}`} onClick={() => setForm({ ...form, spaceSize: size })}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting || form.workshopTypes.length === 0 || !form.spaceSize}>
                {submitting ? <Spinner /> : <>إرسال الطلب<span className="btn-arrow">←</span></>}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            {cfg.logo && <img src={cfg.logo} alt={cfg.brandName} className="footer-logo" />}
            <span className="footer-name">{cfg.brandName}</span>
          </div>
          <p className="footer-text">{cfg.footerText}</p>
          <div className="footer-links">
            <button className="footer-admin-link" onClick={goToAdmin}>لوحة التحكم</button>
            <button className="footer-admin-link" onClick={() => { window.location.hash = 'worker'; }}>فضاء العامل</button>
          </div>
        </div>
      </footer>

      <button className={`floating-cta ${cfg.ctaPulse ? 'cta-glow' : ''}`} onClick={scrollToOrder}>
        <span className="floating-cta-icon">↑</span>
        <span>{cfg.ctaText}</span>
      </button>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox.url} alt={lightbox.title || 'عمل'} />
          <button className="lightbox-close" onClick={() => setLightbox(null)}>×</button>
          {lightbox.title && <p className="lightbox-title">{lightbox.title}</p>}
        </div>
      )}
    </div>
  );
}
