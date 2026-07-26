import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { Spinner, showToast } from './ui';
import { DEFAULT_SITE_CONFIG, type SiteConfig, type SiteConfigInput } from '../types';

export function SiteEditor() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [form, setForm] = useState<SiteConfigInput>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const c = await api.getSiteConfig();
        setConfig(c);
        setForm({
          logo: c.logo, brandName: c.brandName,
          heroTitle: c.heroTitle, heroSubtitle: c.heroSubtitle, heroTagline: c.heroTagline,
          heroBadge: c.heroBadge, heroImage: c.heroImage,
          servicesTitle: c.servicesTitle, servicesSubtitle: c.servicesSubtitle,
          galleryTitle: c.galleryTitle, gallerySubtitle: c.gallerySubtitle,
          orderTitle: c.orderTitle, orderSubtitle: c.orderSubtitle,
          ctaText: c.ctaText, ctaPulse: c.ctaPulse,
          footerText: c.footerText,
          phone: c.phone, whatsapp: c.whatsapp, instagram: c.instagram, facebook: c.facebook,
        });
      } catch { showToast('فشل تحميل الإعدادات', 'error'); }
      finally { setLoading(false); }
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.updateSiteConfig(form);
      setConfig(updated);
      showToast('تم حفظ التغييرات', 'success');
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل الحفظ', 'error'); }
    finally { setSaving(false); }
  }

  async function uploadImage(file: File, field: 'logo' | 'heroImage') {
    try {
      const { url } = await api.uploadSiteImage(file);
      setForm((prev) => ({ ...prev, [field]: url }));
      showToast('تم رفع الصورة', 'success');
    } catch { showToast('فشل رفع الصورة', 'error'); }
  }

  async function addGalleryImage(file: File) {
    try { const updated = await api.addGalleryImage(file); setConfig(updated); showToast('تمت إضافة الصورة', 'success'); }
    catch { showToast('فشل رفع الصورة', 'error'); }
  }

  async function removeGalleryImage(index: number) {
    try { const updated = await api.removeGalleryImage(index); setConfig(updated); showToast('تم حذف الصورة', 'success'); }
    catch { showToast('فشل الحذف', 'error'); }
  }

  if (loading) return <Spinner label="جاري التحميل..." />;

  return (
    <div className="site-editor">
      <div className="site-editor-actions">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '...' : 'حفظ التغييرات'}</button>
      </div>

      <div className="card editor-card">
        <h3>الشعار (Logo)</h3>
        <div className="image-upload-row">
          <div className="image-preview">{form.logo ? <img src={form.logo} alt="logo" /> : <div className="image-placeholder">لا يوجد شعار</div>}</div>
          <div className="upload-controls">
            <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'logo'); }} />
            <button className="btn btn-ghost" onClick={() => logoRef.current?.click()}>رفع شعار</button>
            {form.logo && <button className="btn btn-danger" onClick={() => setForm({ ...form, logo: '' })}>حذف</button>}
          </div>
        </div>
        <div className="form-field"><label>اسم العلامة التجارية</label><input value={form.brandName ?? ''} onChange={(e) => setForm({ ...form, brandName: e.target.value })} /></div>
      </div>

      <div className="card editor-card">
        <h3>القسم الرئيسي (Hero)</h3>
        <div className="form-field"><label>الشارة</label><input value={form.heroBadge ?? ''} onChange={(e) => setForm({ ...form, heroBadge: e.target.value })} /></div>
        <div className="form-field"><label>العنوان الرئيسي</label><input value={form.heroTitle ?? ''} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} /></div>
        <div className="form-field"><label>العنوان الفرعي</label><input value={form.heroSubtitle ?? ''} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} /></div>
        <div className="form-field"><label>الشعار النصي</label><input value={form.heroTagline ?? ''} onChange={(e) => setForm({ ...form, heroTagline: e.target.value })} /></div>
        <div className="image-upload-row">
          <div className="image-preview image-preview-wide">{form.heroImage ? <img src={form.heroImage} alt="hero" /> : <div className="image-placeholder">لا توجد صورة خلفية</div>}</div>
          <div className="upload-controls">
            <input ref={heroRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'heroImage'); }} />
            <button className="btn btn-ghost" onClick={() => heroRef.current?.click()}>رفع صورة الخلفية</button>
            {form.heroImage && <button className="btn btn-danger" onClick={() => setForm({ ...form, heroImage: '' })}>حذف</button>}
          </div>
        </div>
      </div>

      <div className="card editor-card">
        <h3>قسم الخدمات</h3>
        <div className="form-field"><label>عنوان القسم</label><input value={form.servicesTitle ?? ''} onChange={(e) => setForm({ ...form, servicesTitle: e.target.value })} /></div>
        <div className="form-field"><label>العنوان الفرعي</label><input value={form.servicesSubtitle ?? ''} onChange={(e) => setForm({ ...form, servicesSubtitle: e.target.value })} /></div>
      </div>

      <div className="card editor-card">
        <h3>قسم المعرض</h3>
        <div className="form-field"><label>عنوان القسم</label><input value={form.galleryTitle ?? ''} onChange={(e) => setForm({ ...form, galleryTitle: e.target.value })} /></div>
        <div className="form-field"><label>العنوان الفرعي</label><input value={form.gallerySubtitle ?? ''} onChange={(e) => setForm({ ...form, gallerySubtitle: e.target.value })} /></div>
        <div className="gallery-editor-grid">
          {config?.galleryImages.map((img, i) => (
            <div key={i} className="gallery-editor-item">
              <img src={img} alt={`gallery ${i + 1}`} />
              <button className="btn btn-sm btn-danger gallery-delete-btn" onClick={() => removeGalleryImage(i)}>حذف</button>
            </div>
          ))}
          <div className="gallery-editor-add">
            <input ref={galleryRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) addGalleryImage(f); }} />
            <button className="btn btn-ghost" onClick={() => galleryRef.current?.click()}>+ إضافة صورة</button>
          </div>
        </div>
      </div>

      <div className="card editor-card">
        <h3>قسم نموذج الطلب</h3>
        <div className="form-field"><label>عنوان القسم</label><input value={form.orderTitle ?? ''} onChange={(e) => setForm({ ...form, orderTitle: e.target.value })} /></div>
        <div className="form-field"><label>العنوان الفرعي</label><input value={form.orderSubtitle ?? ''} onChange={(e) => setForm({ ...form, orderSubtitle: e.target.value })} /></div>
      </div>

      <div className="card editor-card">
        <h3>زر الدعوة للطلب (CTA)</h3>
        <div className="form-field"><label>نص الزر</label><input value={form.ctaText ?? ''} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} /></div>
        <div className="form-field"><label className="checkbox-label"><input type="checkbox" checked={form.ctaPulse ?? true} onChange={(e) => setForm({ ...form, ctaPulse: e.target.checked })} /> تفعيل النبض على الزر</label></div>
      </div>

      <div className="card editor-card">
        <h3>التذييل والتواصل</h3>
        <div className="form-field"><label>نص التذييل</label><input value={form.footerText ?? ''} onChange={(e) => setForm({ ...form, footerText: e.target.value })} /></div>
        <div className="form-field"><label>الهاتف</label><input value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="form-field"><label>واتساب</label><input value={form.whatsapp ?? ''} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
        <div className="form-field"><label>انستغرام</label><input value={form.instagram ?? ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></div>
        <div className="form-field"><label>فيسبوك</label><input value={form.facebook ?? ''} onChange={(e) => setForm({ ...form, facebook: e.target.value })} /></div>
      </div>

      <div className="site-editor-actions">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '...' : 'حفظ التغييرات'}</button>
      </div>
    </div>
  );
}
