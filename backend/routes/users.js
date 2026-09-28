const express = require('express');
const db = require('../db');

const router = express.Router();

// GET public user profile and their public notes
router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch user public info
    const userRes = await db.query(
      'SELECT id, full_name, college_name, branch, year_of_study, reputation_score, profile_picture_url FROM users WHERE id = $1 AND is_active = TRUE',
      [id]
    );
    
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found or inactive.' });
    }
    
    // Fetch user's public notes
    const notesRes = await db.query(
      `SELECT id, title, description, file_url, view_count, download_count, upvotes, created_at, note_type
       FROM notes 
       WHERE uploader_id = $1 AND visibility = 'PUBLIC' AND (status IS NULL OR status != 'hidden') AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [id]
    );
    
    res.json({
      user: userRes.rows[0],
      notes: notesRes.rows
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

module.exports = router;
