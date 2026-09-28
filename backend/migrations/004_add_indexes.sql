-- Add indexes for heavily queried fields

-- Notes table indexes
CREATE INDEX IF NOT EXISTS idx_notes_visibility ON notes(visibility);
CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_branch ON notes(branch);
CREATE INDEX IF NOT EXISTS idx_notes_academic_year ON notes(academic_year);
CREATE INDEX IF NOT EXISTS idx_notes_uploader_id ON notes(uploader_id);
CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON notes(deleted_at);

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_note_id ON comments(note_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);

-- Bookmarks table indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_note_id ON bookmarks(note_id);

-- Auth tokens table indexes
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
