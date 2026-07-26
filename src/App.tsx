import { useState } from 'react';
import { CustomerPage } from './components/CustomerPage';
import { AdminPage } from './components/AdminPage';

type View = 'customer' | 'admin';

export default function App() {
  const [view, setView] = useState<View>('customer');

  if (view === 'admin') {
    return <AdminPage onExit={() => setView('customer')} />;
  }

  return (
    <>
      <button className="admin-access-btn" onClick={() => setView('admin')} title="لوحة الإدارة">
        ⚙
      </button>
      <CustomerPage />
    </>
  );
}
