import { siteConfig } from '../config/site';

export function About() {
  return (
    <section className="about-section" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-content">
            <span className="section-tag">من نحن</span>
            <h2>{siteConfig.brand.name}</h2>
            <p>
              نحن شركة متخصصة في تجديد وتشطيب المساحات الداخلية والخارجية. لدينا فريق من
              العمال المحترفين في جميع التخصصات — نجارة، دهانات، كهرباء، سباكة، بلاط، وأكثر.
              نلتزم بأعلى معايير الجودة والوقت والسعر المناسب.
            </p>
            <ul className="about-features">
              <li>✓ فريق عمل محترف وذو خبرة</li>
              <li>✓ مواد عالية الجودة</li>
              <li>✓ التزام كامل بالمواعيد</li>
              <li>✓ أسعار تنافسية ومناسبة</li>
              <li>✓ تتبع مباشر لمشروعك</li>
              <li>✓ ضمان على العمل</li>
            </ul>
            <div className="about-contact">
              <a href={`tel:${siteConfig.brand.phone}`} className="about-contact-item">
                📞 {siteConfig.brand.phone}
              </a>
              <a href={`mailto:${siteConfig.brand.email}`} className="about-contact-item">
                ✉ {siteConfig.brand.email}
              </a>
              <span className="about-contact-item">📍 {siteConfig.brand.address}</span>
            </div>
          </div>
          <div className="about-image">
            <img
              src="https://images.pexels.com/photos/6969822/pexels-photo-6969822.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="فريق العمل"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
