# Hybrid Authentication System - Engineering Notes Platform

## 1. Overview

A smart, friction-free authentication system that allows students to:
- **Browse notes freely** (no login required)
- **Download notes easily** (optional email collection)
- **Upload notes quickly** (college email verification)
- **Rate/Comment** (one-click authentication)

**Goal:** Maximize user experience while maintaining community quality and preventing spam.

---

## 2. Authentication Tiers

### Tier 1: Guest User (No Login)
```
Access Level: READ-ONLY
├── Browse all notes
├── Search & filter notes
├── View ratings and comments
├── Read note descriptions & previews
├── See user profiles (public info only)
└── Share note links

Restrictions:
├── ❌ Cannot download notes
├── ❌ Cannot upload notes
├── ❌ Cannot rate/comment
├── ❌ Cannot create collections
└── ❌ Cannot join study groups
```

### Tier 2: Email Verified (Basic User)
```
Access Level: FULL READ + BASIC WRITE
├── All Tier 1 permissions
├── Download notes (unlimited)
├── Create collections
├── Rate & comment on notes
├── Join study groups
├── View download history
└── Save favorite notes

Restrictions:
├── ❌ Cannot upload notes (without full registration)
├── ❌ Cannot see advanced analytics
└── ❌ Cannot moderate content
```

### Tier 3: Fully Registered (Contributor)
```
Access Level: FULL ACCESS
├── All Tier 1 & 2 permissions
├── Upload notes (textbook & handwritten)
├── Manage own notes
├── View upload analytics (views, downloads, ratings)
├── Edit own profile
├── Create & manage study groups
├── Track reputation score
└── Access contributor dashboard

Restrictions:
├── ❌ Cannot delete other users' notes
├── ❌ Cannot moderate (unless admin)
└── ❌ Cannot access admin panel
```

### Tier 4: Admin (Platform Management)
```
Access Level: FULL SYSTEM CONTROL
├── All Tier 1, 2, 3 permissions
├── Moderate user-reported content
├── Manage users (suspend, verify)
├── View platform analytics
├── Manage course catalog
├── Access admin dashboard
└── View system logs

Permissions:
├── Delete inappropriate notes
├── Suspend/ban users
├── Feature curated collections
├── Manage college domains
└── View all user data (audits)
```

---

## 3. User Registration & Login Flows

### 3.1 First-Time Visitor (Discovery)

```
User arrives at platform
         ↓
┌─────────────────────────────────────┐
│  HOMEPAGE (No login required)       │
│                                     │
│  [Logo]     [Search]    [Login/Signup]
│                                     │
│  Featured Notes:                    │
│  • Database Systems (Textbook)      │
│  • DSA Handwritten Notes (H.Written)│
│  • Python Basics (Textbook)         │
│                                     │
│  [Browse More Notes]                │
│  [See Top Contributors]             │
│  [Join Study Group]                 │
└─────────────────────────────────────┘
         ↓
  User browses notes freely
         ↓
  [Try to Download Note]
         ↓
┌─────────────────────────────────────┐
│  QUICK EMAIL PROMPT                 │
│                                     │
│  📧 Get access to download notes    │
│                                     │
│  Enter your email:                  │
│  [student@iiit.ac.in]              │
│                                     │
│  ✓ Instant access (no password)     │
│  ✓ No verification needed           │
│                                     │
│  [Get Download Link] [Skip for Now] │
│                                     │
│  OR                                 │
│  [Sign up with Google] [Sign up with GitHub]
│                                     │
│  Already registered?                │
│  [Sign in instead]                  │
└─────────────────────────────────────┘
         ↓
  Click email link in inbox
         ↓
  Auto-login + Download starts
         ↓
  (No profile creation yet)
         ↓
  User can browse freely now
         ↓
  Want to upload?
  [Must complete full signup]
```

### 3.2 Email Magic Link Signup

