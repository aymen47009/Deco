import type { SiteConfig } from '../types';

interface HeroProps {
  config: SiteConfig;
  onOrder: () => void;
}

export function Hero({ config, onOrder }: HeroProps) {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${config.hero_image})` }} />
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="hero-badge">{config.brand_name}</span>
        <h1>{config.tagline}</h1>
        <p className="hero-subtitle">
          عمل احترافي — تسليم في الوقت المناسب — أسعار مناسبة
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={onOrder}>
            اطلب الآن
          </button>
          <a href="#portfolio" className="btn btn-ghost-light btn-lg">
            معرض أعمالنا
          </a>
        </div>
      </div>
    </section>
  );
}
