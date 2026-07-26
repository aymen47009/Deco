import type { Service } from '../types';

export function Services({ services }: { services: Service[] }) {
  return (
    <section className="services-section" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">خدماتنا</span>
          <h2>ماذا نقدم لك؟</h2>
          <p>نوفر مجموعة متكاملة من خدمات الألواح الجدارية بأعلى معايير الجودة</p>
        </div>
        <div className="services-grid">
          {services.map((s) => (
            <div key={s.id} className="service-card">
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
