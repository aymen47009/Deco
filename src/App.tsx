import { useState } from 'react'
import { supabase, type ProjectInsert } from './lib/supabase'

import { OrderForm } from './components/OrderForm'
import { ProjectsList } from './components/ProjectsList'
import { Hero } from './components/Hero'

type View = 'home' | 'order' | 'projects'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [lastCode, setLastCode] = useState<string | null>(null)

  async function submitProject(data: ProjectInsert) {
    const { data: row, error } = await supabase
      .from('projects')
      .insert(data)
      .select('code')
      .single()
    if (error) throw error
    setLastCode(row.code)
    setView('home')
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          <button className="brand" onClick={() => setView('home')}>
            <span className="brand-mark">DW</span>
            <span className="brand-name">ديكو وركشوبس</span>
          </button>
          <nav className="nav">
            <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>الرئيسية</button>
            <button className={view === 'order' ? 'active' : ''} onClick={() => setView('order')}>طلب تصميم</button>
            <button className={view === 'projects' ? 'active' : ''} onClick={() => setView('projects')}>طلباتي</button>
          </nav>
        </div>
      </header>

      <main className="container main">
        {view === 'home' && (
          <>
            <Hero onOrder={() => setView('order')} lastCode={lastCode} />
          </>
        )}
        {view === 'order' && (
          <OrderForm onSubmit={submitProject} onDone={() => setView('home')} />
        )}
        {view === 'projects' && (
          <ProjectsList />
        )}
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} ديكو وركشوبس — جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  )
}
