'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    
    // Grab the token securely from the browser URL without triggering Next.js Suspense warnings
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMsg('No token found in the URL.');
      return;
    }

    hasFetched.current = true;

    const verifyToken = async () => {
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + `/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          // Save the auth token (in production, use secure HttpOnly cookies, but localStorage is fine for MVP)
          localStorage.setItem('token', data.auth_token);
          localStorage.setItem('user_id', data.user_id.toString());
          
          // Redirect after a brief moment
          setTimeout(() => {
            router.push(data.redirect_to || '/browse');
          }, 1500);
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Token verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg('Network error while verifying token.');
      }
    };

    verifyToken();
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      color: 'var(--text-main)',
      fontFamily: "'Space Mono', monospace"
    }}>
      <div style={{
        padding: '3rem',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        {status === 'verifying' && (
          <>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '1rem' }}>Verifying...</h2>
            <p style={{ color: '#888' }}>Please wait while we verify your magic link.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '1rem', color: '#4ade80' }}>Success!</h2>
            <p style={{ color: '#888' }}>Authentication complete. Redirecting you...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '1rem', color: '#f87171' }}>Verification Failed</h2>
            <p style={{ color: '#888', marginBottom: '2rem' }}>{errorMsg}</p>
            <button 
              onClick={() => router.push('/')}
              style={{
                background: 'transparent',
                border: '1px solid #fff',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
