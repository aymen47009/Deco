import { useState } from 'react';
import { api } from '../lib/api';
import { showToast } from './ui';
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  WORK_TYPES,
  WORK_TYPE_LABELS,
  type ProjectInput,
} from '../types';

interface OrderFormProps {
  onDone: () => void;
}

export function OrderForm({ onDone }: OrderFormProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    propertyType: 'apartment' as ProjectInput['propertyType'],
    workType: 'full_renovation' as ProjectInput['workType'],
    budget: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data: ProjectInput = {
        title: form.title,
        description: form.description,
        customer: {
          name: form.customerName,
          phone: form.customerPhone,
          email: form.customerEmail || undefined,
          address: form.customerAddress || undefined,
        },
        propertyType: form.propertyType,
        workType: form.workType,
        budget: form.budget ? Number(form.budget) : 0,
        notes: form.notes,
      };
      const project = await api.createProject(data);
      showToast(`تم إنشاء الطلب بنجاح — كود المشروع: ${project.code}`, 'success');
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل إنشاء الطلب';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card form-card">
      <h2 className="form-title">طلب تصميم / تجديد</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-field">
          <label>عنوان المشروع *</label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="مثال: تجديد شقة بالكامل"
          />
        </div>

        <div className="form-field">
          <label>نوع العقار</label>
          <select value={form.propertyType} onChange={(e) => update('propertyType', e.target.value)}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {PROPERTY_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>نوع العمل</label>
          <select value={form.workType} onChange={(e) => update('workType', e.target.value)}>
            {WORK_TYPES.map((t) => (
              <option key={t} value={t}>
                {WORK_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>الميزانية التقديرية</label>
          <input
            type="number"
            value={form.budget}
            onChange={(e) => update('budget', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="form-field">
          <label>الاسم *</label>
          <input
            required
            value={form.customerName}
            onChange={(e) => update('customerName', e.target.value)}
            placeholder="الاسم الكامل"
          />
        </div>

        <div className="form-field">
          <label>الهاتف *</label>
          <input
            required
            value={form.customerPhone}
            onChange={(e) => update('customerPhone', e.target.value)}
            placeholder="رقم الهاتف"
          />
        </div>

        <div className="form-field">
          <label>البريد الإلكتروني</label>
          <input
            type="email"
            value={form.customerEmail}
            onChange={(e) => update('customerEmail', e.target.value)}
            placeholder="example@email.com"
          />
        </div>

        <div className="form-field">
          <label>العنوان</label>
          <input
            value={form.customerAddress}
            onChange={(e) => update('customerAddress', e.target.value)}
            placeholder="عنوان العقار"
          />
        </div>

        <div className="form-field form-field-full">
          <label>وصف المشروع</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            placeholder="اشرح تفاصيل المشروع..."
          />
        </div>

        <div className="form-field form-field-full">
          <label>ملاحظات إضافية</label>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={2}
          />
        </div>

        <div className="form-actions form-field-full">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onDone}>
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
