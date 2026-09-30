'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    college_id: 1, // Defaulting to 1 (IIIT Hyderabad) based on our mock DB
    branch: '',
    year_of_study: '',
    password: ''
  });

  useEffect(() => {
    // In a real app, we'd fetch /api/auth/me to prefill this, but for MVP we just show the form
    // Let's at least get the token to ensure they're allowed here
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      // For MVP, we pass the email directly. In production, the backend would extract it from the JWT.
      const payload = {
        ...formData,
        year_of_study: parseInt(formData.year_of_study)
      };

      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (data.success) {
        if (data.auth_token) localStorage.setItem('token', data.auth_token);
        router.push('/browse');
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error during profile setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--text-main)',
      fontFamily: "'Space Mono', monospace",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4rem 2rem'
    }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', marginBottom: '0.5rem' }}>COMPLETE PROFILE</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', letterSpacing: '0.05em' }}>Required to upload notes and join groups.</p>

      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONFIRM EMAIL (For MVP) *</label>
          <input 
            type="email" 
            name="email"
            value={formData.email} 
            onChange={handleChange} 
            placeholder="student@iiit.ac.in"
            required
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '0.5rem 0',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FULL NAME *</label>
          <input 
            type="text" 
            name="full_name"
            value={formData.full_name} 
            onChange={handleChange} 
            required
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '0.5rem 0',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BRANCH *</label>
          <select 
            name="branch"
            value={formData.branch} 
            onChange={handleChange} 
            required
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '0.5rem 0',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          >
            <option value="" style={{ color: '#000' }}>Select Branch</option>
            <option value="Computer Science" style={{ color: '#000' }}>Computer Science</option>
            <option value="CSE - AIML" style={{ color: '#000' }}>CSE - AIML</option>
            <option value="CSE - IOT" style={{ color: '#000' }}>CSE - IOT</option>
            <option value="IT" style={{ color: '#000' }}>IT</option>
            <option value="EXTC" style={{ color: '#000' }}>EXTC</option>
            <option value="Civil" style={{ color: '#000' }}>Civil</option>
            <option value="Mech - Auto" style={{ color: '#000' }}>Mech - Auto</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>YEAR OF STUDY *</label>
          <select 
            name="year_of_study"
            value={formData.year_of_study} 
            onChange={handleChange} 
            required
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '0.5rem 0',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          >
            <option value="" style={{ color: '#000' }}>Select Year</option>
            <option value="1" style={{ color: '#000' }}>1st Year</option>
            <option value="2" style={{ color: '#000' }}>2nd Year</option>
            <option value="3" style={{ color: '#000' }}>3rd Year</option>
            <option value="4" style={{ color: '#000' }}>4th Year</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SET A PASSWORD (OPTIONAL)</label>
          <input 
            type="password" 
            name="password"
            value={formData.password} 
            onChange={handleChange} 
            placeholder="For faster login next time"
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '0.5rem 0',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
        </div>

        {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{error}</p>}

        <button 
          type="submit" 
          disabled={loading}
          style={{
            marginTop: '1rem',
            backgroundColor: '#fff',
            color: '#000',
            border: 'none',
            padding: '1rem',
            fontFamily: 'inherit',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'SAVING PROFILE...' : 'SAVE & CONTINUE TO BROWSE'}
        </button>
      </form>
    </div>
  );
}
