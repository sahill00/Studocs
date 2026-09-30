const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const redisClient = require('../redisClient');

const router = express.Router();

const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied.' });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    
    // Check if user has admin role in DB
    const result = await db.query('SELECT role FROM users WHERE id = $1', [user.userId]);
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required.' });
    }
    
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session.' });
  }
};

router.use(authenticateAdmin);

// Helper to log admin actions
const logAdminAction = async (adminId, action, entityType, entityId, details = null) => {
  try {
    await db.query(
      'INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [adminId, action, entityType, entityId, details]
    );
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
};

// Dashboard Overview
router.get('/overview', async (req, res) => {
  try {
    const cacheKey = 'admin_overview';
    if (redisClient.isReady) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }
    
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const notesCount = await db.query("SELECT COUNT(*) FROM notes WHERE status = 'active'");
    const commentsCount = await db.query('SELECT COUNT(*) FROM comments WHERE deleted_at IS NULL');
    const pendingReportsCount = await db.query("SELECT COUNT(*) FROM reports WHERE status = 'pending'");
    const resolvedReportsCount = await db.query("SELECT COUNT(*) FROM reports WHERE status = 'resolved'");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notesToday = await db.query('SELECT COUNT(*) FROM notes WHERE created_at >= $1', [today]);
    const reportsToday = await db.query('SELECT COUNT(*) FROM reports WHERE created_at >= $1', [today]);

    const result = {
      totalUsers: parseInt(usersCount.rows[0].count),
      totalNotes: parseInt(notesCount.rows[0].count),
      totalComments: parseInt(commentsCount.rows[0].count),
      pendingReports: parseInt(pendingReportsCount.rows[0].count),
      resolvedReports: parseInt(resolvedReportsCount.rows[0].count),
      notesToday: parseInt(notesToday.rows[0].count),
      reportsToday: parseInt(reportsToday.rows[0].count)
    };
    
    if (redisClient.isReady) {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(result)); // cache for 60 seconds
    }
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load overview.' });
  }
});

// GET all reports
router.get('/reports', async (req, res) => {
  try {
    const { status, type } = req.query; // type: note or comment
    
    let query = `
      SELECT r.*, u.full_name as reporter_name,
             n.title as note_title, c.content as comment_content
      FROM reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      LEFT JOIN notes n ON r.note_id = n.id
      LEFT JOIN comments c ON r.comment_id = c.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` AND r.status = $${params.length}`;
    }
    
    if (type === 'note') {
      query += ` AND r.note_id IS NOT NULL`;
    } else if (type === 'comment') {
      query += ` AND r.comment_id IS NOT NULL`;
    }
    
    query += ` ORDER BY r.created_at DESC`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

// GET a specific report
router.get('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT r.*, 
             u.full_name as reporter_name,
             n.title as note_title, n.file_url as note_url, n.uploader_id, n.branch, n.academic_year, n.created_at as note_date, n.status as note_status,
             c.content as comment_content, c.user_id as comment_author_id, c.created_at as comment_date, c.deleted_at as comment_deleted,
             cu.full_name as comment_author_name,
             nu.full_name as note_uploader_name
      FROM reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      LEFT JOIN notes n ON r.note_id = n.id
      LEFT JOIN users nu ON n.uploader_id = nu.id
      LEFT JOIN comments c ON r.comment_id = c.id
      LEFT JOIN users cu ON c.user_id = cu.id
      WHERE r.id = $1
    `, [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report.' });
  }
});

// UPDATE report status
router.patch('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;
    
    if (!['pending', 'reviewing', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    
    await db.query(
      'UPDATE reports SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP, admin_note = COALESCE($3, admin_note) WHERE id = $4',
      [status, req.user.userId, admin_note, id]
    );
    
    await logAdminAction(req.user.userId, `updated_report_status_to_${status}`, 'report', id, admin_note);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report.' });
  }
});

// MODERATE Comment
router.delete('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    await logAdminAction(req.user.userId, 'deleted_comment', 'comment', id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to moderate comment.' });
  }
});

// GET all comments (for admin moderation)
router.get('/comments', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, u.full_name as author_name, u.email as author_email 
      FROM comments c 
      LEFT JOIN users u ON c.user_id = u.id 
      WHERE c.deleted_at IS NULL
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// MODERATE Note
router.patch('/notes/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // active, hidden, removed
    
    if (!['active', 'hidden', 'removed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    
    // If status is removed, we could delete the physical file to save space
    if (status === 'removed') {
       const noteRes = await db.query('SELECT file_path FROM notes WHERE id = $1', [id]);
       if (noteRes.rows.length > 0 && noteRes.rows[0].file_path) {
          const { createClient } = require('@supabase/supabase-js');
          const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
          await supabase.storage.from('notes').remove([noteRes.rows[0].file_path]);
          // We can optionally clear file_url/file_path but we need the file name for the user
       }
    }
    
    await db.query('UPDATE notes SET status = $1 WHERE id = $2', [status, id]);
    await logAdminAction(req.user.userId, `updated_note_status_to_${status}`, 'note', id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to moderate note.' });
  }
});


// Get all notes (including hidden ones) for Admin Dashboard
router.get('/notes', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.*, u.full_name as uploader_name 
       FROM notes n 
       JOIN users u ON n.uploader_id = u.id 
       ORDER BY n.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching admin notes:', err);
    res.status(500).json({ error: 'Failed to fetch notes.' });
  }
});

// BULK MODERATE Notes
router.patch('/notes/bulk-status', async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'List of IDs required.' });
    }
    
    if (!['active', 'hidden', 'removed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    
    await db.query('UPDATE notes SET status = $1 WHERE id = ANY($2::int[])', [status, ids]);
    await logAdminAction(req.user.userId, `bulk_updated_notes_status_to_${status}`, 'note', null, `IDs: ${ids.join(',')}`);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk moderate notes.' });
  }
});

// BAN / UNBAN User
router.patch('/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body; // false to ban, true to unban
    
    await db.query('UPDATE users SET is_active = $1 WHERE id = $2', [is_active, id]);
    await logAdminAction(req.user.userId, is_active ? 'unbanned_user' : 'banned_user', 'user', id);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// GET Admin Logs
router.get('/logs', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.*, u.email as admin_email 
       FROM admin_logs l
       LEFT JOIN users u ON l.admin_id = u.id
       ORDER BY l.created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin logs.' });
  }
});

module.exports = router;
