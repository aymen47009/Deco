import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { Spinner, ConfirmDialog, EmptyState, showToast } from './ui';
import { GALLERY_CATEGORY_LABELS, GALLERY_CATEGORIES, type GalleryImage, type GalleryCategory } from '../types';

export function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<GalleryImage | null>(null);
  const [filterCat, setFilterCat] = useState<string>('');
  const [uploadCat, setUploadCat] = useState<GalleryCategory>('gallery');
  const [uploadTitle, setUploadTitle] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try { setImages(await api.getGalleryImages(filterCat ? (filterCat as GalleryCategory) : undefined)); }
    catch { showToast('فشل تحميل الصور', 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filterCat]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      await api.uploadGalleryImage(file, uploadCat, uploadTitle.trim() || undefined);
      showToast('تم رفع الصورة بنجاح', 'success');
      setUploadTitle('');
      load();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل رفع الصورة', 'error'); }
    finally { setUploading(false); }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await api.deleteGalleryImage(confirmDelete._id);
      showToast('تم حذف الصورة', 'success');
      setConfirmDelete(null);
      load();
    } catch (e) { showToast(e instanceof Error ? e.message : 'فشل الحذف', 'error'); }
  }

  return (
    <div className="gallery-mgr">
      <div className="upload-card">
        <h3 className="upload-title">رفع صورة جديدة</h3>
        <div className="upload-form">
          <div className="upload-field">
            <label>التصنيف</label>
            <select value={uploadCat} onChange={(e) => setUploadCat(e.target.value as GalleryCategory)}>
              {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{GALLERY_CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div className="upload-field upload-field-grow">
            <label>عنوان الصورة (اختياري)</label>
            <input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="مثال: تشطيب صالة فاخرة" />
          </div>
          <div className="upload-action">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
            <button className="btn btn-primary" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? <Spinner /> : 'اختيار صورة ورفعها'}
            </button>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">كل التصنيفات</option>
          {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{GALLERY_CATEGORY_LABELS[c]}</option>)}
        </select>
        <span className="filter-count">{images.length} صورة</span>
      </div>

      {loading ? <Spinner label="جاري التحميل..." /> : images.length === 0 ? (
        <EmptyState title="لا توجد صور" message="ارفع أول صورة باستخدام النموذج أعلاه" />
      ) : (
        <div className="mgr-grid">
          {images.map((img) => (
            <div className="mgr-tile" key={img._id}>
              <div className="mgr-tile-img">
                <img src={img.url} alt={img.title || 'gallery'} />
                <span className="mgr-cat-badge">{GALLERY_CATEGORY_LABELS[img.category]}</span>
              </div>
              <div className="mgr-tile-info">
                <span className="mgr-tile-title">{img.title || 'بدون عنوان'}</span>
                <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(img)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="حذف الصورة"
        message="هل أنت متأكد من حذف هذه الصورة؟ لا يمكن التراجع."
        confirmLabel="حذف"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