```
User clicks email link
         ↓
┌─────────────────────────────────────┐
│  EMAIL VERIFICATION                 │
│                                     │
│  ✓ Email verified: student@iiit    │
│  ✓ Auto-login successful            │
│                                     │
│  Welcome, [Extracted First Name]!   │
│                                     │
│  [Continue] → Go to next step       │
│  [Logout]   → Go back to browse     │
└─────────────────────────────────────┘
         ↓
  [Continue] → Profile Setup
         ↓
┌─────────────────────────────────────┐
│  QUICK PROFILE SETUP (Tier 2)       │
│                                     │
│  Email: student@iiit.ac.in          │
│  (auto-filled, read-only)           │
│                                     │
│  Full Name: [Pre-filled if possible]│
│  [Enter Name]                       │
│                                     │
│  [Next →]                           │
└─────────────────────────────────────┘
         ↓
  Profile created - Can download notes now
         ↓
┌─────────────────────────────────────┐
│  SUCCESS!                           │
│                                     │
│  ✓ Account created                  │
│  ✓ Ready to download & rate notes   │
│                                     │
│  Next steps:                        │
│                                     │
│  [Download Your Note] ← Primary     │
│  [Set up Profile]    ← Optional     │
│  [Browse More]       ← Secondary    │
└─────────────────────────────────────┘
```

### 3.3 Full Registration (For Upload)

```
User clicks "Upload Notes"
         ↓
  [Not registered?]
         ↓
┌─────────────────────────────────────┐
│  JOIN AS CONTRIBUTOR                │
│                                     │
│  You need full profile to upload    │
│                                     │
│  Email: student@iiit.ac.in          │
│  (auto-filled if logged in)         │
│                                     │
│  OR enter email:                    │
│  [Enter college email]              │
│                                     │
│  ✓ Auto-fills college (IIIT)        │
│  ✓ Auto-selects domain (.ac.in)     │
│                                     │
│  [Continue]                         │
└─────────────────────────────────────┘
         ↓
  Email verification (same magic link)
         ↓
┌─────────────────────────────────────┐
│  COMPLETE YOUR PROFILE              │
│                                     │
│  Full Name: [Pre-filled]            │
│  Email: student@iiit.ac.in          │
│                                     │
│  College: [Auto-filled from email]  │
│  College: IIIT Hyderabad            │
│                                     │
│  Branch: [Required]                 │
│  ▼ Computer Science & Engineering   │
│                                     │
│  Current Year: [Required]           │
│  ▼ 3rd Year                          │
│                                     │
│  Bio (Optional):                    │
│  [Tell us about yourself]           │
│                                     │
│  Set Password (Optional):           │
│  [Set Password]  [Skip for now]     │
│  (Can login with email link anytime)│
│                                     │
│  [Create Account & Continue to Upload]
└─────────────────────────────────────┘
         ↓
  Account fully created (Tier 3)
         ↓
  Redirect to upload form
```

### 3.4 Social Authentication (OAuth)

```
User sees login options:

┌─────────────────────────────────────┐
│  QUICK SIGNUP OPTIONS               │
│                                     │
│  [Sign up with Google]              │
│  Fastest option, 1 click            │
│                                     │
│  [Sign up with GitHub]              │
│  For engineering students           │
│                                     │
│  [Sign up with Email]               │
│  Traditional method                 │
│                                     │
│  Already have account?              │
│  [Sign in instead]                  │
└─────────────────────────────────────┘

Google OAuth Flow:
1. Click "Sign up with Google"
2. Redirect to Google login
3. User authenticates with Google
4. Google shares: email, name, profile pic
5. Auto-fill email + name + profile picture
6. Ask for college (Year, Branch)
7. Complete registration
8. Redirect to profile/dashboard

GitHub OAuth Flow:
Same as Google but:
- Additional info: username, bio
- Useful for engineering students
- Shows coding portfolio link (optional)
```

### 3.5 Returning User - Quick Login

