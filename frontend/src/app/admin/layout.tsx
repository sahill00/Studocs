'use client';

import { useEffect, useState } from 'react';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        window.location.href = '/browse';
      } else {
        setIsAuthorized(true);
      }
    } catch (e) {
      window.location.href = '/';
    }
  }, []);

  if (!isAuthorized) {
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#121212', color: '#fff' }}>Verifying permissions...</div>;
  }

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <h2>STUDOCS ADMIN</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <a href="/admin" className={styles.navLink}>Dashboard</a>
          <a href="/admin/reports" className={styles.navLink}>Reports 🔔</a>
          <a href="/admin/notes" className={styles.navLink}>Notes</a>
          <a href="/browse" className={styles.navLink} style={{ marginTop: 'auto', color: '#ff4444' }}>Exit Admin</a>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
