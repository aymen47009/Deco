import { useEffect, useState } from 'react'
import { supabase, type Project } from '../lib/supabase'

const STATUS_LABELS: Record<string, string> = {
  new: 'جديد',
  in_review: 'قيد المراجعة',
  approved: 'مقبول',
  completed: 'مكتمل',
}

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        setError(error.message)
      } else {
        setProjects(data ?? [])
      }
      setLoading(false)
    })()
  }, [])

  return (
    <section className="projects-section">
      <div className="section-head">
        <h2>الطلبات المرسلة</h2>
        <p>كل طلب يحمل رقماً فريداً يُولّد تلقائياً عند الإرسال.</p>
      </div>

      {loading && <p className="muted">جارٍ التحميل...</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && projects.length === 0 && (
        <p className="muted">لا توجد طلبات بعد. ابدأ بإنشاء طلب تصميم جديد.</p>
      )}

      {projects.length > 0 && (
        <div className="table-wrap">
          <table className="projects-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>الاسم</th>
                <th>النوع</th>
                <th>الهاتف</th>
                <th>الحالة</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td><code className="code-badge">{p.code}</code></td>
                  <td>{p.name}</td>
                  <td>{p.workshop_type}</td>
                  <td dir="ltr">{p.phone}</td>
                  <td>
                    <span className={`status status-${p.status}`}>{STATUS_LABELS[p.status] ?? p.status}</span>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString('ar-SA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
