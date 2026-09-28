"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from '../../browse/page.module.css'; // Reuse browse styles for notes

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/users/${id}/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!profile) return <div style={{ padding: '2rem', textAlign: 'center' }}>User not found</div>;

  return (
    <main className={styles.main}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <a href="/" className={styles.logo}>studocs</a>
        </div>
        <div className={styles.navCenter}>
          <a href="/browse">BROWSE</a>
        </div>
      </nav>

      <div style={{ marginTop: '80px', padding: '2rem 3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
            {profile.user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'Playfair Display, serif' }}>{profile.user.full_name}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {profile.user.college_name || 'No college specified'} • {profile.user.branch || 'No branch'} • {profile.user.year_of_study ? `Year ${profile.user.year_of_study}` : ''}
            </p>
          </div>
        </div>

        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Playfair Display, serif' }}>Uploads ({profile.notes.length})</h2>
        <div className={styles.notesGrid}>
          {profile.notes.map((note: any) => (
            <div key={note.id} className={styles.noteCard} onClick={() => window.location.href = `/notes/${note.id}`}>
              <div className={styles.noteHeader}>
                <div className={styles.noteMetaInfo}>
                  <span className={styles.noteTypeBadge}>{note.note_type}</span>
                </div>
                <h3 className={styles.noteTitle}>{note.title}</h3>
              </div>
              <div className={styles.noteFooter}>
                <span className={styles.date}>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
        {profile.notes.length === 0 && <p>This user has no public uploads yet.</p>}
      </div>
    </main>
  );
}
