import { siteConfig } from '../config/site';

interface HeroProps {
  onOrder: () => void;
}

export function Hero({ onOrder }: HeroProps) {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${siteConfig.heroImage})` }} />
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="hero-badge">{siteConfig.brand.name}</span>
        <h1>{siteConfig.brand.tagline}</h1>
        <p className="hero-subtitle">
          تجديد وتشطيب داخلي احترافي — من التصميم إلى التسليم بأعلى جودة وأفضل الأسعار
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={onOrder}>
            اطلب الآن
          </button>
          <a href="#portfolio" className="btn btn-ghost-light btn-lg">
            معرض أعمالنا
          </a>
        </div>
        <div className="hero-stats">
          {siteConfig.stats.map((s, i) => (
            <div key={i} className="hero-stat">
              <span className="hero-stat-value">{s.value}</span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
