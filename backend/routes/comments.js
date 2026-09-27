const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router({ mergeParams: true }); // to access :noteId if mounted on /api/notes/:noteId/comments

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

// GET all comments (either for a specific note or global requests)
router.get('/', async (req, res) => {
  try {
    const { noteId } = req.params;
    const targetNoteId = noteId || req.query.noteId;
    
    let query, params;
    if (targetNoteId) {
      query = `
        SELECT c.*, u.full_name as username 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.note_id = $1 AND c.deleted_at IS NULL
        ORDER BY c.created_at ASC
      `;
      params = [targetNoteId];
    } else {
      query = `
        SELECT c.*, u.full_name as username 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.note_id IS NULL AND c.deleted_at IS NULL
        ORDER BY c.created_at DESC
      `;
      params = [];
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST a new comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    const targetNoteId = noteId || req.body.note_id || null;
    const { content } = req.body;

    if (!content || content.trim().length === 0) return res.status(400).json({ error: 'Comment content is required.' });
    if (content.length > 2000) return res.status(400).json({ error: 'Comment is too long.' });

    if (targetNoteId) {
      const noteCheck = await db.query('SELECT id FROM notes WHERE id = $1', [targetNoteId]);
      if (noteCheck.rows.length === 0) return res.status(404).json({ error: 'Note not found.' });
    } else {
      // Rate limit check: max 10 requests per day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const limitCheck = await db.query(
        'SELECT COUNT(*) FROM comments WHERE user_id = $1 AND note_id IS NULL AND created_at >= $2',
        [req.user.userId, today]
      );
      if (parseInt(limitCheck.rows[0].count) >= 10) {
        return res.status(429).json({ error: 'You have reached your limit of 10 requests per day.' });
      }
    }

    const result = await db.query(
      `INSERT INTO comments (note_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [targetNoteId, req.user.userId, content.trim()]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// DELETE a comment
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    const commentCheck = await db.query('SELECT user_id FROM comments WHERE id = $1 AND deleted_at IS NULL', [commentId]);
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    const comment = commentCheck.rows[0];

    // Verify user owns comment OR is admin
    const userCheck = await db.query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    const userRole = userCheck.rows.length > 0 ? userCheck.rows[0].role : 'student';

    if (comment.user_id !== req.user.userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this comment.' });
    }

    // Soft delete
    await db.query('UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [commentId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;
