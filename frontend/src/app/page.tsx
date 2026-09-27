'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import AuthModal from '../components/AuthModal';

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setIsLoggedIn(false);
  };

  return (
    <main className={styles.main}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <a href="/" className={styles.logo}>studocs</a>
        </div>
        
        <div className={styles.navCenter}>
          <a href="/browse">BROWSE</a>
          <a href="/about">ABOUT</a>
          {isLoggedIn && <a href="/my-uploads">MY UPLOADS</a>}
          <a href="/upload">UPLOAD</a>
        </div>
        
        <div className={styles.navRight}>
          {isLoggedIn ? (
            <button onClick={handleLogout} className={styles.navBtn}>LOGOUT</button>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className={styles.navBtn}>LOGIN</button>
          )}
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Academic Notes for College, Exams, and Research.</h1>
          <p className={styles.heroSubtitle}>Join a community of students sharing high-quality resources.</p>
          <div className={styles.searchFormContainer}>
            <form action="/browse" method="GET" className={styles.searchForm}>
              <div className={styles.searchIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input 
                type="text" 
                name="search" 
                placeholder="Search subjects, course codes, or notes..." 
                className={styles.searchInput}
                required
              />
              <button type="submit" className={styles.searchBtn}>Search</button>
            </form>
          </div>
        </div>

        <div className={styles.gradientOverlay}></div>

        <div className={styles.imagesLayer}>
          <div className={styles.imageOverlay}></div>
          <div className={styles.imageLeft}>
            <Image src="/book3.jpg" alt="Library books" width={250} height={300} className={styles.retroImage} />
          </div>
          <div className={styles.imageCenter}>
            <Image src="/book1.jpg" alt="Vintage book stack" width={400} height={500} className={styles.retroImage} />
          </div>
          <div className={styles.imageRight}>
            <Image src="/book2.jpg" alt="Open notebook" width={280} height={350} className={styles.retroImage} />
          </div>
        </div>
      </section>
    </main>
  );
}
