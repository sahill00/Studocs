const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college_name, branch, current_year } = req.body;
    
    // Check if user already exists
    const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Insert into DB
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, college_name, branch, current_year) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, branch`,
      [name, email, password_hash, college_name, branch, current_year]
    );
    
    const user = result.rows[0];
    
    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Fetch user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password hash from response
    delete user.password_hash;
    
    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

// Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: google_id, email, name } = payload;
    
    // Check if user exists
    let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;
    
    if (result.rows.length === 0) {
      // Create new user if they don't exist
      const insertResult = await db.query(
        `INSERT INTO users (name, email, google_id) 
         VALUES ($1, $2, $3) RETURNING id, name, email, branch`,
        [name, email, google_id]
      );
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
      // Update google_id if it's missing (linked account)
      if (!user.google_id) {
        await db.query('UPDATE users SET google_id = $1 WHERE email = $2', [google_id, email]);
      }
    }
    
    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password hash if present
    if (user.password_hash) delete user.password_hash;
    
    res.json({ user, token });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ error: 'Server error during Google authentication' });
  }
});

module.exports = router;
