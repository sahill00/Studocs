-- Drop existing tables to recreate with the new hybrid auth schema
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS study_groups CASCADE;
DROP TABLE IF EXISTS collection_notes CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS note_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS oauth_accounts CASCADE;
DROP TABLE IF EXISTS auth_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS colleges CASCADE;

-- Colleges Table (referenced by users)
CREATE TABLE colleges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO colleges (name, domain) VALUES ('IIIT Hyderabad', 'iiit.ac.in');

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    
    -- Basic Info
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    profile_picture_url VARCHAR(500),
    bio TEXT,
    
    -- College Info
    college_id INTEGER REFERENCES colleges(id),
    college_name VARCHAR(255),
    branch VARCHAR(100),
    year_of_study INTEGER,
    
    -- Authentication
    password_hash VARCHAR(255) NULL,
    auth_method VARCHAR(50) DEFAULT 'email',
    
    -- Account Status
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    
    -- Stats
    reputation_score INTEGER DEFAULT 0,
    total_notes_uploaded INTEGER DEFAULT 0,
    total_downloads INTEGER DEFAULT 0
);

-- Authentication Tokens Table (Magic Links)
CREATE TABLE auth_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    token_type VARCHAR(50) DEFAULT 'magic_link',
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Recreate Notes Table for the app to keep working
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    note_type VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(50),
    visibility VARCHAR(50) DEFAULT 'PUBLIC',
    file_url VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT,
    file_type VARCHAR(50),
    uploader_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    branch VARCHAR(100),
    academic_year INTEGER,
    semester INTEGER,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
