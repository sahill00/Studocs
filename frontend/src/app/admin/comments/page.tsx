'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function AdminComments() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/admin/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setComments(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/admin/comments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== id));
      } else {
        alert('Failed to delete comment.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Global Requests & Comments</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Author</th>
              <th>Content</th>
              <th>Type</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>
                  {c.author_name} <br/>
                  <small style={{ color: '#aaa' }}>{c.author_email}</small>
                </td>
                <td style={{ maxWidth: '300px' }}>{c.content}</td>
                <td>
                  {c.note_id ? (
                    <span style={{ color: '#4caf50' }}>Note Comment (Note ID: {c.note_id})</span>
                  ) : (
                    <span style={{ color: '#ffd700' }}>Global Request</span>
                  )}
                </td>
                <td>{new Date(c.created_at).toLocaleString()}</td>
                <td>
                  <button className={styles.btnDanger} onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {comments.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No active comments/requests found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
