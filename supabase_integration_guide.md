# Supabase Integration Guide - Notes Platform

Complete setup guide for using Supabase as your backend + file storage solution.

---

## 1. What is Supabase?

```
Supabase = Open-source Firebase alternative

Includes:
✅ PostgreSQL Database (already using!)
✅ File Storage (for notes)
✅ Authentication (email, OAuth)
✅ Real-time subscriptions
✅ Vector embeddings (for future search)
✅ Free tier: Generous for small apps

Perfect for: College projects, startups, indie hackers
```

---

## 2. Step-by-Step Setup

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Sign up"**
3. Register with email or GitHub
4. Verify email
5. Create a new organization

### Step 2: Create Project

1. Click **"New Project"**
2. Fill in:
   ```
   Project Name: Notes Platform (or your college name)
   Database Password: [Strong password - save this!]
   Region: Asia (Singapore) or closest to you
   ```
3. Click **"Create new project"**
4. Wait 3-5 minutes for setup

### Step 3: Get Credentials

After project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   ```
   Project URL: https://your-project.supabase.co
   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Save to `.env`:
   ```
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

### Step 4: Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **"Create a new bucket"**
3. Name it: `notes`
4. Make it **Public** (so users can download)
5. Click **"Create bucket"**

### Step 5: Set Security Rules

1. Click on `notes` bucket
2. Go to **Policies**
3. Add these policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload notes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'notes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read own notes
CREATE POLICY "Users can read own notes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'notes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete own notes
CREATE POLICY "Users can delete own notes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'notes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read (anyone can download)
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'notes');
```

---

## 3. Database Setup

### Create Tables in Supabase Dashboard

Go to **SQL Editor** → paste these queries:

```sql
-- Users (Supabase auth_users auto-created, add custom fields)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  full_name varchar(255),
  branch varchar(100),
  year_of_study integer,
  avatar_url varchar(500),
  bio text,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id bigserial primary key,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title varchar(255) NOT NULL,
  description text,
  
  file_name varchar(255),
  file_path varchar(500),  -- notes/user-id/file-name
  file_size_mb decimal(10, 2),
  file_type varchar(50),
  
  note_type varchar(50) NOT NULL,  -- 'textbook' or 'handwritten'
  branch varchar(100),
  year_of_study integer,
  subject varchar(255),
  
  view_count integer default 0,
  download_count integer default 0,
  
  is_public boolean default true,
  
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp,
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id),
  INDEX idx_subject (subject),
  INDEX idx_user_id (user_id),
  INDEX idx_note_type (note_type)
);

-- Ratings & Reviews
CREATE TABLE IF NOT EXISTS ratings (
  id bigserial primary key,
  note_id bigint NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp,
  
  UNIQUE(note_id, user_id),  -- One rating per user per note
  FOREIGN KEY (note_id) REFERENCES notes(id),
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Collections (for users to organize notes)
CREATE TABLE IF NOT EXISTS collections (
  id bigserial primary key,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title varchar(255) NOT NULL,
  description text,
  
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp,
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Collection Notes (many-to-many)
CREATE TABLE IF NOT EXISTS collection_notes (
  collection_id bigint NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  note_id bigint NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  
  added_at timestamp default current_timestamp,
  
  PRIMARY KEY (collection_id, note_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public notes visible" ON notes FOR SELECT USING (is_public = true);
CREATE POLICY "Users see own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public ratings visible" ON ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ratings" ON ratings FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can see own collections" ON collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create collections" ON collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON collections FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage collection notes" ON collection_notes FOR ALL USING (
  collection_id IN (SELECT id FROM collections WHERE user_id = auth.uid())
);
```

---

## 4. Backend Setup (Node.js)

### Install Dependencies

```bash
npm install @supabase/supabase-js dotenv cors express
```

### Create Supabase Client

**File: `lib/supabase.js`**

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Server-side: Use service role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create client
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase, supabaseAdmin };
```

### Authentication Endpoints

**File: `routes/auth.js`**

```javascript
const express = require('express');
const { supabase, supabaseAdmin } = require('../lib/supabase');

const router = express.Router();

// Send magic link
router.post('/send-magic-link', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Check if email is from college domain
    const collegeDomains = process.env.COLLEGE_DOMAINS.split(',');
    const domain = email.split('@')[1];
    
    if (!collegeDomains.includes(domain)) {
      return res.status(400).json({ 
        error: 'Please use your college email' 
      });
    }

    // Send magic link via Supabase
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.APP_URL}/auth/callback`,
      },
    });

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Check your email for login link',
      expires_in: 900
    });

  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify email callback
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) throw error;

    // Create or update profile
    const user = data.user;
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
      }, { onConflict: 'id' });

    if (profileError) console.error('Profile error:', profileError);

    // Return session
    res.json({
      success: true,
      session: data.session,
      user: data.user,
    });

  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) throw error;

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    res.json({
      user: data.user,
      profile: profile || null,
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Update profile
router.post('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { full_name, branch, year_of_study, bio } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: user, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw authError;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        branch,
        year_of_study,
        bio,
        updated_at: new Date(),
      })
      .eq('id', user.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, profile: data });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      await supabase.auth.signOut();
    }

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Notes Upload/Download Endpoints