```
Returning user (already registered)
         ↓
  Click [Login/Signin]
         ↓
┌─────────────────────────────────────┐
│  SIGN IN                            │
│                                     │
│  Enter email:                       │
│  [student@iiit.ac.in]              │
│                                     │
│  [Send Magic Link]                  │
│                                     │
│  OR                                 │
│                                     │
│  [Sign in with Google] [GitHub]     │
│                                     │
│  Don't have account?                │
│  [Create one now]                   │
└─────────────────────────────────────┘
         ↓
  Click link in email
         ↓
  Auto-logged in
         ↓
  Redirect to previous page or dashboard
```

---

## 4. Key Authentication Methods

### 4.1 Magic Link (Email)

**What is it?**
- No passwords needed
- User gets 1-click email link
- Link is unique, time-limited (15 minutes)
- One link = one login session

**Implementation:**
```
1. User enters email
2. System generates unique token (32 chars)
3. Email sent: "Click here to login: example.com/auth/verify?token=xyz123"
4. User clicks link
5. Token validated:
   - Check if token exists
   - Check if token expired
   - Create session
   - Redirect to dashboard
6. Token deleted after use (one-time use)
```

**Pros:**
✓ No password to remember
✓ No password reset emails
✓ Faster than password login
✓ Most college students prefer this

**Cons:**
✗ Requires email access
✗ Email delivery can be slow
✗ Link expires after 15 mins

**User Experience:**
```
Speed: 30 seconds
Complexity: Very Simple
Friction: Minimal
```

---

### 4.2 Google OAuth

**What is it?**
- Uses Google account to sign in
- 1-click authentication
- No password needed
- Auto-fills name, email, profile picture

**Implementation:**
```
1. Click "Sign up with Google"
2. Redirect to: https://accounts.google.com/o/oauth2/v2/auth?...
3. User logs in with Google
4. Google redirects back with: authorization_code
5. Exchange code for access_token
6. Get user info (email, name, picture)
7. Check if user exists in database
   - If yes: Create session
   - If no: Auto-create account + session
8. Redirect to dashboard
```

**Pros:**
✓ 1-click signup/login
✓ Most college students have Google account
✓ Auto-fills profile data
✓ Fastest method
✓ No password needed

**Cons:**
✗ Requires Google account
✗ Privacy concerns (Google tracking)
✗ Rate limited by Google

**User Experience:**
```
Speed: 10 seconds
Complexity: Very Simple
Friction: Minimal
```

---

### 4.3 GitHub OAuth (Optional)

**What is it?**
- Sign in with GitHub account
- Great for engineering/coding students
- Shows GitHub profile
- Can link portfolio

**Implementation:**
Same as Google OAuth but:
```
1. Redirect to: https://github.com/login/oauth/authorize?...
2. User authenticates with GitHub
3. Get: username, email, bio, profile URL
4. Auto-create account with GitHub info
```

**Pros:**
✓ Engineering students love it
✓ Can display GitHub profile link
✓ Shows contribution activity
✓ 1-click for developers

**Cons:**
✗ Only useful for CS students
✗ Not applicable for other branches
✗ Smaller adoption than Google

**User Experience:**
```
Speed: 10 seconds
Complexity: Simple
Friction: Minimal (for tech students)
```

---

## 5. Database Schema

### 5.1 Users Table

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Basic Info
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    profile_picture_url VARCHAR(500),
    bio TEXT,
    
    -- College Info
    college_id INT,
    college_name VARCHAR(255),
    branch VARCHAR(100),
    year_of_study INT,
    
    -- Authentication
    password_hash VARCHAR(255) NULL,  -- NULL if using OAuth only
    auth_method ENUM('email', 'google', 'github') DEFAULT 'email',
    
    -- Account Status
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    
    -- Stats
    reputation_score INT DEFAULT 0,
    total_notes_uploaded INT DEFAULT 0,
    total_downloads INT DEFAULT 0,
    
    FOREIGN KEY (college_id) REFERENCES colleges(id),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);
