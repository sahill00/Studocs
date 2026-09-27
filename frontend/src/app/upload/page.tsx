'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function UploadNote() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    note_type: '',
    title: '',
    branch: '',
    academic_year: '',
    semester: '',
    exam_year: '',
    difficulty_level: 'Intermediate',
    visibility: 'PUBLIC',
    description: '',
    file_url: '' // Must be filled by the user
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [duplicateNoteId, setDuplicateNoteId] = useState<number | null>(null);

  useEffect(() => {
    // Only logged in users can access the upload page
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to upload notes. Redirecting to home...");
      router.push('/');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, note_type: type });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file_url) {
      alert('You must select a file before uploading!');
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to upload!');
        router.push('/');
        return;
      }
      
      const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert('You must select a file before uploading!');
        setLoading(false);
        return;
      }
      
      const file = fileInput.files[0];
      const maxSizeBytes = 50 * 1024 * 1024; // 50 MB
      if (file.size > maxSizeBytes) {
        alert(`Your file is ${Math.round(file.size / (1024 * 1024))}MB, which is too large! Please compress it to under 50MB and try again.`);
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'file_url') { // Skip the mock url field
          submitData.append(key, (formData as any)[key]);
        }
      });
      submitData.append('file', fileInput.files[0]);

      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/notes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (response.ok) {
        setSuccess(true);
      } else if (response.status === 409) {
        const errorData = await response.json();
        if (errorData.code === 'DUPLICATE_FILE') {
          setDuplicateNoteId(errorData.existingNoteId || null);
          setStep(4); // Use step 4 for duplicate error
        } else {
          alert('Upload failed: ' + errorData.message);
        }
      } else {
        const errorData = await response.json();
        alert('Upload failed: ' + (errorData.error || 'Unknown API error'));
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Navbar */}
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
          <a href="/bookmarks" className={styles.navLink} style={{ marginRight: '2rem' }}>BOOKMARKS</a>
          <a href="/browse" className={styles.navLink}>BROWSE</a>
        </div>
      </nav>

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>CONTRIBUTE</h1>
        <p className={styles.subtitle}>SHARE YOUR KNOWLEDGE WITH THE COMMUNITY</p>

        {success ? (
          <div className={styles.successState}>
            <h2>UPLOAD SUCCESSFUL</h2>
            <p>Your note has been added to the library.</p>
            <div className={styles.actionButtons}>
              <button className={styles.btnPrimary} onClick={() => window.location.reload()}>UPLOAD ANOTHER</button>
              <a href="/browse" className={styles.btnSecondary}>VIEW IN BROWSE</a>
            </div>
          </div>
        ) : (
          <div className={styles.uploadContainer}>
            
            {/* Step 1: Type Selection */}
            {step === 1 && (
              <div className={styles.step}>
                <h3 className={styles.stepTitle}>STEP 1: SELECT RESOURCE TYPE</h3>
                <div className={styles.typeCards}>
                  <div className={styles.typeCard} onClick={() => handleTypeSelect('TEXTBOOK')}>
                    <h4>TEXTBOOK NOTES</h4>
                    <p>Organized summaries directly from course textbooks.</p>
                  </div>
                  <div className={styles.typeCard} onClick={() => handleTypeSelect('HANDWRITTEN')}>
                    <h4>HANDWRITTEN LECTURES</h4>
                    <p>Personal notes taken during class, diagrams, and quick jots.</p>
                  </div>
                  <div className={styles.typeCard} onClick={() => handleTypeSelect('PYQS')}>
                    <h4>PREVIOUS YEAR QUESTIONS</h4>
                    <p>Past exam papers and question banks for practice.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details Form */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className={styles.form}>
                <h3 className={styles.stepTitle}>STEP 2: DETAILS</h3>
                
                <div className={styles.dragDrop} onClick={() => document.getElementById('fileUpload')?.click()}>
                  <input 
                    type="file" 
                    id="fileUpload" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        // For MVP: Just show the file name. 
                        // In production, we'd upload this file to S3 here.
                        setFormData({ ...formData, file_url: e.target.files[0].name });
                      }
                    }} 
                  />
                  {formData.file_url === 'https://example.com/uploaded-file.pdf' || formData.file_url === '' ? (
                    <>
                      <span>CLICK HERE TO SELECT FILE</span>
                      <small>Supported: PDF, DOCX, ZIP (Max 50MB)</small>
                    </>
                  ) : (
                    <>
                      <span style={{ color: '#fff' }}>FILE SELECTED: {formData.file_url}</span>
                      <small>Click to change file</small>
                    </>
                  )}
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>TITLE *</label>
                    <input required type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Complete DSA Midterm Notes" className={styles.input} />
                  </div>

                  <div className={styles.formGroup}>
                    <label>BRANCH *</label>
                    <select required name="branch" value={formData.branch} onChange={handleInputChange} className={styles.input}>
                      <option value="">Select Branch</option>
                      <option value="CSE">Computer Science</option>
                      <option value="ECE">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>ACADEMIC YEAR *</label>
                    <select required name="academic_year" value={formData.academic_year} onChange={handleInputChange} className={styles.input}>
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>SEMESTER *</label>
                    <select required name="semester" value={formData.semester} onChange={handleInputChange} className={styles.input}>
                      <option value="">Select Semester</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                      <option value="8">8</option>
                    </select>
                  </div>
                  
                  {formData.note_type === 'PYQS' && (
                    <div className={styles.formGroup}>
                      <label>EXAM YEAR *</label>
                      <input required type="number" name="exam_year" value={formData.exam_year} onChange={handleInputChange} placeholder="e.g. 2023" className={styles.input} min="2000" max={new Date().getFullYear()} />
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label>DIFFICULTY</label>
                    <select name="difficulty_level" value={formData.difficulty_level} onChange={handleInputChange} className={styles.input}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>VISIBILITY</label>
                    <select name="visibility" value={formData.visibility} onChange={handleInputChange} className={styles.input}>
                      <option value="PUBLIC">Public (Everyone)</option>
                      <option value="COLLEGE_ONLY">My College Only</option>
                      <option value="PRIVATE">Private (Only Me)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>DESCRIPTION (OPTIONAL)</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="What topics are covered in these notes?" className={styles.textarea} rows={4} />
                </div>

                <div className={styles.actionButtons}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setStep(1)}>BACK</button>
                  <button type="submit" className={styles.btnPrimary} disabled={loading}>
                    {loading ? 'UPLOADING...' : 'UPLOAD & PUBLISH NOTE'}
                  </button>
                </div>
              </form>
            )}
            {/* Step 4: Duplicate Error */}
            {step === 4 && (
              <div className={styles.step}>
                <h3 className={styles.stepTitle} style={{ color: '#ffb74d' }}>⚠️ FILE ALREADY EXISTS</h3>
                <div style={{ background: '#1e1e1e', padding: '2rem', border: '1px solid #333', textAlign: 'center', marginTop: '1rem' }}>
                  <p style={{ color: '#ccc', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    This exact file has already been uploaded to Studocs.
                  </p>
                  <div className={styles.actionButtons} style={{ justifyContent: 'center' }}>
                    <button className={styles.btnSecondary} onClick={() => setStep(1)}>UPLOAD A DIFFERENT FILE</button>
                    {duplicateNoteId && (
                      <a href={`/notes/${duplicateNoteId}`} className={styles.btnPrimary} target="_blank" rel="noopener noreferrer">
                        VIEW EXISTING NOTE
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
