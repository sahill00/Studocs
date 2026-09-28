const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const xss = require('xss');
const redisClient = require('../redisClient');

const router = express.Router();

// Initialize Supabase (Use dummy keys for now as requested, user will replace them)
const supabaseUrl = process.env.SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Set up Multer for memory storage (we will upload buffer to Supabase)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, and WebP are allowed.'));
    }
  }
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. You must be logged in to upload notes.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
    req.user = user;
    next();
  });
};

// Get all public notes (with filtering)
router.get('/', async (req, res) => {
  try {
    let { branch, academic_year, semester, note_type, search } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 50);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    
    // Check cache if there are no specific search filters
    const isCacheable = !branch && !academic_year && !semester && !note_type && !search;
    const cacheKey = `notes_feed_${limit}_${offset}`;
    
    if (isCacheable && redisClient.isReady) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const { rows, count } = JSON.parse(cached);
        res.setHeader('X-Total-Count', count);
        res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
        return res.json(rows);
      }
    }
    
    let query = 'SELECT n.*, u.full_name as uploader_name FROM notes n JOIN users u ON n.uploader_id = u.id WHERE n.visibility = $1 AND (n.status IS NULL OR n.status != $2) AND n.deleted_at IS NULL';
    let params = ['PUBLIC', 'hidden'];
    let paramCount = 3;
    
    if (branch) { query += ` AND n.branch = $${paramCount++}`; params.push(branch); }
    if (academic_year) { query += ` AND n.academic_year = $${paramCount++}`; params.push(academic_year); }
    if (semester) { query += ` AND n.semester = $${paramCount++}`; params.push(semester); }
    if (note_type) { query += ` AND n.note_type = $${paramCount++}`; params.push(note_type); }
    if (search) { 
      query += ` AND (n.title ILIKE $${paramCount} OR n.description ILIKE $${paramCount} OR n.branch ILIKE $${paramCount})`; 
      params.push(`%${search}%`); 
      paramCount++;
    }
    
    const countQuery = query.replace('SELECT n.*, u.full_name as uploader_name', 'SELECT COUNT(*)');
    query += ` ORDER BY COALESCE(n.upvotes, 0) DESC, n.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    
    // We only pass params for count query without limit and offset
    const countParams = [...params];
    params.push(limit, offset);
    
    const countResult = await db.query(countQuery, countParams);
    const result = await db.query(query, params);
    
    const totalCount = countResult.rows[0].count;
    
    if (isCacheable && redisClient.isReady) {
      // Cache for 5 minutes
      await redisClient.setEx(cacheKey, 300, JSON.stringify({ rows: result.rows, count: totalCount }));
    }
    
    res.setHeader('X-Total-Count', totalCount);
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get uploads by the authenticated user
router.get('/my-uploads', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.*, u.full_name as uploader_name 
       FROM notes n JOIN users u ON n.uploader_id = u.id 
       WHERE n.uploader_id = $1 AND n.deleted_at IS NULL
       ORDER BY n.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user uploads:', error);
    res.status(500).json({ error: 'Failed to fetch your uploads' });
  }
});

// Upload a new note (requires authentication)
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { 
      note_type, difficulty_level = null, 
      visibility = 'PUBLIC', branch = null, academic_year = null, semester = null, exam_year = null
    } = req.body;
    
    // Sanitize user inputs
    const title = xss(req.body.title);
    const description = req.body.description ? xss(req.body.description) : null;
    
    const examYearVal = (exam_year === '' || exam_year === 'undefined') ? null : exam_year;
    const academicYearVal = (academic_year === '' || academic_year === 'undefined') ? null : academic_year;
    const semesterVal = (semester === '' || semester === 'undefined') ? null : semester;
    
    const uploader_id = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    
    // Calculate SHA-256 hash of the file buffer
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    
    // Check if the hash already exists
    const duplicateCheck = await db.query('SELECT id FROM notes WHERE file_hash = $1 AND deleted_at IS NULL', [fileHash]);
    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_FILE',
        message: 'This file has already been uploaded.',
        existingNoteId: duplicateCheck.rows[0].id
      });
    }

    const timestamp = Date.now();
    const ext = file.originalname.split('.').pop() || 'pdf';
    const fileName = `${timestamp}-${title.replace(/\s+/g, '-')}.${ext}`;
    const filePath = `${uploader_id}/${fileName}`;

    // Upload to Supabase Storage with retry logic
    let uploadData, uploadError;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      const res = await supabase.storage
        .from('notes')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });
        
      uploadData = res.data;
      uploadError = res.error;
      
      if (!uploadError) break;
      attempts++;
      console.log(`Supabase upload failed, retrying attempt ${attempts}...`);
      await new Promise(r => setTimeout(r, 1000 * attempts)); // exponential-ish backoff
    }

    if (uploadError) {
      console.error("Supabase upload error after retries:", uploadError);
      return res.status(500).json({ error: 'Failed to upload file to storage after multiple attempts.' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('notes')
      .getPublicUrl(filePath);

    const file_url = urlData.publicUrl;
    const file_size_bytes = file.size;
    const file_type = file.mimetype;
    
    try {
      const result = await db.query(
        `INSERT INTO notes 
         (title, description, note_type, difficulty_level, visibility, file_url, file_size_bytes, file_type, branch, academic_year, semester, exam_year, uploader_id, file_hash) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
        [title, description, note_type, difficulty_level, visibility, file_url, file_size_bytes, file_type, branch, academicYearVal, semesterVal, examYearVal, uploader_id, fileHash]
      );
      
      if (redisClient.isReady) {
        await redisClient.flushDb().catch(console.error);
      }
      res.status(201).json(result.rows[0]);
    } catch (dbError) {
      // Handle race condition: Postgres unique violation (code 23505)
      if (dbError.code === '23505') {
        // Find existing note id if possible
        const existing = await db.query('SELECT id FROM notes WHERE file_hash = $1 AND deleted_at IS NULL', [fileHash]);
        const existingNoteId = existing.rows.length > 0 ? existing.rows[0].id : null;
        
        // Clean up orphaned Supabase file safely in background
        supabase.storage.from('notes').remove([filePath]).catch(console.error);

        return res.status(409).json({
          success: false,
          code: 'DUPLICATE_FILE',
          message: 'This file has already been uploaded.',
          existingNoteId
        });
      }
      throw dbError; // Rethrow to be caught by outer catch block
    }
  } catch (error) {
    console.error('Error uploading note:', error);
    res.status(500).json({ error: 'Failed to upload note' });
  }
});

