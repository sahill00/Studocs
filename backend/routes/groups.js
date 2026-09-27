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

// Create a new study group
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, subject_id, academic_year, privacy } = req.body;
    const admin_id = req.user.userId;

    // Start a transaction since we need to create the group AND add the admin as a member
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      const groupResult = await client.query(
        'INSERT INTO study_groups (name, description, subject_id, academic_year, privacy, admin_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, description, subject_id, academic_year, privacy, admin_id]
      );
      
      const group = groupResult.rows[0];
      
      await client.query(
        'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
        [group.id, admin_id]
      );
      
      await client.query('COMMIT');
      res.status(201).json(group);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating study group:', error);
    res.status(500).json({ error: 'Failed to create study group' });
  }
});

// Get public study groups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { academic_year, subject_id } = req.query;
    
    let query = 'SELECT g.*, u.name as admin_name, (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count FROM study_groups g JOIN users u ON g.admin_id = u.id WHERE g.privacy = $1';
    let params = ['PUBLIC'];
    let paramCount = 2;
    
    if (academic_year) { query += ` AND g.academic_year = $${paramCount++}`; params.push(academic_year); }
    if (subject_id) { query += ` AND g.subject_id = $${paramCount++}`; params.push(subject_id); }
    
    query += ' ORDER BY g.created_at DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching study groups:', error);
    res.status(500).json({ error: 'Failed to fetch study groups' });
  }
});

// Join a study group
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const group_id = req.params.id;
    const user_id = req.user.userId;

    // Check if group exists and is public (or if we had invite logic, we'd check that here)
    const groupCheck = await db.query('SELECT privacy FROM study_groups WHERE id = $1', [group_id]);
    if (groupCheck.rows.length === 0) return res.status(404).json({ error: 'Group not found' });
    if (groupCheck.rows[0].privacy === 'PRIVATE') return res.status(403).json({ error: 'Cannot join private group directly' });

    await db.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [group_id, user_id]
    );

    res.json({ message: 'Successfully joined study group' });
  } catch (error) {
    console.error('Error joining study group:', error);
    res.status(500).json({ error: 'Failed to join study group' });
  }
});

module.exports = router;
