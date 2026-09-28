const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session.' });
    req.user = user;
    next();
  });
};

// Get all bookmarked notes for the user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.*, u.full_name as uploader_name 
       FROM notes n 
       JOIN users u ON n.uploader_id = u.id 
       JOIN bookmarks b ON n.id = b.note_id 
       WHERE b.user_id = $1 
         AND (n.status IS NULL OR n.status != 'hidden')
         AND n.deleted_at IS NULL
         AND (n.visibility = 'PUBLIC' OR n.uploader_id = $1)
       ORDER BY b.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Bookmark a note
router.post('/:noteId', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    await db.query(
      'INSERT INTO bookmarks (user_id, note_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.userId, noteId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error bookmarking note:', error);
    res.status(500).json({ error: 'Failed to bookmark note' });
  }
});

// Remove bookmark
router.delete('/:noteId', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    await db.query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND note_id = $2',
      [req.user.userId, noteId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// Check if a note is bookmarked
router.get('/:noteId/status', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    const result = await db.query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND note_id = $2',
      [req.user.userId, noteId]
    );
    res.json({ bookmarked: result.rows.length > 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check status' });
  }
});

module.exports = router;
