-- SOP Checker Database Setup
-- Run this in your Supabase SQL Editor: https://pceyuvmtiimpxeknxggo.supabase.co

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth_user table for Django compatibility
CREATE TABLE IF NOT EXISTS auth_user (
    id SERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL DEFAULT 'pbkdf2_sha256$600000$dummy$hash',
    last_login TIMESTAMPTZ,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    username VARCHAR(150) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    email VARCHAR(254) NOT NULL DEFAULT '',
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_joined TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sop_lists table
CREATE TABLE IF NOT EXISTS sop_lists (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_user_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    created_by_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create sop_items table
CREATE TABLE IF NOT EXISTS sop_items (
    id SERIAL PRIMARY KEY,
    sop_list_id INTEGER NOT NULL REFERENCES sop_lists(id) ON DELETE CASCADE,
    text VARCHAR(500) NOT NULL,
    is_checked BOOLEAN NOT NULL DEFAULT FALSE,
    "order" INTEGER NOT NULL DEFAULT 0,
    checked_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sop_lists_assigned_user ON sop_lists(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_sop_lists_created_by ON sop_lists(created_by_id);
CREATE INDEX IF NOT EXISTS idx_sop_lists_created_at ON sop_lists(created_at);
CREATE INDEX IF NOT EXISTS idx_sop_items_sop_list ON sop_items(sop_list_id);
CREATE INDEX IF NOT EXISTS idx_sop_items_order ON sop_items("order");

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on sop_lists
DROP TRIGGER IF EXISTS update_sop_lists_updated_at ON sop_lists;
CREATE TRIGGER update_sop_lists_updated_at BEFORE UPDATE ON sop_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample users for testing
INSERT INTO auth_user (username, first_name, last_name, email, is_staff, is_superuser) VALUES
('admin', 'Admin', 'User', 'admin@sopchecker.com', true, true),
('john_doe', 'John', 'Doe', 'john@sopchecker.com', false, false),
('jane_smith', 'Jane', 'Smith', 'jane@sopchecker.com', false, false),
('mike_johnson', 'Mike', 'Johnson', 'mike@sopchecker.com', false, false)
ON CONFLICT (username) DO NOTHING;

-- Insert sample SOP lists for testing
WITH sample_users AS (
    SELECT id, username FROM auth_user WHERE username IN ('admin', 'john_doe', 'jane_smith')
)
INSERT INTO sop_lists (title, description, assigned_user_id, created_by_id) 
SELECT 
    'Morning Setup Checklist',
    'Daily morning setup procedures for the office',
    u1.id,
    u2.id
FROM sample_users u1, sample_users u2 
WHERE u1.username = 'john_doe' AND u2.username = 'admin'
ON CONFLICT DO NOTHING;

WITH sample_users AS (
    SELECT id, username FROM auth_user WHERE username IN ('admin', 'john_doe', 'jane_smith')
)
INSERT INTO sop_lists (title, description, assigned_user_id, created_by_id) 
SELECT 
    'Equipment Safety Check',
    'Weekly safety inspection of all equipment',
    u1.id,
    u2.id
FROM sample_users u1, sample_users u2 
WHERE u1.username = 'jane_smith' AND u2.username = 'admin'
ON CONFLICT DO NOTHING;

-- Insert sample SOP items
WITH sample_list AS (
    SELECT id FROM sop_lists WHERE title = 'Morning Setup Checklist' LIMIT 1
)
INSERT INTO sop_items (sop_list_id, text, "order") 
SELECT 
    sl.id,
    unnest(ARRAY[
        'Turn on all computers and systems',
        'Check temperature and lighting',
        'Verify internet connectivity',
        'Review daily schedule',
        'Prepare work materials'
    ]),
    generate_series(0, 4)
FROM sample_list sl
ON CONFLICT DO NOTHING;

WITH sample_list AS (
    SELECT id FROM sop_lists WHERE title = 'Equipment Safety Check' LIMIT 1
)
INSERT INTO sop_items (sop_list_id, text, "order") 
SELECT 
    sl.id,
    unnest(ARRAY[
        'Visual inspection of all equipment',
        'Check for any loose connections',
        'Test emergency stops and safety features',
        'Verify proper ventilation',
        'Document any issues found'
    ]),
    generate_series(0, 4)
FROM sample_list sl
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 'Users created:' as info, count(*) as count FROM auth_user
UNION ALL
SELECT 'Lists created:', count(*) FROM sop_lists  
UNION ALL
SELECT 'Items created:', count(*) FROM sop_items; 