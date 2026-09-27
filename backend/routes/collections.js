const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Create a new collection
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const owner_id = req.user.userId;

    const result = await db.query(
      'INSERT INTO collections (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, owner_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Add a note to a collection
router.post('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const collection_id = req.params.id;
    const { note_id } = req.body;
    const owner_id = req.user.userId;

    // Verify ownership
    const collectionCheck = await db.query('SELECT owner_id FROM collections WHERE id = $1', [collection_id]);
    if (collectionCheck.rows.length === 0) return res.status(404).json({ error: 'Collection not found' });
    if (collectionCheck.rows[0].owner_id !== owner_id) return res.status(403).json({ error: 'Not authorized' });

    await db.query(
      'INSERT INTO collection_notes (collection_id, note_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [collection_id, note_id]
    );

    res.json({ message: 'Note added to collection successfully' });
  } catch (error) {
    console.error('Error adding note to collection:', error);
    res.status(500).json({ error: 'Failed to add note to collection' });
  }
});

// Get user's collections
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const owner_id = req.user.userId;
    
    // Fetch collections with count of notes
    const result = await db.query(
      `SELECT c.*, COUNT(cn.note_id) as note_count 
       FROM collections c 
       LEFT JOIN collection_notes cn ON c.id = cn.collection_id 
       WHERE c.owner_id = $1 
       GROUP BY c.id ORDER BY c.created_at DESC`,
      [owner_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get notes in a specific collection
router.get('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const collection_id = req.params.id;
    const owner_id = req.user.userId;

    // Verify ownership
    const collectionCheck = await db.query('SELECT owner_id FROM collections WHERE id = $1', [collection_id]);
    if (collectionCheck.rows.length === 0) return res.status(404).json({ error: 'Collection not found' });
    if (collectionCheck.rows[0].owner_id !== owner_id) return res.status(403).json({ error: 'Not authorized' });

    const result = await db.query(
      `SELECT n.* FROM notes n 
       JOIN collection_notes cn ON n.id = cn.note_id 
       WHERE cn.collection_id = $1 
         AND (n.status IS NULL OR n.status != 'hidden')
         AND (n.visibility = 'PUBLIC' OR n.uploader_id = $2)`,
      [collection_id, owner_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching collection notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes in collection' });
  }
});

module.exports = router;
