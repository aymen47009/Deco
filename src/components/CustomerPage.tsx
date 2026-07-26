import { useEffect, useRef, useState } from 'react';
import { db } from '../lib/db';
import { Hero } from './Hero';
import { Services } from './Services';
import { Portfolio } from './Portfolio';
import { Testimonials } from './Testimonials';
import { About } from './About';
import { OrderForm } from './OrderForm';
import { FloatingBar } from './FloatingBar';
import { Spinner, ToastContainer } from './ui';
import type { SiteConfig, Service, PortfolioItem, Testimonial } from '../types';
import { DEFAULT_CONFIG } from '../types';

export function CustomerPage() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const orderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, s, p, t] = await Promise.all([db.getConfig(), db.getServices(), db.getPortfolio(), db.getTestimonials()]);
        setConfig(c); setServices(s); setPortfolio(p); setTestimonials(t);
      } catch (err) { console.error('Failed to load content:', err); }
      finally { setLoading(false); }
    })();
  }, []);

  function scrollToOrder() { orderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  if (loading) return <div className="page-loading"><Spinner label="جاري التحميل..." /><ToastContainer /></div>;

  return (
    <div className="customer-page">
      <Hero config={config} onOrder={scrollToOrder} />
      <Services services={services} />
      <Portfolio items={portfolio} />
      <Testimonials items={testimonials} />
      <About config={config} />
      <div ref={orderRef}><OrderForm config={config} /></div>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-brand">
                <span className="footer-logo">{config.brand_logo}</span>
                <span className="footer-name">{config.brand_name}</span>
              </div>
              <p className="footer-desc">{config.tagline}</p>
            </div>
            <div className="footer-col">
              <h4>تواصل معنا</h4>
              <p>📞 {config.phone}</p>
              <p>✉ {config.email}</p>
              <p>📍 {config.address}</p>
            </div>
            <div className="footer-col">
              <h4>تابعنا</h4>
              <div className="footer-social">
                <a href={config.instagram} target="_blank" rel="noreferrer">إنستغرام</a>
                <a href={config.facebook} target="_blank" rel="noreferrer">فيسبوك</a>
                <a href={config.whatsapp} target="_blank" rel="noreferrer">واتساب</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom"><p>© {new Date().getFullYear()} {config.brand_name} — جميع الحقوق محفوظة</p></div>
        </div>
      </footer>
      <FloatingBar onClick={scrollToOrder} />
      <ToastContainer />
    </div>
  );
}
