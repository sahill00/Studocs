'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function BrowseNotes() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState({
    branch: '',
    academic_year: '',
    note_type: '',
    search: ''
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetId, setReportTargetId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        setCurrentUser(JSON.parse(atob(token.split('.')[1])));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    fetchNotes();
    fetchBookmarks();
  }, [filters]);

  const fetchBookmarks = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/bookmarks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarkedIds(new Set(data.map((b: any) => b.id)));
      }
    } catch (e) {}
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.academic_year) params.append('academic_year', filters.academic_year);
      if (filters.note_type) params.append('note_type', filters.note_type);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/notes?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleUpvote = async (noteId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to upvote notes!");
      return;
    }
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/notes/${noteId}/upvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev: any) => prev.map((n: any) => n.id === noteId ? { ...n, upvotes: data.upvotes } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmarkToggle = async (noteId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to bookmark notes!");
      return;
    }
    const isBookmarked = bookmarkedIds.has(noteId);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/bookmarks/${noteId}`, {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          if (isBookmarked) next.delete(noteId);
          else next.add(noteId);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
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
    if (!token) {
      alert("You must be logged in to download notes. Please log in or sign up!");
      return;
    }

    if (!url) return alert("File not found");
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
      a.download = `${title.replace(/\s+/g, '_')}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank'); // Fallback if CORS blocks the fetch
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Navbar matching the style */}
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
          {currentUser?.role === 'admin' && (
            <a href="/admin" className={styles.navLink} style={{ marginRight: '2rem', color: '#ffd700' }}>ADMIN</a>
          )}
          <a href="/requests" className={styles.navLink} style={{ marginRight: '2rem' }}>REQUESTS</a>
          <a href="/bookmarks" className={styles.navLink} style={{ marginRight: '2rem' }}>BOOKMARKS</a>
          <a href="/upload" className={styles.navLink}>UPLOAD</a>
        </div>
      </nav>

      <div className={styles.content}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>FILTERS</h2>
          
          <div className={styles.filterGroup}>
            <label>SEARCH TITLE</label>
            <input 
              name="search" 
              value={filters.search} 
              onChange={handleFilterChange} 
              placeholder="Search..." 
              className={styles.select}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          
          <div className={styles.filterGroup}>
            <label>BRANCH</label>
            <select name="branch" value={filters.branch} onChange={handleFilterChange} className={styles.select}>
              <option value="">All Branches</option>
              <option value="CSE">Computer Science</option>
              <option value="ECE">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>ACADEMIC YEAR</label>
            <select name="academic_year" value={filters.academic_year} onChange={handleFilterChange} className={styles.select}>
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>NOTE TYPE</label>
            <select name="note_type" value={filters.note_type} onChange={handleFilterChange} className={styles.select}>
              <option value="">All Types</option>
              <option value="TEXTBOOK">Textbook (Structured)</option>
              <option value="HANDWRITTEN">Handwritten (Lectures)</option>
              <option value="PYQS">Previous Year Questions</option>
            </select>
          </div>
        </aside>

        {/* Main Feed */}
        <main className={styles.mainFeed}>
          <h1 className={styles.pageTitle}>DISCOVER</h1>
          
          {loading ? (
            <div className={styles.loading}>LOADING RESOURCES...</div>
          ) : notes.length === 0 ? (
            <div className={styles.emptyState}>
              No notes found for these filters. Be the first to upload!
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
                      style={{ background: bookmarkedIds.has(note.id) ? '#ffd700' : 'transparent', border: '1px solid #ffd700', color: bookmarkedIds.has(note.id) ? '#000' : '#ffd700', padding: '0.2rem 0.5rem', cursor: 'pointer', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'inherit', marginLeft: '0.5rem' }}
                    >
                      {bookmarkedIds.has(note.id) ? '★ BOOKMARKED' : '☆ BOOKMARK'}
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