```

### 5.2 Authentication Tokens Table

```sql
CREATE TABLE auth_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Token Info
    token VARCHAR(255) UNIQUE NOT NULL,
    token_type ENUM('magic_link', 'session', 'refresh') DEFAULT 'magic_link',
    user_id INT,
    email VARCHAR(255),  -- For magic links before account created
    
    -- Expiration
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    
    -- Security
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at),
    INDEX idx_user_id (user_id)
);
```

### 5.3 OAuth Accounts Table

```sql
CREATE TABLE oauth_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    user_id INT NOT NULL,
    provider ENUM('google', 'github') NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    provider_name VARCHAR(255),
    provider_profile_url VARCHAR(500),
    
    access_token TEXT,  -- Encrypted
    refresh_token TEXT,  -- Encrypted (if available)
    token_expires_at TIMESTAMP NULL,
    
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider (user_id, provider),
    INDEX idx_provider (provider, provider_user_id)
);
```

### 5.4 Sessions Table

```sql
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type ENUM('desktop', 'tablet', 'mobile'),
    
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);
```

---

## 6. API Endpoints

### 6.1 Authentication Endpoints

#### POST /api/auth/send-magic-link
**Purpose:** Send magic link to email
```
Request:
{
  "email": "student@iiit.ac.in",
  "intent": "login" | "signup" | "download"
}

Response (200):
{
  "success": true,
  "message": "Check your email for login link",
  "expires_in": 900  // 15 minutes
}

Response (400):
{
  "success": false,
  "error": "Invalid email format"
}
```

#### GET /api/auth/verify-email?token=xyz123
**Purpose:** Verify magic link token
```
Response (200):
{
  "success": true,
  "user_id": 123,
  "auth_token": "session_abc123",
  "is_new_user": false,
  "redirect_to": "/dashboard"
}

Response (401):
{
  "success": false,
  "error": "Token expired or invalid"
}
```

#### POST /api/auth/register
**Purpose:** Complete user registration
```
Request:
{
  "email": "student@iiit.ac.in",
  "full_name": "Raj Kumar",
  "college_id": 1,
  "branch": "CSE",
  "year_of_study": 3,
  "password": "optional_password_123"  // Optional
}

Response (201):
{
  "success": true,
  "user": {
    "id": 123,
    "email": "student@iiit.ac.in",
    "full_name": "Raj Kumar"
  },
  "auth_token": "session_abc123"
}
```

#### POST /api/auth/google
**Purpose:** Google OAuth callback
```
Request:
{
  "code": "authorization_code_from_google",
  "redirect_uri": "https://example.com/auth/google"
}

Response (200):
{
  "success": true,
  "user": { user_object },
  "auth_token": "session_abc123",
  "is_new_user": true
}
```

#### POST /api/auth/github
**Purpose:** GitHub OAuth callback
```
Request:
{
  "code": "authorization_code_from_github"
}

Response (200):
{
  "success": true,
  "user": { user_object },
  "auth_token": "session_abc123",
  "is_new_user": true
}
```

#### POST /api/auth/logout
**Purpose:** Logout user
```
Request Headers:
Authorization: Bearer session_abc123

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me
**Purpose:** Get current authenticated user
```
Request Headers:
Authorization: Bearer session_abc123

Response (200):
{
  "user": {
    "id": 123,
    "email": "student@iiit.ac.in",
    "full_name": "Raj Kumar",
    "branch": "CSE",
    "year_of_study": 3,
    "auth_tier": "contributor"
  }
}

Response (401):
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## 7. Frontend Components

### 7.1 Login Modal Component

```
File: components/AuthModal.tsx

Props:
- isOpen: boolean
- onClose: () => void
- intent: 'login' | 'signup' | 'download'

States:
- emailInput: string
- loading: boolean
- error: string | null
- sent: boolean
- verifying: boolean