**File: `routes/notes.js`**

```javascript
const express = require('express');
const multer = require('multer');
const { supabase, supabaseAdmin } = require('../lib/supabase');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to verify auth
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;

    req.user = data.user;
    next();

  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Upload note
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const {
      title,
      description,
      note_type,
      subject,
      branch,
      year_of_study,
    } = req.body;

    // Validate
    if (!title || !note_type || !subject) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file
    const file = req.file;
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (file.size > maxSize) {
      return res.status(400).json({ 
        error: 'File too large (max 100MB)' 
      });
    }

    // Allowed types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: 'File type not allowed' 
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.originalname.split('.').pop();
    const fileName = `${timestamp}-${title.replace(/\s+/g, '-')}.${ext}`;
    const filePath = `${req.user.id}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('notes')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('notes')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Save metadata to database
    const { data: noteData, error: dbError } = await supabase
      .from('notes')
      .insert({
        user_id: req.user.id,
        title,
        description: description || null,
        file_name: fileName,
        file_path: filePath,
        file_size_mb: (file.size / (1024 * 1024)).toFixed(2),
        file_type: file.mimetype,
        note_type,
        subject,
        branch: branch || null,
        year_of_study: year_of_study || null,
        is_public: true,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    res.json({
      success: true,
      note: {
        id: noteData.id,
        title: noteData.title,
        file_url: fileUrl,
        file_size_mb: noteData.file_size_mb,
        created_at: noteData.created_at,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download note
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    // Get note from database
    const { data: note, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (notesError) throw notesError;
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Increment download count
    await supabase
      .from('notes')
      .update({ download_count: note.download_count + 1 })
      .eq('id', id);

    // Generate signed URL (valid for 1 hour)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('notes')
      .createSignedUrl(note.file_path, 3600);

    if (urlError) throw urlError;

    res.json({
      success: true,
      download_url: urlData.signedUrl,
      file_name: note.file_name,
      expires_in: 3600,
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all notes (with filtering)
router.get('/', async (req, res) => {
  try {
    const { subject, note_type, branch, year, limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from('notes')
      .select('*, profiles(full_name, avatar_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (subject) query = query.eq('subject', subject);
    if (note_type) query = query.eq('note_type', note_type);
    if (branch) query = query.eq('branch', branch);
    if (year) query = query.eq('year_of_study', parseInt(year));

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      notes: data,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete note
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (noteError) throw noteError;
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('notes')
      .remove([note.file_path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    res.json({ success: true, message: 'Note deleted' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rate note
router.post('/:id/rate', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating' });
    }

    const { data, error } = await supabase
      .from('ratings')
      .upsert({
        note_id: id,
        user_id: req.user.id,
        rating,
        comment: comment || null,
      }, { onConflict: 'note_id,user_id' })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, rating: data });

  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 5. Frontend Setup (React)

### Install Dependencies

```bash
npm install @supabase/supabase-js axios
```

### Create Supabase Client

**File: `src/lib/supabaseClient.js`**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Auth Context

**File: `src/contexts/AuthContext.jsx`**

```javascript
import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setProfile(profileData);
      }
      
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const sendMagicLink = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      sendMagicLink, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Upload Note Component

**File: `src/components/UploadNote.jsx`**

```javascript
import { useState, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../contexts/AuthContext';

export const UploadNote = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [noteType, setNoteType] = useState('textbook');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file || !title || !subject) {
      setError('All fields required');
      return;
    }

    if (!user) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const fileName = `${timestamp}-${title.replace(/\s+/g, '-')}.${ext}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('notes')
        .getPublicUrl(filePath);

      // Save to database
      const { data: noteData, error: dbError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title,
          file_name: fileName,
          file_path: filePath,
          file_size_mb: (file.size / (1024 * 1024)).toFixed(2),
          file_type: file.type,
          note_type: noteType,
          subject,
          is_public: true,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setSuccess(true);
      setFile(null);
      setTitle('');
      setSubject('');
      setNoteType('textbook');

      // Reset success message
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>📤 Upload Note</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">✅ Note uploaded!</div>}

      <form onSubmit={handleUpload}>
        {/* Note Type Selection */}
        <div className="form-group">
          <label>Note Type</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="textbook"
                checked={noteType === 'textbook'}
                onChange={(e) => setNoteType(e.target.value)}
              />
              📖 Textbook
            </label>
            <label>
              <input
                type="radio"
                value="handwritten"
                checked={noteType === 'handwritten'}
                onChange={(e) => setNoteType(e.target.value)}
              />
              ✍️ Handwritten
            </label>
          </div>
        </div>

        {/* File Upload */}
        <div className="form-group">
          <label>Select File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".pdf,.docx,.pptx,.jpg,.png"
            required
          />
          {file && <p>Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)</p>}
        </div>

        {/* Title */}
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Database Normalization"
            required
          />
        </div>

        {/* Subject */}
        <div className="form-group">
          <label>Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Database Systems"
            required
          />
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Note'}
        </button>
      </form>
    </div>
  );
};
```

### Login Component

**File: `src/components/Login.jsx`**

```javascript
import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const Login = () => {
  const { sendMagicLink } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate college email
    if (!email.includes('.ac.in') && !email.includes('.edu')) {
      setError('Please use your college email');
      setLoading(false);
      return;
    }

    const { error } = await sendMagicLink(email);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
      setEmail('');
    }

    setLoading(false);
  };

  if (sent) {
    return (
      <div className="auth-modal">
        <h2>✅ Check Your Email</h2>
        <p>We sent a login link to your email.</p>
        <p>Click the link to get instant access.</p>
        <p className="text-sm text-gray-500">Link expires in 15 minutes</p>
        <button onClick={() => setSent(false)}>← Try another email</button>
      </div>
    );
  }

  return (
    <div className="auth-modal">
      <h2>📧 Sign In</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@iiit.ac.in"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Login Link'}
        </button>
      </form>

      <p className="text-sm text-gray-500">
        ✓ Use your college email<br/>
        ✓ No password needed<br/>
        ✓ Magic link in 30 seconds
      </p>
    </div>
  );
};
```

---

## 6. Environment Configuration

### `.env.local` (Frontend)

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### `.env` (Backend)

```
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# College Domains
COLLEGE_DOMAINS=iiit.ac.in,iit.ac.in,bits-pilani.ac.in

# App URL
APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 7. Authentication Callback Handler

**File: `src/pages/AuthCallback.jsx`**

```javascript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase handles the callback automatically
      // This page just confirms auth was successful
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Create profile if first time
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profile) {
          // First time user - redirect to profile setup
          navigate('/profile-setup');
        } else {
          // Existing user - redirect to dashboard
          navigate('/dashboard');
        }
      } else {
        // No session - redirect to login
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="loading">
      <p>Verifying your email...</p>
    </div>
  );
};
```

---

## 8. Download Notes Component

**File: `src/components/NotesList.jsx`**

```javascript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    note_type: 'all',
  });

  useEffect(() => {
    fetchNotes();
  }, [filters]);

  const fetchNotes = async () => {
    setLoading(true);

    let query = supabase
      .from('notes')
      .select('*, profiles(full_name)')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (filters.subject) query = query.eq('subject', filters.subject);
    if (filters.note_type !== 'all') query = query.eq('note_type', filters.note_type);

    const { data, error } = await query.limit(20);

    if (!error) {
      setNotes(data);
    }

    setLoading(false);
  };

  const handleDownload = async (note) => {
    try {
      const { data: urlData } = supabase.storage
        .from('notes')
        .getPublicUrl(note.file_path);

      // Increment download count
      await supabase
        .from('notes')
        .update({ download_count: note.download_count + 1 })
        .eq('id', note.id);

      // Create link and download
      const link = document.createElement('a');
      link.href = urlData.publicUrl;
      link.download = note.file_name;
      link.click();

    } catch (error) {
      alert('Download failed: ' + error.message);
    }
  };

  if (loading) return <div>Loading notes...</div>;

  return (
    <div className="notes-container">
      <h2>📚 Browse Notes</h2>

      {/* Filters */}
      <div className="filters">
        <select
          value={filters.note_type}
          onChange={(e) => setFilters({ ...filters, note_type: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="textbook">📖 Textbook</option>
          <option value="handwritten">✍️ Handwritten</option>
        </select>

        <input
          type="text"
          placeholder="Search subject..."
          value={filters.subject}
          onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
        />
      </div>

      {/* Notes Grid */}
      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            <h3>{note.title}</h3>
            <p className="subject">{note.subject}</p>
            <p className="by">By {note.profiles?.full_name}</p>
            <p className="type">
              {note.note_type === 'textbook' ? '📖' : '✍️'} {note.note_type}
            </p>
            <div className="stats">
              <span>👁️ {note.view_count}</span>
              <span>📥 {note.download_count}</span>
              <span>⭐ {note.rating || '-'}</span>
            </div>
            <button onClick={() => handleDownload(note)}>
              📥 Download
            </button>
          </div>
        ))}
      </div>

      {notes.length === 0 && <p>No notes found</p>}
    </div>
  );
};
```

---

## 9. API Setup in Express

**File: `server.js`**

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '100mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 10. Deployment Checklist

### Before Going Live

- [ ] Set secure Supabase database password
- [ ] Enable all RLS policies
- [ ] Configure storage bucket security rules
- [ ] Add college domain email validation
- [ ] Test file upload/download
- [ ] Test authentication flow
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Enable CORS for your domain
- [ ] Test on mobile
- [ ] Backup database
- [ ] Set up monitoring alerts

### Supabase Settings

1. Go to **Settings** → **Security**
2. Enable "Enable database webhooks"
3. Go to **Email Templates** → Customize magic link email
4. Set up backups in **Backups**

### Monitor Usage

In Supabase dashboard:
- Check **Storage** usage
- Monitor **Database** size
- Check **Realtime** bandwidth
- Review **Auth** usage

---

## 11. Scaling Tips

### When Storage Grows

```
Current: 1GB free (20-30 notes)
↓
Month 2-3: Consider paid plan
↓
Paid Plans:
- Pro: $25/month (8GB storage)
- Business: $99/month (100GB storage)
- Enterprise: Custom pricing
```

### Optimize Storage

```sql
-- Monitor storage usage
SELECT
  sum(file_size_mb) as total_size_mb,
  count(*) as total_notes
FROM notes;

-- Find largest files
SELECT
  title,
  file_size_mb,
  user_id
FROM notes
ORDER BY file_size_mb DESC
LIMIT 10;
```

### Backup Strategy

```
1. Supabase handles backups automatically
2. Manual backup: Export from Supabase dashboard
3. Set up daily backups (if critical)
4. Keep backup of storage files (optional)
```

---

## 12. Common Issues & Solutions

### Issue: "Storage bucket not found"

```
Solution:
1. Go to Supabase Dashboard
2. Click Storage
3. Create bucket named "notes"
4. Make it Public
```

### Issue: "CORS error when uploading"

```
Solution:
1. Supabase → Settings → API
2. Check CORS configuration
3. Add your domain to allowed origins
4. Or use server-side upload
```

### Issue: "Magic link not received"

```
Solution:
1. Check spam folder
2. Verify email domain is in whitelist
3. Check email service status
4. Resend link (rate limit: 5 per hour)
```

### Issue: "Storage bucket full"

```
Solution:
1. Upgrade Supabase plan
2. Delete unused notes
3. Compress old files
4. Archive to cheaper storage
```

---

## 13. Project Structure

```
your-project/
├── public/
├── src/
│   ├── components/
│   │   ├── UploadNote.jsx
│   │   ├── NotesList.jsx
│   │   ├── Login.jsx
│   │   └── AuthModal.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── pages/
│   │   ├── AuthCallback.jsx
│   │   ├── Dashboard.jsx
│   │   └── ProfileSetup.jsx
│   ├── App.jsx
│   └── index.css
├── server/
│   ├── routes/
│   │   ├── auth.js
│   │   └── notes.js
│   ├── lib/
│   │   └── supabase.js
│   └── server.js
├── .env.local (frontend)
├── .env (backend)
├── package.json
└── README.md
```

---

## 14. Next Steps

1. ✅ Create Supabase account
2. ✅ Set up project & database
3. ✅ Create storage bucket
4. ✅ Copy credentials to .env
5. ✅ Implement backend routes
6. ✅ Implement frontend components
7. ✅ Test upload/download
8. ✅ Test authentication
9. ✅ Deploy to production
10. ✅ Monitor usage

---

**You're ready to build with Supabase! 🚀**

Would you like me to create:
- A React Router setup guide?
- A complete styling guide?
- A deployment guide for Vercel/Heroku?
- A testing guide?
