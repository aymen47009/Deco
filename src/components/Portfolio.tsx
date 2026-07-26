import { useState } from 'react';
import { siteConfig } from '../config/site';

export function Portfolio() {
  const categories = ['الكل', ...Array.from(new Set(siteConfig.portfolio.map((p) => p.category)))];
  const [filter, setFilter] = useState('الكل');

  const items =
    filter === 'الكل'
      ? siteConfig.portfolio
      : siteConfig.portfolio.filter((p) => p.category === filter);

  return (
    <section className="portfolio-section" id="portfolio">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">معرض الأعمال</span>
          <h2>أمثلة من أعمالنا</h2>
          <p>نماذج من المشاريع التي نفّذناها لعملائنا</p>
        </div>

        <div className="portfolio-filters">
          {categories.map((c) => (
            <button
              key={c}
              className={filter === c ? 'active' : ''}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="portfolio-grid">
          {items.map((item, i) => (
            <div key={i} className="portfolio-card">
              <div className="portfolio-image-wrap">
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="portfolio-overlay">
                  <span className="portfolio-category">{item.category}</span>
                  <span className="portfolio-location">📍 {item.location}</span>
                </div>
              </div>
              <div className="portfolio-info">
                <h3>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