UI Elements:
┌─────────────────────────────────┐
│  ✕ Sign In                      │
├─────────────────────────────────┤
│                                 │
│  📧 Email-based Login           │
│                                 │
│  Enter your email:              │
│  [Input: student@iiit.ac.in]    │
│                                 │
│  [Send Login Link] (on enter)   │
│                                 │
│  OR                             │
│                                 │
│  [Continue with Google]         │
│  [Continue with GitHub]         │
│                                 │
│  Don't have account?            │
│  [Create one instead]           │
│                                 │
│  Privacy: We respect your       │
│  email. No spam ever.           │
└─────────────────────────────────┘

Success State:
┌─────────────────────────────────┐
│  ✅ Check Your Email            │
│                                 │
│  We sent a login link to:       │
│  student@iiit.ac.in             │
│                                 │
│  Click the link in your email   │
│  to get instant access.         │
│                                 │
│  Didn't receive email?          │
│  [Resend] [Try different email] │
│                                 │
│  This link expires in 15 mins   │
└─────────────────────────────────┘
```

### 7.2 Profile Setup Component

```
File: components/ProfileSetup.tsx

Used after: Email verified OR OAuth signup

Steps:
1. Basic Info (auto-filled)
   - Full Name (pre-filled)
   - Email (read-only)

2. College Info
   - College (auto-detected from email domain)
   - Branch (required dropdown)
   - Year (required dropdown)

3. Optional Info
   - Bio (text area)
   - Profile Picture (upload)

4. Password (optional)
   - Set password or skip
   - (Can be done later)

UI Flow:
┌─────────────────────────────────┐
│  Complete Your Profile (Step 1/3)│
│                                 │
│  Full Name:                     │
│  [Raj Kumar]                    │
│                                 │
│  Email:                         │
│  student@iiit.ac.in (locked)    │
│                                 │
│  [Next]                         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Your College Info (Step 2/3)    │
│                                 │
│  College:                       │
│  IIIT Hyderabad (auto-filled)   │
│                                 │
│  Branch:                        │
│  ▼ Computer Science             │
│                                 │
│  Current Year:                  │
│  ▼ 3rd Year                     │
│                                 │
│  [Previous] [Next]              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Let's Get Personal (Step 3/3)   │
│                                 │
│  Profile Picture (Optional):    │
│  [Upload Image]                 │
│                                 │
│  Bio (Optional):                │
│  [Tell us about yourself...]    │
│                                 │
│  Set Password (Optional):       │
│  [Create a password]            │
│  [Skip - Use email login]       │
│                                 │
│  [Previous] [Complete Setup]    │
└─────────────────────────────────┘
```

### 7.3 Download Note Component

```
File: components/DownloadButton.tsx

Props:
- noteId: number
- isAuthenticated: boolean

Behavior:
┌─────────────────────────────────┐
│  [📥 Download Note]             │
│   ↓ (click)                     │
│                                 │
│  [If authenticated]             │
│  → Download starts              │
│  → Track in history             │
│                                 │
│  [If not authenticated]         │
│  → Show email prompt            │
│  → After email verified         │
│  → Download starts              │
└─────────────────────────────────┘

Email Prompt UI:
┌─────────────────────────────────┐
│  Get Access to Download         │
│                                 │
│  Email: [student@iiit.ac.in]   │
│  [Send Link] [Cancel]           │
│                                 │
│  Takes 30 seconds               │
│  No password needed             │
└─────────────────────────────────┘
```

### 7.4 Rate/Comment Button Component

```
File: components/RateButton.tsx

Props:
- noteId: number
- onRate: (rating) => void

