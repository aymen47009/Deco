import type { Testimonial } from '../types';

export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">آراء العملاء</span>
          <h2>ماذا يقول عملاؤنا؟</h2>
          <p>رضا عملائنا هو أكبر إنجازاتنا</p>
        </div>
        <div className="testimonials-grid">
          {items.map((t) => (
            <div key={t.id} className="testimonial-card">
              <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <img src={t.avatar} alt={t.name} />
                <div>
                  <span className="testimonial-name">{t.name}</span>
                  <span className="testimonial-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
