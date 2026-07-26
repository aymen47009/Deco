import { siteConfig } from '../config/site';

export function Services() {
  return (
    <section className="services-section" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">خدماتنا</span>
          <h2>ماذا نقدم لك؟</h2>
          <p>نوفر مجموعة متكاملة من خدمات التجديد والتشطيب بأعلى معايير الجودة</p>
        </div>
        <div className="services-grid">
          {siteConfig.services.map((s, i) => (
            <div key={i} className="service-card">
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
