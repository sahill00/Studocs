'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function AdminNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/admin/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotes(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    if (!confirm(`Are you sure you want to change status to ${status}?`)) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/admin/notes/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, status } : n));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Notes Moderation</h1>
      
      {loading ? (
        <p>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Uploader</th>
              <th>Branch/Year</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {notes.map(note => (
              <tr key={note.id}>
                <td>#{note.id}</td>
                <td><a href={`/notes/${note.id}`} target="_blank" style={{color: '#ffd700'}}>{note.title}</a></td>
                <td>{note.uploader_name}</td>
                <td>{note.branch} - Year {note.academic_year}</td>
                <td>
                  <span className={styles.statusTag} style={{ background: note.status === 'hidden' ? '#f44336' : note.status === 'removed' ? '#ff0000' : '#4caf50' }}>
                    {note.status ? note.status.toUpperCase() : 'ACTIVE'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {note.status !== 'hidden' ? (
                      <button className={`${styles.btnAction} ${styles.btnDanger}`} onClick={() => updateStatus(note.id, 'hidden')}>Hide</button>
                    ) : (
                      <button className={styles.btnAction} style={{ borderColor: '#4caf50', color: '#4caf50' }} onClick={() => updateStatus(note.id, 'active')}>Restore</button>
                    )}
                    {note.status !== 'removed' && (
                      <button className={`${styles.btnAction} ${styles.btnDanger}`} style={{ borderColor: '#ff0000', color: '#ff0000' }} onClick={() => {
                        if (confirm('Are you sure you want to permanently delete this note? This will delete the file from storage and notify the user.')) {
                          updateStatus(note.id, 'removed');
                        }
                      }}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
