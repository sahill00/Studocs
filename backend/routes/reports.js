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

// POST a new report
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { note_id, comment_id, reason, description } = req.body;

    if (!note_id && !comment_id) {
      return res.status(400).json({ error: 'Must report either a note or a comment.' });
    }
    if (!reason) {
      return res.status(400).json({ error: 'Reason is required.' });
    }

    // Check if the user already reported this item
    let duplicateCheck;
    if (note_id) {
      duplicateCheck = await db.query(
        'SELECT id FROM reports WHERE reporter_id = $1 AND note_id = $2',
        [req.user.userId, note_id]
      );
    } else {
      duplicateCheck = await db.query(
        'SELECT id FROM reports WHERE reporter_id = $1 AND comment_id = $2',
        [req.user.userId, comment_id]
      );
    }

    if (duplicateCheck.rows.length > 0) {
      return res.status(429).json({ error: 'You have already reported this content.' });
    }

    const result = await db.query(
      `INSERT INTO reports (reporter_id, note_id, comment_id, reason, description) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [req.user.userId, note_id || null, comment_id || null, reason, description]
    );

    res.json({ success: true, reportId: result.rows[0].id });
  } catch (error) {
    console.error('Error reporting content:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// GET user's own reports (optional, for history)
router.get('/my-reports', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM reports WHERE reporter_id = $1 ORDER BY created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router;
