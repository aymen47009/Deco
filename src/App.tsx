import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';

type View = 'customer' | 'admin' | 'worker';

export default function App() {
  const [view, setView] = useState<View>('customer');

  useEffect(() => {
    function checkHash() {
      const hash = window.location.hash;
      if (hash === '#admin') setView('admin');
      else if (hash === '#worker') setView('worker');
      else setView('customer');
    }
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (view === 'admin') return <AdminDashboard onExit={() => { window.location.hash = ''; setView('customer'); }} />;
  if (view === 'worker') return <WorkerDashboard onExit={() => { window.location.hash = ''; setView('customer'); }} />;
  return <LandingPage />;
}
