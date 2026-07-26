import type { ProjectInsert } from '../lib/supabase'
import { useState } from 'react'

type Props = {
  onSubmit: (data: ProjectInsert) => Promise<void>
  onDone: () => void
}

const WORKSHOP_TYPES = [
  'ديكور داخلي',
  'ديكور خارجي',
  'تصميم أثاث',
  'إضاءة',
  'أرضيات ودهانات',
]

const empty = {
  name: '',
  phone: '',
  email: '',
  workshop_type: '',
  space_size: '',
  budget: '',
  description: '',
  preferred_date: '',
}

export function OrderForm({ onSubmit, onDone }: Props) {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update(field: keyof typeof empty, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.name.trim() || !form.phone.trim() || !form.workshop_type || !form.description.trim()) {
      setError('يرجى تعبئة الحقول المطلوبة: الاسم، الهاتف، نوع الطلب، والوصف.')
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        workshop_type: form.workshop_type,
        space_size: form.space_size.trim() || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        description: form.description.trim(),
        preferred_date: form.preferred_date || undefined,
      })
      setForm(empty)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء إرسال الطلب.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="order-form-section">
      <div className="section-head">
        <h2>طلب تصميم جديد</h2>
        <p>املأ النموذج وسيتولد رقم طلب فريد تلقائياً عند الإرسال.</p>
      </div>

      <form className="order-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="field-row">
          <label className="field">
            <span>الاسم الكامل <em>*</em></span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="مثال: محمد العتيبي"
              required
            />
          </label>

          <label className="field">
            <span>رقم الهاتف <em>*</em></span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="05xxxxxxxx"
              required
            />
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>البريد الإلكتروني</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="name@example.com"
            />
          </label>

          <label className="field">
            <span>نوع الطلب <em>*</em></span>
            <select
              value={form.workshop_type}
              onChange={(e) => update('workshop_type', e.target.value)}
              required
            >
              <option value="">اختر النوع...</option>
              {WORKSHOP_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>مساحة المكان</span>
            <input
              type="text"
              value={form.space_size}
              onChange={(e) => update('space_size', e.target.value)}
              placeholder="مثال: 120 م²"
            />
          </label>

          <label className="field">
            <span>الميزانية التقريبية (ريال)</span>
            <input
              type="number"
              min="0"
              value={form.budget}
              onChange={(e) => update('budget', e.target.value)}
              placeholder="مثال: 25000"
            />
          </label>
        </div>

        <label className="field">
          <span>التاريخ المفضل للبدء</span>
          <input
            type="date"
            value={form.preferred_date}
            onChange={(e) => update('preferred_date', e.target.value)}
          />
        </label>

        <label className="field">
          <span>تفاصيل الطلب <em>*</em></span>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="صف فكرتك ومتطلباتك بالتفصيل..."
            rows={5}
            required
          />
        </label>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onDone} disabled={loading}>
            إلغاء
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
          </button>
        </div>
      </form>
    </section>
  )
}
