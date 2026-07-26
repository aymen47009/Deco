import { useState, useEffect } from 'react';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminDashboard } from './components/AdminDashboard';

type View = 'customer' | 'admin';

export default function App() {
  const [view, setView] = useState<View>('customer');

  useEffect(() => {
    function checkHash() {
      if (window.location.hash === '#admin') {
        setView('admin');
      }
    }
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (view === 'admin') return <AdminDashboard onExit={() => { window.location.hash = ''; setView('customer'); }} />;

  return <CustomerPortal />;
}
