'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/');

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/admin/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      } else {
        const errData = await res.json();
        alert("Access denied. " + (errData.error || "Admin privileges required."));
        router.push('/');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return null;

  return (
    <div>
      <h1 className={styles.pageTitle}>Overview</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Active Notes</h3>
          <p>{stats.totalNotes}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Comments</h3>
          <p>{stats.totalComments}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pending Reports</h3>
          <p style={{ color: stats.pendingReports > 0 ? '#ff9800' : 'inherit' }}>{stats.pendingReports}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Notes Today</h3>
          <p>{stats.notesToday}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Reports Today</h3>
          <p>{stats.reportsToday}</p>
        </div>
      </div>
    </div>
  );
}