Behavior:
┌─────────────────────────────────┐
│  ⭐ ⭐ ⭐ ⭐ ☆                 │
│   (click to rate)               │
│                                 │
│  [If authenticated]             │
│  → Show rating form             │
│  → Optional comment text        │
│  → Submit                       │
│                                 │
│  [If not authenticated]         │
│  → Show modal                   │
│  → "Sign in to rate"            │
│  → Quick login options          │
└─────────────────────────────────┘
```

---

## 8. Security Considerations

### 8.1 Token Security

```
Magic Link Token:
✓ Generated with crypto.randomBytes(32)
✓ Hashed in database (bcrypt)
✓ Expires in 15 minutes
✓ One-time use only (deleted after validation)
✓ Sent via email only (not in URL by default)
✓ Rate limited (5 per hour per email)

Session Token:
✓ Generated with crypto.randomBytes(32)
✓ HttpOnly cookie (can't access from JS)
✓ Secure flag (HTTPS only)
✓ SameSite=Strict (CSRF protection)
✓ Expires in 30 days (sliding expiration)
✓ Rotated on each request (optional)
```

### 8.2 College Email Verification

```
Domain Whitelist:
✓ .ac.in (Indian colleges)
✓ .edu (US colleges)
✓ .ac.uk (UK colleges)
✓ Custom for each college
✓ Case-insensitive comparison

Email Regex:
^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$

Blocked Domains:
✗ gmail.com, hotmail.com, yahoo.com
✗ Temporary email services
✗ Disposable email providers

Verification:
1. Format check (regex)
2. MX record check (email server exists)
3. Send verification email
4. Wait for user to click
5. One-time use token
```

### 8.3 OAuth Security

```
Google OAuth:
✓ Redirect URI whitelist (only trusted domains)
✓ Verify JWT signature from Google
✓ Check token expiration
✓ Validate user info
✓ Use PKCE (Proof Key for Code Exchange)
✓ Rate limiting on OAuth flow

GitHub OAuth:
✓ Same as Google OAuth
✓ Verify GitHub signature
✓ Check GitHub user validity
✓ Validate email from GitHub
```

### 8.4 Password Security (Optional)

```
If user sets password:
✓ Minimum 8 characters
✓ At least 1 uppercase letter
✓ At least 1 number
✓ Hashed with bcrypt (salt rounds: 10)
✓ Never stored in plain text

Password Reset:
✓ Email magic link (same as login)
✓ No password reset token needed
✓ One-time use
✓ 15-minute expiration
```

### 8.5 Rate Limiting

```
Magic Link Requests:
- 5 per email per hour
- 20 per IP per hour
- Backoff: exponential (1s, 2s, 4s, etc)

Login Attempts:
- 10 per email per hour
- 30 per IP per hour
- 15-minute lockout after 5 failures

Download Tracking:
- 100 downloads per IP per hour
- 500 per IP per day
- Prevents abuse and scraping

Upload Rate Limit:
- 10 files per user per day
- 100MB per user per day
- Prevents spam
```

---

## 9. User Journey Examples

### Example 1: College Student (Discovery Path)

```
Day 1: Discovery
1. Google search: "DSA notes PDF"
2. Find your platform in results
3. Click link → Homepage (no login)
4. Browse notes → sees "Database Systems" textbook notes
5. Clicks note → reads preview
6. Clicks [Download] → Email prompt appears
7. Enters email: student@iiit.ac.in
8. Checks email → 30 seconds later
9. Clicks magic link in email
10. Auto-logged in → File starts downloading
11. Bookmarks page (no password needed)

Day 2: Return Visit
1. Comes back to platform
2. Sees "Welcome back, Raj!" in header
3. Can download directly (still logged in)
4. Rates the note ⭐⭐⭐⭐⭐
5. Writes comment: "Thanks! Very helpful"

Day 3: Contribution
1. Takes handwritten notes in class
2. Remembers the platform
3. Clicks [Upload Notes]
4. Shows modal: "Complete profile to upload"
5. Already email-verified from download
6. Fills: Branch (CSE), Year (3rd)
7. Uploads handwritten notes PDF
8. Note published instantly
9. Gets 50 downloads in 2 hours
10. Becomes contributor 🎉
```

### Example 2: Returning Registered User

```
1. Bookmark platform or search
2. Click [Login]
3. Enter email: student@iiit.ac.in
4. Click link in email (or use magic link again)
5. Auto-logged in (1 minute total)
6. Download multiple notes for exam prep
7. Create collection "Database Systems Exam"
8. Add 15 notes to collection
9. Rate and comment on helpful notes
10. Join study group "Database Prep 2024"
11. Share collection with study group
12. Track all activities in profile
```

### Example 3: First-Time Uploader

```
1. Already uses platform (as downloader)
2. Takes good handwritten notes
3. Clicks [Upload] → Profile already complete
4. Selects note type: ✍️ Handwritten
5. Uploads PDF (drag-drop)
6. Fills: Title, Year, Branch, Semester, Subject
7. Marks as "Legible & Organized"
8. Clicks [Publish]
9. Note appears immediately
10. Gets notified: "10 views in 1 hour!"
11. Badges & reputation points earned
12. "Helpful Contributor" badge awarded
```

---

## 10. Implementation Checklist

### Backend Setup

- [ ] Database schema creation
- [ ] Auth token generation (crypto)
- [ ] Magic link email service
- [ ] Google OAuth integration
  - [ ] Create Google OAuth app
  - [ ] Configure OAuth credentials
  - [ ] Implement OAuth callback
- [ ] GitHub OAuth integration
  - [ ] Create GitHub OAuth app
  - [ ] Configure OAuth credentials
  - [ ] Implement OAuth callback
- [ ] Session management
- [ ] Password hashing (bcrypt)
- [ ] Rate limiting middleware
- [ ] Email sending service (Nodemailer, SendGrid)
- [ ] CORS configuration
- [ ] JWT implementation (if using tokens)

### Frontend Setup

- [ ] Auth modal component
- [ ] Profile setup component
- [ ] Login button in header
- [ ] Logout functionality
- [ ] Protected routes (if authenticated)
- [ ] Download button with prompt
- [ ] Rate/comment button with auth check
- [ ] User profile page
- [ ] Dashboard for authenticated users
- [ ] Email verification handling
- [ ] OAuth callback page
- [ ] Session persistence (localStorage + HTTP)

### Testing

- [ ] Magic link flow (end-to-end)
- [ ] Google OAuth flow
- [ ] GitHub OAuth flow
- [ ] Profile setup validation
- [ ] Email verification
- [ ] Rate limiting
- [ ] Session expiration
- [ ] Token refresh
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] SQL injection prevention

### Deployment

- [ ] Environment variables setup
- [ ] OAuth redirect URIs
- [ ] Email service configuration
- [ ] Database backup
- [ ] HTTPS/SSL certificate
- [ ] Monitoring & logging
- [ ] Error tracking (Sentry)

---

## 11. Configuration File Template

### .env.example

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notes_platform
DB_USER=admin
DB_PASSWORD=your_password

# Server
NODE_ENV=production
PORT=3000
APP_URL=https://example.com

# Email Service
EMAIL_SERVICE=gmail  # or sendgrid, mailgun
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# JWT Secret
JWT_SECRET=your_very_long_random_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://example.com/auth/google

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=https://example.com/auth/github

# Security
CORS_ORIGIN=https://example.com
SESSION_SECRET=your_random_session_secret
SESSION_EXPIRY=2592000  # 30 days in seconds

# College Domains
COLLEGE_DOMAINS=*.ac.in,*.edu
```

---

## 12. Key Metrics & Monitoring

### Conversion Funnel

```
Home Page Visits: 100%
          ↓
Browse Notes: 60%
          ↓
Click Download: 20%
          ↓
Email Verification: 15%
          ↓
Complete Profile: 10%
          ↓
Upload Notes: 3%

Target for MVP: 
- 60% of visitors download something
- 30% create email account
- 10% upload at least 1 note
```

### Performance Metrics

```
Magic Link Email: < 30 seconds (delivery time)
Google OAuth: < 5 seconds (redirect to dashboard)
Magic Link Verification: < 2 seconds
Profile Setup: < 60 seconds
Download Start: < 3 seconds after verification
```

### Success Metrics

```
Metric: Daily Active Users (DAU)
Target: 100+ in first month

Metric: Email Verified Users
Target: 50% of visitors

Metric: Profile Completion Rate
Target: 80% of those who try to upload

Metric: Authentication Success Rate
Target: 99.5%

Metric: Magic Link Click Rate
Target: 70% (people click email link)
```

---

## 13. Prompts for AI Code Generation

### Prompt 1: Backend Authentication Service

```
Create a Node.js Express authentication service with:

1. Magic link email authentication:
   - Generate unique token
   - Send via email with 15-minute expiration
   - One-time use verification
   - Auto-login after verification

2. Google OAuth:
   - Accept authorization code
   - Exchange for access token
   - Fetch user info
   - Create/update user in database
   - Return session token

3. GitHub OAuth:
   - Same as Google OAuth

4. Sessions:
   - Create session after verification
   - Store in database
   - 30-day expiration
   - HttpOnly secure cookies

5. API Endpoints:
   - POST /api/auth/send-magic-link
   - GET /api/auth/verify-email
   - POST /api/auth/google
   - POST /api/auth/github
   - POST /api/auth/logout
   - GET /api/auth/me

6. Middleware:
   - Authentication check
   - Authorization (tier-based)
   - Rate limiting
   - CSRF protection

Use bcrypt for token hashing, database as specified, and follow security best practices.
```

### Prompt 2: Frontend Auth Components

```
Create React components for authentication:

1. AuthModal component:
   - Email input with validation
   - Send magic link button
   - Google OAuth button
   - GitHub OAuth button
   - Loading states
   - Error handling
   - Success message after sending

2. ProfileSetup component:
   - 3-step form
   - Auto-filled fields where possible
   - Dropdowns for branch/year
   - Optional fields (bio, picture)
   - Validation
   - Submit and redirect

3. DownloadButton component:
   - Shows download icon
   - Checks authentication
   - Shows email prompt if not authenticated
   - Starts download after verification
   - Loading state

4. RateButton component:
   - Star rating UI
   - Opens modal if not authenticated
   - Comment input field
   - Submit button
   - Success message

Use TypeScript, React hooks (useState, useEffect), and handle all states (loading, error, success).
```

---

## 14. Next Steps for Implementation

### Week 1: Backend Foundation
- [ ] Set up Express/Node.js server
- [ ] Configure database (PostgreSQL/MySQL)
- [ ] Implement magic link service
- [ ] Test email sending locally

### Week 2: OAuth Integration
- [ ] Integrate Google OAuth
- [ ] Integrate GitHub OAuth
- [ ] Set up session management
- [ ] Implement rate limiting

### Week 3: Frontend Components
- [ ] Build auth modal
- [ ] Build profile setup form
- [ ] Build download prompt
- [ ] Wire up API calls

### Week 4: Testing & Deployment
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Deploy to production

---

## 15. Troubleshooting Guide

### Magic Link Not Received
```
Check:
1. Email provider spam folder
2. Email sending service status
3. Database token creation
4. Email template configuration
5. Try "Resend" option (rate limit check)
```

### OAuth Fails
```
Check:
1. OAuth credentials correct
2. Redirect URI matches exactly
3. Firewall/CORS issues
4. OAuth provider status
5. Token expiration
```

### Session Expires Too Soon
```
Check:
1. Session expiry time in env
2. Database session records
3. Cookie configuration
4. Client-side token refresh
```

### Rate Limiting Issues
```
Check:
1. Rate limit thresholds
2. IP detection correct (behind proxy?)
3. Distributed cache (Redis)
4. Database queries performance
```

---

**Document Version:** 1.0  
**Last Updated:** September 2026  
**Ready for:** AI Code Generation, Development Team Handoff
