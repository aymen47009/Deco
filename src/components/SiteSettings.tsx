import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { Spinner, showToast } from './ui';
import { DEFAULT_SITE_CONFIG, type SiteConfig, type SiteConfigInput } from '../types';

export function SiteSettings() {
  const [form, setForm] = useState<SiteConfigInput>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const c = await api.getSiteConfig();
        setForm({
          logo: c.logo, brandName: c.brandName,
          heroTitle: c.heroTitle, heroSubtitle: c.heroSubtitle, heroTagline: c.heroTagline,
          heroBadge: c.heroBadge, heroImage: c.heroImage,
          servicesTitle: c.servicesTitle, servicesSubtitle: c.servicesSubtitle,
          galleryTitle: c.galleryTitle, gallerySubtitle: c.gallerySubtitle,
          orderTitle: c.orderTitle, orderSubtitle: c.orderSubtitle,
          ctaText: c.ctaText, ctaPulse: c.ctaPulse, footerText: c.footerText,
          phone: c.phone, whatsapp: c.whatsapp, instagram: c.instagram, facebook: c.facebook,
        });
      } catch { showToast('فشل تحميل الإعدادات', 'error'); }
      finally { setLoading(false); }
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    try { await api.updateSiteConfig(form); showToast('تم حفظ التغييرات', 'success'); }
    catch (e) { showToast(e instanceof Error ? e.message : 'فشل الحفظ', 'error'); }
    finally { setSaving(false); }
  }

  async function uploadLogo(file: File) {
    try {
      const { url } = await api.uploadSiteImage(file);
      setForm((p) => ({ ...p, logo: url }));
      showToast('تم رفع الشعار', 'success');
    } catch { showToast('فشل رفع الشعار', 'error'); }
  }

  if (loading) return <Spinner label="جاري التحميل..." />;

  return (
    <div className="settings">
      <div className="settings-save">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '...' : 'حفظ التغييرات'}</button>
      </div>

      <div className="card">
        <h3 className="card-h">الشعار والهوية</h3>
        <div className="logo-row">
          <div className="logo-preview">{form.logo ? <img src={form.logo} alt="logo" /> : <span>لا يوجد شعار</span>}</div>
          <div className="logo-actions">
            <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
            <button className="btn btn-ghost" onClick={() => logoRef.current?.click()}>رفع شعار</button>
            {form.logo && <button className="btn btn-danger" onClick={() => setForm({ ...form, logo: '' })}>حذف</button>}
          </div>
        </div>
        <div className="field"><label>اسم العلامة التجارية</label><input value={form.brandName ?? ''} onChange={(e) => setForm({ ...form, brandName: e.target.value })} /></div>
      </div>

      <div className="card">
        <h3 className="card-h">القسم الرئيسي</h3>
        <div className="field"><label>الشارة</label><input value={form.heroBadge ?? ''} onChange={(e) => setForm({ ...form, heroBadge: e.target.value })} /></div>
        <div className="field"><label>العنوان الرئيسي</label><input value={form.heroTitle ?? ''} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} /></div>
        <div className="field"><label>العنوان الفرعي</label><input value={form.heroSubtitle ?? ''} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} /></div>
        <div className="field"><label>الشعار النصي</label><input value={form.heroTagline ?? ''} onChange={(e) => setForm({ ...form, heroTagline: e.target.value })} /></div>
      </div>

      <div className="card">
        <h3 className="card-h">أقسام الموقع</h3>
        <div className="field"><label>عنوان قسم الخدمات</label><input value={form.servicesTitle ?? ''} onChange={(e) => setForm({ ...form, servicesTitle: e.target.value })} /></div>
        <div className="field"><label>وصف قسم الخدمات</label><input value={form.servicesSubtitle ?? ''} onChange={(e) => setForm({ ...form, servicesSubtitle: e.target.value })} /></div>
        <div className="field"><label>عنوان قسم المعرض</label><input value={form.galleryTitle ?? ''} onChange={(e) => setForm({ ...form, galleryTitle: e.target.value })} /></div>
        <div className="field"><label>وصف قسم المعرض</label><input value={form.gallerySubtitle ?? ''} onChange={(e) => setForm({ ...form, gallerySubtitle: e.target.value })} /></div>
        <div className="field"><label>عنوان قسم الطلب</label><input value={form.orderTitle ?? ''} onChange={(e) => setForm({ ...form, orderTitle: e.target.value })} /></div>
        <div className="field"><label>وصف قسم الطلب</label><input value={form.orderSubtitle ?? ''} onChange={(e) => setForm({ ...form, orderSubtitle: e.target.value })} /></div>
      </div>

      <div className="card">
        <h3 className="card-h">زر الطلب</h3>
        <div className="field"><label>نص الزر</label><input value={form.ctaText ?? ''} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} /></div>
        <div className="field"><label className="check-label"><input type="checkbox" checked={form.ctaPulse ?? true} onChange={(e) => setForm({ ...form, ctaPulse: e.target.checked })} /> تفعيل التوهج على الزر</label></div>
      </div>

      <div className="card">
        <h3 className="card-h">التذييل والتواصل</h3>
        <div className="field"><label>نص التذييل</label><input value={form.footerText ?? ''} onChange={(e) => setForm({ ...form, footerText: e.target.value })} /></div>
        <div className="field"><label>الهاتف</label><input value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
        <div className="field"><label>واتساب</label><input value={form.whatsapp ?? ''} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} dir="ltr" /></div>
        <div className="field"><label>انستغرام</label><input value={form.instagram ?? ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></div>
        <div className="field"><label>فيسبوك</label><input value={form.facebook ?? ''} onChange={(e) => setForm({ ...form, facebook: e.target.value })} /></div>
      </div>

      <div className="settings-save">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '...' : 'حفظ التغييرات'}</button>
      </div>
    </div>
  );
}
