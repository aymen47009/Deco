import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema(
  {
    logo: { type: String, default: '' },
    brandName: { type: String, default: 'ديكو ورشات' },
    heroTitle: { type: String, default: 'إعادة التلبيس الداخلي للمنازل' },
    heroSubtitle: { type: String, default: 'بلاكو بلاتر، بديل الخشب، بديل الرخام، PVC، ديمونطابل' },
    heroTagline: { type: String, default: 'عمل احترافي — تسليم في الوقت — أسعار مناسبة' },
    heroBadge: { type: String, default: 'ديكو ورشات' },
    heroImage: { type: String, default: '' },
    servicesTitle: { type: String, default: 'أنواع العمل التي نقدمها' },
    servicesSubtitle: { type: String, default: 'نوفر مجموعة متكاملة من خدمات إعادة التلبيس' },
    galleryTitle: { type: String, default: 'معرض أعمالنا' },
    gallerySubtitle: { type: String, default: 'نماذج من إنجازاتنا السابقة' },
    orderTitle: { type: String, default: 'نموذج الطلب' },
    orderSubtitle: { type: String, default: 'املأ النموذج وسنتواصل معك في أقرب وقت' },
    ctaText: { type: String, default: 'اطلب الآن' },
    ctaPulse: { type: Boolean, default: true },
    footerText: { type: String, default: '© ديكو ورشات — جميع الحقوق محفوظة' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
  },
  { timestamps: true }
);

export const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);
