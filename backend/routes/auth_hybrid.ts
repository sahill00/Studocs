import express, { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

/**
 * 1. Send Magic Link
 * POST /api/auth/send-magic-link
 */
router.post('/send-magic-link', async (req: Request, res: Response) => {
  try {
    const { email, intent } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Check if user exists
    const userRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    const userId = userRes.rows.length > 0 ? userRes.rows[0].id : null;

    await db.query(
      `INSERT INTO auth_tokens (token, user_id, email, expires_at) VALUES ($1, $2, $3, $4)`,
      [token, userId, email, expiresAt]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const magicLink = `${frontendUrl}/auth/verify?token=${token}`;
    
    if (process.env.RESEND_API_KEY) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Studocs <onboarding@resend.dev>',
          to: [email],
          subject: 'Your StuDocs Login Link',
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to StuDocs!</h2>
            <p>Click the button below to log into your account securely.</p>
            <a href="${magicLink}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 15px;">Login to StuDocs</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This link expires in 15 minutes.</p>
          </div>`
        });

        if (error) {
          console.error("Resend error:", error);
        }
        console.log(`[REAL EMAIL SENT TO ${email}] via Resend`);
      } catch (emailErr) {
        console.error('Error sending with Resend:', emailErr);
      }
    } else {
      console.log(`\n\n[MOCK EMAIL SENT TO ${email}]\nMagic Link URL: ${magicLink}\n(Configure RESEND_API_KEY in .env to send real emails)\n\n`);
    }

    res.json({
      success: true,
      message: 'Check your email for login link',
      expires_in: 900,
      dev_token: token // For MVP testing
    });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 2. Verify Magic Link
 * GET /api/auth/verify-email?token=xyz123
 */
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const tokenRes = await db.query(
      `SELECT * FROM auth_tokens WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [token]
    );

    if (tokenRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Token expired or invalid' });
    }

    const authData = tokenRes.rows[0];

    // Mark token as used
    await db.query('UPDATE auth_tokens SET used_at = NOW() WHERE id = $1', [authData.id]);

    let userId = authData.user_id;
    let isNewUser = false;

    // If user doesn't exist yet, we create an empty "Tier 2" shell user or just return email
    if (!userId) {
      // Actually, spec says: if no profile, redirect to profile setup
      // Let's create a shell user
      const newRes = await db.query(
        `INSERT INTO users (email, auth_method, is_email_verified) VALUES ($1, 'email', true) RETURNING id`,
        [authData.email]
      );
      userId = newRes.rows[0].id;
      isNewUser = true;
    } else {
      await db.query('UPDATE users SET is_email_verified = true, last_login_at = NOW() WHERE id = $1', [userId]);
    }

    const userRoleRes = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
    const userRole = userRoleRes.rows.length > 0 ? userRoleRes.rows[0].role : 'student';
    // Generate Session JWT
    const sessionToken = jwt.sign({ userId, role: userRole }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      user_id: userId,
      auth_token: sessionToken,
      is_new_user: isNewUser,
      redirect_to: isNewUser ? '/profile/setup' : '/browse'
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 3. Complete Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, full_name, college_id, branch, year_of_study, password } = req.body;

    // Optional password hashing
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Find the shell user created by magic link verify, or create a new one
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let userId;
    
    if (userRes.rows.length > 0) {
      userId = userRes.rows[0].id;
      await db.query(
        `UPDATE users 
         SET full_name = $1, college_id = $2, branch = $3, year_of_study = $4, password_hash = COALESCE($5, password_hash)
         WHERE id = $6`,
        [full_name, college_id || null, branch, year_of_study, passwordHash, userId]
      );
    } else {
      // Direct registration (maybe skipping magic link for some reason)
      const newRes = await db.query(
        `INSERT INTO users (email, full_name, college_id, branch, year_of_study, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [email, full_name, college_id || null, branch, year_of_study, passwordHash]
      );
      userId = newRes.rows[0].id;
    }

    const updatedUserRes = await db.query('SELECT id, email, full_name, role FROM users WHERE id = $1', [userId]);
    const userRole = updatedUserRes.rows[0].role;
    const sessionToken = jwt.sign({ userId, role: userRole }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      user: updatedUserRes.rows[0],
      auth_token: sessionToken
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * 4. Get Current User (Me)
 * GET /api/auth/me
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const userRes = await db.query('SELECT id, email, full_name, branch, year_of_study FROM users WHERE id = $1', [decoded.userId]);
    if (userRes.rows.length === 0) return res.status(401).json({ success: false, error: 'Unauthorized' });

    res.json({
      success: true,
      user: {
        ...userRes.rows[0],
        auth_tier: userRes.rows[0].full_name ? 'contributor' : 'basic'
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
});

/**
 * 5. Login with Password
 * POST /api/auth/login-password
 */
router.post('/login-password', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = userRes.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ success: false, error: 'No password set. Please use Magic Link to login.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    const sessionToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      user_id: user.id,
      auth_token: sessionToken,
      redirect_to: '/browse'
    });
  } catch (error) {
    console.error('Password login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
