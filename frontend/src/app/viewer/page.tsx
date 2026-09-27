'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import styles from './page.module.css';

function SecureViewerContent() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get('url');

  useEffect(() => {
    // Aggressively block Ctrl+P and Ctrl+S
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'p' || e.key === 's' || e.key === 'P' || e.key === 'S') {
          e.preventDefault();
          e.stopPropagation();
          alert('Downloading and printing are disabled for this document.');
          return false;
        }
      }
    };

    // Block right click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  if (!fileUrl) return <div className={styles.error}>No document specified.</div>;

  return (
    <div className={styles.container}>
      {/* Global CSS block to disable printing completely */}
      <style dangerouslySetInnerHTML={{__html: '@media print { body { display: none !important; } }'}} />
      
      <nav className={styles.navbar}>
        <button onClick={() => window.close()} className={styles.closeBtn}>
          CLOSE VIEWER
        </button>
      </nav>

      {/* Embed the PDF securely without a toolbar */}
      <div className={styles.viewerWrapper}>
        <iframe 
          src={fileUrl + '#toolbar=0&navpanes=0&scrollbar=0'} 
          className={styles.iframe}
          title="Secure Document Viewer"
        />
        <div className={styles.overlay}></div>
      </div>
    </div>
  );
}

export default function SecureViewer() {
  return (
    <Suspense fallback={<div className={styles.container}>Loading secure viewer...</div>}>
      <SecureViewerContent />
    </Suspense>
  );
}
