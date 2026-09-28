const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust Railway Proxy
const port = process.env.PORT || 5000;

// Import Routes
const authRoutes = require('./routes/auth_hybrid.ts').default;
const notesRoutes = require('./routes/notes');
const collectionsRoutes = require('./routes/collections');
const groupsRoutes = require('./routes/groups');
const bookmarksRoutes = require('./routes/bookmarks');
const notificationsRoutes = require('./routes/notifications');
const usersRoutes = require('./routes/users');

const commentsRoutes = require('./routes/comments');
const reportsRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://192.168.1.4:3000'
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    // or if the origin is in our allowed list
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// API Rate Limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 auth requests per hour
  message: { error: 'Too many login attempts, please try again after an hour.' }
});

const magicLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 magic link requests per 15 minutes
  message: { error: 'Too many magic link requests. Please check your email or try again later.' }
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 file uploads per hour
  message: { error: 'Upload limit reached. Please try again after an hour.' }
});

// Apply global API limiter
app.use('/api/', apiLimiter);

// API Routes
// Note: We apply authLimiter generally, but magicLinkLimiter will be applied specifically in the auth routes if needed,
// but for simplicity we can just apply magicLinkLimiter to the specific path here
app.use('/api/auth/send-magic-link', magicLinkLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', usersRoutes);

app.use('/api/notes/upload', uploadLimiter);
app.use('/api/notes', notesRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/notes/:noteId/comments', commentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StuDocs API is running with PostgreSQL' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


