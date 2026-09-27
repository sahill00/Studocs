'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../browse/page.module.css';

export default function BookmarksPage() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to view bookmarks.");
      router.push('/');
      return;
    }
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/bookmarks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data); // The backend returns full notes!
        setBookmarkedIds(new Set(data.map((b: any) => b.id)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async (noteId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/bookmarks/${noteId}`, {
        method: 'DELETE', // Unbookmarking since this is the bookmarks page
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotes(prev => prev.filter((n: any) => n.id !== noteId));
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          next.delete(noteId);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvote = async (noteId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/notes/${noteId}/upvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev: any) => prev.map((n: any) => n.id === noteId ? { ...n, upvotes: data.upvotes } : n));
      }
    } catch (err) {}
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
      note_id: reportTargetId,
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

  const handleRead = (url: string) => {
    if (!url) return alert("File not found");
    window.open(`/viewer?url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleDownload = async (noteId: number, url: string, title: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/notes/${noteId}/download`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotes((prev: any) => prev.map((n: any) => n.id === noteId ? { ...n, download_count: data.download_count } : n));
          }
        }).catch(console.error);

      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${title.replace(/\\s+/g, '_')}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <a href="/" className={styles.navLink}>← HOME</a>
        </div>
        <div className={styles.navCenter}>
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1 className={styles.logo}>STUDOCS</h1>
          </a>
        </div>
        <div className={styles.navRight}>
          <a href="/browse" className={styles.navLink}>BROWSE</a>
        </div>
      </nav>

      <div className={styles.content}>
        <main className={styles.mainFeed} style={{ width: '100%' }}>
          <h1 className={styles.pageTitle}>MY BOOKMARKS</h1>
          
          {loading ? (
            <div className={styles.loading}>LOADING BOOKMARKS...</div>
          ) : notes.length === 0 ? (
            <div className={styles.emptyState}>
              You haven't bookmarked any notes yet. Go to Browse to find some!
            </div>
          ) : (
            <div className={styles.grid}>
              {notes.map((note: any) => (
                <div key={note.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.tag}>{note.note_type}</span>
                    <span className={styles.date}>
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>
                    <a href={`/notes/${note.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {note.title}
                    </a>
                  </h3>
                  <p className={styles.cardMeta}>
                    {note.branch} • Year {note.academic_year} {note.exam_year && `• Exam: ${note.exam_year}`}
                  </p>
                  <p className={styles.cardDesc}>
                    {note.description || "No description provided."}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#ffb74d', marginTop: '0.5rem', marginBottom: '0' }}>
                    Uploaded by: {note.uploader_name || 'Anonymous'}
                  </p>
                  <div className={styles.cardFooter} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
                    <button 
                      onClick={() => handleUpvote(note.id)}
                      style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '0.2rem 0.5rem', cursor: 'pointer', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'inherit' }}
                    >
                      ↑ {note.upvotes || 0}
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#aaa', marginRight: 'auto' }}>
                      {note.download_count || 0} Downloads
                    </span>
                    <button 
                      onClick={() => handleBookmarkToggle(note.id)}
                      style={{ background: '#ffd700', border: '1px solid #ffd700', color: '#000', padding: '0.2rem 0.5rem', cursor: 'pointer', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'inherit', marginLeft: '0.5rem' }}
                    >
                      ★ BOOKMARKED
                    </button>
                    <button 
                      onClick={() => handleRead(note.file_url)}
                      style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '0.25rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      READ
                    </button>
                    <button 
                      onClick={() => handleDownload(note.id, note.file_url, note.title)}
                      className={styles.downloadBtn}
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px', margin: 0, whiteSpace: 'nowrap' }}
                    >
                      DOWNLOAD
                    </button>
                    <button 
                      onClick={() => openReportModal(note.id)}
                      style={{ background: 'transparent', border: '1px solid #ff9800', color: '#ff9800', padding: '0.25rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      REPORT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Report Note</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
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
                style={{ width: '100%', background: '#121212', border: '1px solid #333', color: '#fff', padding: '1rem', borderRadius: '4px', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={closeReportModal} style={{ background: 'transparent', color: '#aaa', border: '1px solid #555', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={submitReport} style={{ background: '#ffd700', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}>Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
