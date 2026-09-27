'use client';

import { useState } from 'react';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'magic' | 'password'>('magic');

  if (!isOpen) return null;

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (authMode === 'password') {
      try {
        const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/auth/login-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('token', data.auth_token);
          localStorage.setItem('user_id', data.user_id.toString());
          window.location.reload(); // Refresh to update nav state
        } else {
          setError(data.error || 'Login failed');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, intent: 'login' })
      });

      const data = await response.json();

      if (data.success) {
        setSent(true);
        if (data.dev_token) {
          setDevLink(`http://192.168.1.4:3000/auth/verify?token=${data.dev_token}`);
        }
      } else {
        setError(data.error || 'Failed to send magic link');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        {!sent ? (
          <>
            <h2 className={styles.title}>Sign In / Sign Up</h2>
            <p className={styles.subtitle}>Get instant access to engineering notes.</p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setAuthMode('magic')}
                style={{ flex: 1, padding: '0.5rem', background: authMode === 'magic' ? '#fff' : 'transparent', color: authMode === 'magic' ? '#000' : '#fff', border: '1px solid #fff', cursor: 'pointer' }}>
                Magic Link
              </button>
              <button 
                onClick={() => setAuthMode('password')}
                style={{ flex: 1, padding: '0.5rem', background: authMode === 'password' ? '#fff' : 'transparent', color: authMode === 'password' ? '#000' : '#fff', border: '1px solid #fff', cursor: 'pointer' }}>
                Password
              </button>
            </div>

            <form onSubmit={handleSendLink} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="student@iiit.ac.in"
                  className={styles.input}
                  required 
                />
              </div>

              {authMode === 'password' && (
                <div className={styles.inputGroup}>
                  <label>Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter your password"
                    className={styles.input}
                    required 
                  />
                </div>
              )}

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? 'PROCESSING...' : (authMode === 'password' ? 'LOGIN' : 'SEND MAGIC LINK')}
              </button>
            </form>

            <div className={styles.divider}>
              <span>OR</span>
            </div>

            <button className={styles.oauthBtn}>Continue with Google</button>
            <button className={styles.oauthBtn}>Continue with GitHub</button>
          </>
        ) : (
          <div className={styles.successState}>
            <h2>✅ Check Your Email</h2>
            <p>We sent a magic login link to:</p>
            <p className={styles.highlightEmail}>{email}</p>
            
            <p className={styles.infoText}>Click the link in your email to get instant access. This link expires in 15 minutes.</p>
            
            <button className={styles.secondaryBtn} onClick={() => setSent(false)} style={{ marginTop: '1rem' }}>
              Try a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
