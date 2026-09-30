'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../browse/page.module.css';

export default function MyUploads() {
  const router = useRouter();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMyUploads = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to view your uploads");
        router.push('/');
        return;
      }

      try {
        const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/notes/my-uploads', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        } else {
          console.error("Failed to fetch user uploads");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyUploads();
  }, [router]);

  const handleDelete = async (noteId: number) => {
    if (!confirm("Are you sure you want to permanently delete this note?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotes(notes.filter(n => n.id !== noteId));
      } else {
        alert("Failed to delete note.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleEditClick = (noteId: number) => {
    setEditingNoteId(noteId);
    document.getElementById('editFileUpload')?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !editingNoteId) return;
    
    const file = e.target.files[0];
    const maxSizeBytes = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSizeBytes) {
      alert(`Your file is ${Math.round(file.size / (1024 * 1024))}MB, which is too large! Please compress it to under 50MB and try again.`);
      setEditingNoteId(null);
      return;
    }

    const noteToEdit = notes.find(n => n.id === editingNoteId);
    
    const newTitle = prompt("Enter new title for this note:", noteToEdit?.title || "");
    if (!newTitle) {
      setEditingNoteId(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const submitData = new FormData();
      submitData.append('title', newTitle);
      submitData.append('description', noteToEdit.description || '');
      submitData.append('file', file);

      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/notes/${editingNoteId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: submitData
      });
      
      if (response.ok) {
        const result = await response.json();
        setNotes(notes.map(n => n.id === editingNoteId ? { ...n, title: newTitle, file_url: result.note.file_url } : n));
        alert("Note successfully updated!");
      } else {
        alert("Failed to edit note.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setEditingNoteId(null);
    }
  };

  const handleRead = (url: string) => {
    if (!url) return alert("File not found");
    window.open(`/viewer?url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleDownload = async (url: string, title: string) => {
    if (!url) return alert("File not found");
    try {
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
      {/* Hidden file input for editing */}
      <input 
        type="file" 
        id="editFileUpload" 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
      />
      
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
          <a href="/upload" className={styles.navLink}>+ UPLOAD</a>
        </div>
      </nav>

      <main className={styles.main}>
        <h1 className={styles.pageTitle} style={{ fontSize: '2.5rem' }}>MY UPLOADS</h1>
        <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>Manage all the notes you have shared</p>

        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading your uploads...</p>
        ) : notes.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '1rem' }}>You haven't uploaded any notes yet.</p>
            <a href="/upload" style={{ color: '#fff', textDecoration: 'underline' }}>Upload your first note</a>
          </div>
        ) : (
          <div className={styles.notesGrid}>
            {notes.map(note => (
              <div key={note.id} className={styles.noteCard}>
                <div className={styles.noteHeader}>
                  <span className={styles.noteType}>{note.note_type}</span>
                  <span className={styles.difficulty}>{note.difficulty_level || 'N/A'}</span>
                </div>
                <h3 className={styles.noteTitle}>{note.title}</h3>
                <p className={styles.noteDesc} style={{ marginBottom: '0.5rem' }}>
                  {note.description || "No description provided."}
                </p>

                <div className={styles.noteMeta}>
                  <span>{note.branch} • Year {note.academic_year}</span>
                </div>
                <div className={styles.cardActions} style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                  <button 
                    style={{ background: 'var(--primary-color)', border: 'none', color: '#000', padding: '0.25rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 'bold' }}
                    onClick={() => handleRead(note.file_url)}
                  >
                    READ
                  </button>
                  <button 
                    style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '0.25rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', borderRadius: '4px' }}
                    onClick={() => handleEditClick(note.id)}
                  >
                    REPLACE FILE & EDIT
                  </button>
                  <button 
                    style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '0.25rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', borderRadius: '4px' }}
                    onClick={() => handleDelete(note.id)}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
