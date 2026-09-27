'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './requests.module.css';

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        setCurrentUser(JSON.parse(atob(token.split('.')[1])));
      } catch (e) {}
    }
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/comments`);
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostRequest = async () => {
    if (!newRequest.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to post a request.");
      return;
    }

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newRequest, note_id: null })
      });
      if (res.ok) {
        setNewRequest('');
        fetchRequests();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to post request.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRequest = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRequests(prev => prev.filter(c => c.id !== commentId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete request");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitReport = async () => {
    if (!reportReason) {
      alert("Please select a reason");
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to report.");
      return;
    }

    const payload = {
      comment_id: reportTargetId,
      reason: reportReason,
      description: reportDescription
    };

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Report submitted successfully. Thank you.");
        closeReportModal();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit report");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openReportModal = (id: number) => {
    setReportTargetId(id);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportTargetId(null);
    setReportReason('');
    setReportDescription('');
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <a href="/browse" className={styles.navLink}>← BACK TO DISCOVER</a>
        </div>
        <div className={styles.navCenter}>
          <h1 className={styles.logo}>STUDOCS</h1>
        </div>
        <div className={styles.navRight}>
          <a href="/upload" className={styles.navLink}>UPLOAD</a>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Community Requests</h1>
          <p className={styles.subtitle}>Looking for specific notes? Request them here from the community!</p>
        </div>

        <div className={styles.addRequest}>
          <textarea 
            value={newRequest}
            onChange={e => setNewRequest(e.target.value)}
            placeholder="E.g. Does anyone have handwritten notes for DBMS Unit 4?" 
            className={styles.requestInput}
            rows={3}
          />
          <button onClick={handlePostRequest} className={styles.btnPost}>Post Request</button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading requests...</div>
        ) : (
          <div className={styles.requestsList}>
            {requests.map(req => (
              <div key={req.id} className={styles.requestCard}>
                <div className={styles.requestHeader}>
                  <div className={styles.requestMeta}>
                    <strong>{req.username}</strong>
                    <span className={styles.time}>{new Date(req.created_at).toLocaleString()}</span>
                  </div>
                  <div className={styles.requestOptions}>
                    <button className={styles.btnDots} onClick={(e) => {
                      const menu = e.currentTarget.nextElementSibling;
                      menu?.classList.toggle(styles.showMenu);
                    }}>⋮</button>
                    <div className={styles.dropdownMenu}>
                      <button onClick={() => openReportModal(req.id)}>Report</button>
                      {(currentUser?.userId === req.user_id || currentUser?.role === 'admin') && (
                        <button onClick={() => handleDeleteRequest(req.id)}>Delete</button>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.requestContent}>
                  {req.content}
                </div>
              </div>
            ))}
            {requests.length === 0 && <p className={styles.empty}>No requests yet. Be the first to ask!</p>}
          </div>
        )}
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Report Post</h3>
            <div className={styles.modalBody}>
              <label>Reason:</label>
              <select value={reportReason} onChange={e => setReportReason(e.target.value)} className={styles.select}>
                <option value="">Select a reason...</option>
                <option value="Spam">Spam</option>
                <option value="Duplicate content">Duplicate content</option>
                <option value="Wrong subject/category">Wrong subject/category</option>
                <option value="Inappropriate content">Inappropriate content</option>
                <option value="Misleading information">Misleading information</option>
                <option value="Copyright issue">Copyright issue</option>
                <option value="Other">Other</option>
              </select>

              <label>Optional description:</label>
              <textarea 
                value={reportDescription} 
                onChange={e => setReportDescription(e.target.value)}
                placeholder="Tell us more..."
                rows={4}
                className={styles.requestInput}
              />
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeReportModal} className={styles.btnCancel}>Cancel</button>
              <button onClick={submitReport} className={styles.btnPrimary}>Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
