import { useRef, useState } from 'react';
import { Hero } from './Hero';
import { Services } from './Services';
import { Portfolio } from './Portfolio';
import { Testimonials } from './Testimonials';
import { About } from './About';
import { OrderForm } from './OrderForm';
import { FloatingButton } from './FloatingButton';
import { siteConfig } from '../config/site';

export function CustomerPage() {
  const [showOrder, setShowOrder] = useState(false);
  const orderRef = useRef<HTMLDivElement>(null);

  function scrollToOrder() {
    setShowOrder(true);
    setTimeout(() => {
      orderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  return (
    <div className="customer-page">
      <Hero onOrder={scrollToOrder} />
      <Services />
      <Portfolio />
      <Testimonials />
      <About />

      <div ref={orderRef}>
        {showOrder && <OrderForm onDone={() => setShowOrder(false)} />}
      </div>

      <FloatingButton onClick={scrollToOrder} />

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-brand">
                <span className="footer-logo">{siteConfig.brand.logo}</span>
                <span className="footer-name">{siteConfig.brand.name}</span>
              </div>
              <p className="footer-desc">{siteConfig.brand.tagline}</p>
            </div>
            <div className="footer-col">
              <h4>تواصل معنا</h4>
              <p>📞 {siteConfig.brand.phone}</p>
              <p>✉ {siteConfig.brand.email}</p>
              <p>📍 {siteConfig.brand.address}</p>
            </div>
            <div className="footer-col">
              <h4>تابعنا</h4>
              <div className="footer-social">
                <a href={siteConfig.brand.instagram} target="_blank" rel="noreferrer">إنستغرام</a>
                <a href={siteConfig.brand.facebook} target="_blank" rel="noreferrer">فيسبوك</a>
                <a href={siteConfig.brand.whatsapp} target="_blank" rel="noreferrer">واتساب</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} {siteConfig.brand.name} — جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
