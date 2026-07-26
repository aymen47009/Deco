import { useState } from 'react';
import type { PortfolioItem } from '../types';

export function Portfolio({ items }: { items: PortfolioItem[] }) {
  const categories = ['الكل', ...Array.from(new Set(items.map((p) => p.category)))];
  const [filter, setFilter] = useState('الكل');
  const shown = filter === 'الكل' ? items : items.filter((p) => p.category === filter);

  return (
    <section className="portfolio-section" id="portfolio">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">معرض الأعمال</span>
          <h2>أمثلة من أعمالنا</h2>
          <p>نماذج من المشاريع التي نفّذناها لعملائنا</p>
        </div>
        {categories.length > 1 && (
          <div className="portfolio-filters">
            {categories.map((c) => (
              <button key={c} className={filter === c ? 'active' : ''} onClick={() => setFilter(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="portfolio-grid">
          {shown.map((item) => (
            <div key={item.id} className="portfolio-card">
              <div className="portfolio-image-wrap">
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="portfolio-overlay">
                  <span className="portfolio-category">{item.category}</span>
                  {item.location && <span className="portfolio-location">📍 {item.location}</span>}
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
