type Props = {
  onOrder: () => void
  lastCode: string | null
}

export function Hero({ onOrder, lastCode }: Props) {
  return (
    <section className="hero">
      <div className="hero-content">
        {lastCode && (
          <div className="success-banner">
            <strong>تم استلام طلبك بنجاح!</strong>
            <span>رقم طلبك: <code>{lastCode}</code></span>
            <p>احتفظ بهذا الرقم لمتابعة حالة طلبك لاحقاً.</p>
          </div>
        )}

        <span className="eyebrow">استوديو ديكور وتصميم</span>
        <h1>نحوّل مساحاتك إلى تصاميم استثنائية</h1>
        <p className="hero-lead">
          ديكو وركشوبس استوديو متخصص في التصميم الداخلي والخارجي وتصميم الأثاث.
          أرسل طلبك الآن واحصل على رقم مرجعي فريد لتتبع مشروعك خطوة بخطوة.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={onOrder}>
            ابدأ طلب تصميم
          </button>
        </div>

        <div className="hero-features">
          <div className="feature">
            <span className="feature-num">01</span>
            <h3>تصميم مخصص</h3>
            <p>كل مشروع يُصمم حسب ذوقك واحتياجاتك ومساحتك.</p>
          </div>
          <div className="feature">
            <span className="feature-num">02</span>
            <h3>رقم طلب فريد</h3>
            <p>يُولّد رقم مرجعي تلقائياً لكل طلب لتتبع سلس وسهل.</p>
          </div>
          <div className="feature">
            <span className="feature-num">03</span>
            <h3>متابعة دقيقة</h3>
            <p>تابع حالة طلبك من جديد إلى مكتمل في أي وقت.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