// Delete a note (requires authentication and ownership)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE notes SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND uploader_id = $2 AND deleted_at IS NULL RETURNING id, file_url',
      [req.params.id, req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this note or note not found' });
    }

    const note = result.rows[0];
    if (note.file_url) {
      try {
        const filePath = note.file_url.split('/notes/')[1];
        if (filePath) {
          await supabase.storage.from('notes').remove([filePath]);
        }
      } catch (err) {
        console.error('Failed to delete file from Supabase:', err);
      }
    }

    if (redisClient.isReady) {
      await redisClient.flushDb().catch(console.error);
    }
    
    res.json({ success: true, message: 'Note and file deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Update a note (requires authentication and ownership)
router.put('/:id', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const visibility = req.body.visibility;
    const title = xss(req.body.title);
    const description = req.body.description ? xss(req.body.description) : null;
    
    // If a new file is uploaded, upload it to Supabase first
    let file_url = null;
    let file_size_bytes = null;
    let file_type = null;

    if (req.file) {
      const file = req.file;
      const timestamp = Date.now();
      const ext = file.originalname.split('.').pop() || 'pdf';
      const fileName = `${timestamp}-${title.replace(/\s+/g, '-')}.${ext}`;
      const filePath = `${req.user.userId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return res.status(500).json({ error: 'Failed to upload replacement file' });
      }

      const { data: urlData } = supabase.storage
        .from('notes')
        .getPublicUrl(filePath);

      file_url = urlData.publicUrl;
      file_size_bytes = file.size;
      file_type = file.mimetype;
    }

    let query = `UPDATE notes SET title = $1, description = $2, visibility = $3`;
    let params = [title, description, visibility];
    let paramCount = 4;

    if (file_url) {
      query += `, file_url = $${paramCount++}, file_size_bytes = $${paramCount++}, file_type = $${paramCount++}`;
      params.push(file_url, file_size_bytes, file_type);
    }

    query += ` WHERE id = $${paramCount++} AND uploader_id = $${paramCount} AND deleted_at IS NULL RETURNING *`;
    params.push(req.params.id, req.user.userId);

    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to edit this note or note not found' });
    }
    
    res.json({ success: true, note: result.rows[0] });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Optional auth middleware
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) req.user = user;
      next();
    });
  } else {
    next();
  }
};

// Get a specific note by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.*, u.full_name as uploader_name 
       FROM notes n JOIN users u ON n.uploader_id = u.id 
       WHERE n.id = $1 AND (n.status IS NULL OR n.status != 'hidden') AND n.deleted_at IS NULL`, 
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const note = result.rows[0];
    const isOwner = req.user && req.user.userId === note.uploader_id;
    const isAdmin = req.user && req.user.role === 'admin';

    if (note.visibility === 'PRIVATE' && !isOwner && !isAdmin) {
      return res.status(403).json({ error: 'This note is private' });
    }
    
    // Increment view count asynchronously
    db.query('UPDATE notes SET view_count = view_count + 1 WHERE id = $1', [req.params.id]).catch(console.error);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching note details:', error);
    res.status(500).json({ error: 'Failed to fetch note details' });
  }
});
// Upvote a note (requires auth)
router.post('/:id/upvote', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE notes SET upvotes = COALESCE(upvotes, 0) + 1 WHERE id = $1 RETURNING upvotes, uploader_id, title',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const { upvotes, uploader_id, title } = result.rows[0];
    
    if (uploader_id && uploader_id !== req.user.userId) {
      const userRes = await db.query('SELECT full_name FROM users WHERE id = $1', [req.user.userId]);
      const upvoterName = userRes.rows.length > 0 ? userRes.rows[0].full_name || 'Someone' : 'Someone';
      
      await db.query(
        `INSERT INTO notifications (user_id, actor_id, type, entity_id, message) 
         VALUES ($1, $2, $3, $4, $5)`,
        [uploader_id, req.user.userId, 'upvote', req.params.id, `${upvoterName} upvoted your note: "${title}"`]
      );
    }
    
    res.json({ success: true, upvotes });
  } catch (error) {
    console.error('Error upvoting note:', error);
    res.status(500).json({ error: 'Failed to upvote note' });
  }
});

// Record a download
router.post('/:id/download', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE notes SET download_count = COALESCE(download_count, 0) + 1 WHERE id = $1 RETURNING download_count',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ success: true, download_count: result.rows[0].download_count });
  } catch (error) {
    console.error('Error recording download:', error);
    res.status(500).json({ error: 'Failed to record download' });
  }
});

module.exports = router;
