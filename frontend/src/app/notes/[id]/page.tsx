'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function NoteDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const [note, setNote] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{type: 'note' | 'comment', id: number} | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Decode user from token for basic UI checks
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload);
      } catch (e) {}
    }
    
    if (id) {
      fetchNoteDetails();
      fetchComments();
    }
  }, [id]);

  const fetchNoteDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/notes/${id}`, { headers });
      if (res.ok) {
        setNote(await res.json());
      } else {
        setError('Failed to load note.');
      }
    } catch (e) {
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/notes/${id}/comments`, { headers });
      if (res.ok) {
        setComments(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to comment.");
      return;
    }

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/notes/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      } else {
        alert("Failed to post comment.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete comment");
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
      note_id: reportTarget?.type === 'note' ? reportTarget.id : null,
      comment_id: reportTarget?.type === 'comment' ? reportTarget.id : null,
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

  const openReportModal = (type: 'note' | 'comment', targetId: number) => {
    setReportTarget({ type, id: targetId });
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportTarget(null);
    setReportReason('');
    setReportDescription('');
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error || !note) return <div className={styles.error}>{error || "Note not found"}</div>;

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
        {/* Note Details Section */}
        <div className={styles.noteSection}>
          <div className={styles.noteHeader}>
            <span className={styles.tag}>{note.note_type}</span>
            <div className={styles.actions}>
              <button onClick={() => window.open(`/viewer?url=${encodeURIComponent(note.file_url)}`, '_blank')} className={styles.btnPrimary}>READ</button>
              <button onClick={() => openReportModal('note', note.id)} className={styles.btnSecondary}>REPORT</button>
            </div>
          </div>
          <h1 className={styles.title}>{note.title}</h1>
          <div className={styles.meta}>
            {note.branch} • Year {note.academic_year} • Uploaded by {note.uploader_name} on {new Date(note.created_at).toLocaleDateString()}
          </div>
          <div className={styles.description}>
            {note.description || "No description provided."}
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Comments Section */}
        <div className={styles.commentsSection}>
          <h2>Comments ({comments.length})</h2>
          
          <div className={styles.addComment}>
            <textarea 
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..." 
              className={styles.commentInput}
              rows={3}
            />
            <button onClick={handlePostComment} className={styles.btnPost}>Post Comment</button>
          </div>

          <div className={styles.commentsList}>
            {comments.map(comment => (
              <div key={comment.id} className={styles.commentCard}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentMeta}>
                    <strong>{comment.username}</strong>
                    <span className={styles.time}>{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <div className={styles.commentOptions}>
                    <button className={styles.btnDots} onClick={(e) => {
                      const menu = e.currentTarget.nextElementSibling;
                      menu?.classList.toggle(styles.showMenu);
                    }}>⋮</button>
                    <div className={styles.dropdownMenu}>
                      <button onClick={() => openReportModal('comment', comment.id)}>Report Comment</button>
                      {(currentUser?.userId === comment.user_id || currentUser?.role === 'admin') && (
                        <button onClick={() => handleDeleteComment(comment.id)}>Delete Comment</button>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.commentContent}>
                  {comment.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Report {reportTarget?.type === 'note' ? 'Note' : 'Comment'}</h3>
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
                className={styles.commentInput}
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
