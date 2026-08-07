import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { ClientTrackingPage } from './components/ClientTrackingPage';

type View = 'customer' | 'admin' | 'worker' | 'track';

export default function App() {
  const [view, setView] = useState<View>('customer');
  const [trackToken, setTrackToken] = useState('');

  useEffect(() => {
    function checkHash() {
      const hash = window.location.hash;
      if (hash === '#admin') setView('admin');
      else if (hash === '#worker') setView('worker');
      else if (hash.startsWith('#track/')) {
        setTrackToken(hash.replace('#track/', ''));
        setView('track');
      } else setView('customer');
    }
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (view === 'admin') return <AdminDashboard onExit={() => { window.location.hash = ''; setView('customer'); }} />;
  if (view === 'worker') return <WorkerDashboard onExit={() => { window.location.hash = ''; setView('customer'); }} />;
  if (view === 'track') return <ClientTrackingPage token={trackToken} onExit={() => { window.location.hash = ''; setView('customer'); }} />;
  return <LandingPage />;
}
