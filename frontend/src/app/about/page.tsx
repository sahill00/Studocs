'use client';

import styles from './page.module.css';

export default function About() {
  return (
    <main className={styles.main}>
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

      <section className={styles.aboutSection}>
        <div className={styles.aboutContainer}>
          <h2 className={styles.aboutTitle}>ABOUT STUDOCS</h2>
          <p className={styles.aboutText}>
            StuDocs is a community-driven platform designed exclusively for students to share, discover, and collaborate on academic resources. Whether you are looking for structured textbook summaries or handwritten lecture notes, StuDocs connects you with the materials you need to ace your exams. 
          </p>
          <div className={styles.aboutFeatures}>
            <div className={styles.featureBox}>
              <h3>📚 Extensive Library</h3>
              <p>Access hundreds of verified notes organized by branch, year, and subject.</p>
            </div>
            <div className={styles.featureBox}>
              <h3>🔒 Secure Sharing</h3>
              <p>Upload your documents securely to the cloud with full control over visibility.</p>
            </div>
            <div className={styles.featureBox}>
              <h3>🎓 Community Driven</h3>
              <p>Built by students, for students. Rate and discover the best study materials.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
