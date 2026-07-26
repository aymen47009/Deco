import type { SiteConfig } from '../types';

export function About({ config }: { config: SiteConfig }) {
  return (
    <section className="about-section" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-content">
            <span className="section-tag">من نحن</span>
            <h2>{config.brand_name}</h2>
            <p>{config.about_text}</p>
            <ul className="about-features">
              <li>✓ عمل احترافي</li>
              <li>✓ تسليم في الوقت المناسب</li>
              <li>✓ أسعار مناسبة</li>
              <li>✓ مواد عالية الجودة</li>
              <li>✓ تتبع مباشر لمشروعك</li>
            </ul>
            <div className="about-contact">
              <a href={`tel:${config.phone}`} className="about-contact-item">📞 {config.phone}</a>
              <a href={`mailto:${config.email}`} className="about-contact-item">✉ {config.email}</a>
              <span className="about-contact-item">📍 {config.address}</span>
            </div>
          </div>
          <div className="about-image">
            <img src="https://images.pexels.com/photos/6969822/pexels-photo-6969822.jpeg?auto=compress&cs=tinysrgb&w=800" alt="فريق العمل" />
          </div>
        </div>
      </div>
    </section>
  );
}
