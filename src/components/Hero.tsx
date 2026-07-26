interface HeroProps {
  onOrder: () => void;
  lastCode: string | null;
}

export function Hero({ onOrder, lastCode }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <span className="hero-badge">ديكو وركشوبس</span>
        <h1>نحوّل مساحتك إلى تحفة</h1>
        <p className="hero-subtitle">
          تجديد وتشطيب داخلي احترافي — من التصميم إلى التسليم. تابع مشروعك لحظة بلحظة.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={onOrder}>
            ابدأ مشروعك الآن
          </button>
          {lastCode && (
            <div className="last-code-banner">
              <span>آخر كود مشروع:</span>
              <span className="mono">{lastCode}</span>
            </div>
          )}
        </div>
      </div>

      <div className="hero-features">
        <div className="hero-feature">
          <span className="feature-icon">🎨</span>
          <h3>تصميم مخصص</h3>
          <p>خطط تصميم تناسب ذوقك وميزانيتك</p>
        </div>
        <div className="hero-feature">
          <span className="feature-icon">👷</span>
          <h3>فريق محترف</h3>
          <p>عمال مهرة في كل التخصصات</p>
        </div>
        <div className="hero-feature">
          <span className="feature-icon">📱</span>
          <h3>تتبع مباشر</h3>
          <p>تابع تقدم مشروعك في أي وقت</p>
        </div>
      </div>
    </section>
  );
}
