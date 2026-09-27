'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  // Modal state
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = new URL((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/admin/reports');
      if (filter) url.searchParams.append('status', filter);
      
      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchReports();
        if (selectedReport && selectedReport.id === id) {
          setSelectedReport(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const viewReportDetails = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/admin/reports/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedReport(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteComment = async (id: number) => {
    if (!confirm("Delete this comment permanently?")) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/admin/comments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("Comment deleted");
      setSelectedReport(null);
      fetchReports();
    } catch(e) {}
  };

  const removeNote = async (id: number) => {
    if (!confirm("Hide this note?")) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/admin/notes/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'hidden' })
      });
      alert("Note hidden");
      setSelectedReport(null);
      fetchReports();
    } catch(e) {}
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.pageTitle}>Reports Management</h1>
        <select onChange={e => setFilter(e.target.value)} value={filter} style={{ padding: '0.5rem', background: '#1a1a1a', color: '#fff', border: '1px solid #333' }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      {loading ? (
        <p>Loading reports...</p>
      ) : reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Reporter</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id}>
                <td>#{report.id}</td>
                <td>{report.note_id ? 'Note' : 'Comment'}</td>
                <td>{report.reporter_name}</td>
                <td>{report.reason}</td>
                <td>{new Date(report.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`${styles.statusTag} ${styles['status_' + report.status]}`}>
                    {report.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button className={styles.btnAction} onClick={() => viewReportDetails(report.id)}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedReport && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Review Report #{selectedReport.id}</h2>
            <div className={styles.modalBody}>
              <p><strong>Reporter:</strong> {selectedReport.reporter_name}</p>
              <p><strong>Reason:</strong> {selectedReport.reason}</p>
              <p><strong>Description:</strong> {selectedReport.description || "None"}</p>
              
              <hr style={{ borderColor: '#333', margin: '1rem 0' }} />
              
              {selectedReport.note_id ? (
                <div>
                  <h3>Reported Note</h3>
                  <p><strong>Title:</strong> <a href={`/notes/${selectedReport.note_id}`} target="_blank">{selectedReport.note_title}</a></p>
                  <p><strong>Uploader:</strong> {selectedReport.note_uploader_name}</p>
                  <button className={`${styles.btnAction} ${styles.btnDanger}`} onClick={() => removeNote(selectedReport.note_id)}>Hide Note</button>
                </div>
              ) : (
                <div>
                  <h3>Reported Comment</h3>
                  <p><strong>Author:</strong> {selectedReport.comment_author_name}</p>
                  <p style={{ background: '#121212', padding: '1rem', border: '1px solid #333' }}>
                    {selectedReport.comment_content}
                  </p>
                  <button className={`${styles.btnAction} ${styles.btnDanger}`} onClick={() => deleteComment(selectedReport.comment_id)}>Delete Comment</button>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnAction} onClick={() => setSelectedReport(null)}>Close</button>
              {selectedReport.status === 'pending' && (
                <button className={styles.btnAction} onClick={() => updateReportStatus(selectedReport.id, 'reviewing')}>Mark Reviewing</button>
              )}
              {selectedReport.status !== 'rejected' && (
                <button className={`${styles.btnAction} ${styles.btnDanger}`} onClick={() => updateReportStatus(selectedReport.id, 'rejected')}>Reject Report</button>
              )}
              {selectedReport.status !== 'resolved' && (
                <button className={styles.btnAction} style={{ borderColor: '#4caf50', color: '#4caf50' }} onClick={() => updateReportStatus(selectedReport.id, 'resolved')}>Resolve Report</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
