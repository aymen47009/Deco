import { useState } from 'react';
import { db } from '../lib/db';
import { showToast } from './ui';
import type { SiteConfig } from '../types';

interface Props {
  config: SiteConfig;
  onSaved: () => void;
}

export function ConfigEditor({ config, onSaved }: Props) {
  const [form, setForm] = useState<SiteConfig>(config);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof SiteConfig>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await db.updateConfig({
        brand_name: form.brand_name, brand_logo: form.brand_logo, tagline: form.tagline,
        hero_image: form.hero_image, phone: form.phone, email: form.email, address: form.address,
        instagram: form.instagram, facebook: form.facebook, whatsapp: form.whatsapp,
        about_text: form.about_text, order_intro: form.order_intro,
      });
      showToast('تم حفظ الإعدادات', 'success');
      onSaved();
    } catch (err) { showToast(err instanceof Error ? err.message : 'فشل الحفظ', 'error'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={save} className="config-editor">
      <div className="form-grid">
        <div className="form-field"><label>اسم الشركة</label><input value={form.brand_name} onChange={(e) => update('brand_name', e.target.value)} /></div>
        <div className="form-field"><label>الشعار (نص أو حرفين)</label><input value={form.brand_logo} onChange={(e) => update('brand_logo', e.target.value)} maxLength={4} /></div>
        <div className="form-field form-field-full"><label>الوصف الرئيسي</label><input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} /></div>
        <div className="form-field form-field-full"><label>رابط صورة الواجهة الرئيسية</label><input value={form.hero_image} onChange={(e) => update('hero_image', e.target.value)} />{form.hero_image && <img src={form.hero_image} alt="معاينة" className="image-preview" />}</div>
        <div className="form-field"><label>الهاتف</label><input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
        <div className="form-field"><label>البريد الإلكتروني</label><input value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
        <div className="form-field"><label>العنوان</label><input value={form.address} onChange={(e) => update('address', e.target.value)} /></div>
        <div className="form-field"><label>رابط إنستغرام</label><input value={form.instagram} onChange={(e) => update('instagram', e.target.value)} /></div>
        <div className="form-field"><label>رابط فيسبوك</label><input value={form.facebook} onChange={(e) => update('facebook', e.target.value)} /></div>
        <div className="form-field"><label>رابط واتساب</label><input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} /></div>
        <div className="form-field form-field-full"><label>نص "من نحن"</label><textarea rows={4} value={form.about_text} onChange={(e) => update('about_text', e.target.value)} /></div>
        <div className="form-field form-field-full"><label>نص مقدمة نموذج الطلب</label><input value={form.order_intro} onChange={(e) => update('order_intro', e.target.value)} /></div>
      </div>
      <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</button></div>
    </form>
  );
}
