-- AIFI Dashboard Database Schema Update
-- Add backup_data column to projects table

-- Add backup_data column if it doesn't exist
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS backup_data JSONB DEFAULT '{}'::jsonb;

-- Add metadata column if it doesn't exist
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add user_email and user_name columns for Google Auth compatibility
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS user_email TEXT;

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Create index on user_email for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_user_email ON public.projects(user_email);

-- Update RLS policies to allow user_email based access
CREATE POLICY "Users can manage their own projects by email" ON public.projects
    FOR ALL
    USING (user_email = current_setting('request.jwt.claims')::json->>'email'
           OR user_email = current_setting('request.jwt.claims')::json->>'sub');

-- Alternative: Create a simpler projects table for backup purposes
CREATE TABLE IF NOT EXISTS public.project_backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    user_name TEXT,
    project_name TEXT NOT NULL,
    project_type TEXT DEFAULT 'movie',
    backup_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    is_deleted BOOLEAN DEFAULT FALSE,

    -- Create unique constraint on user_email and project_name
    CONSTRAINT unique_user_project UNIQUE(user_email, project_name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_backups_user_email ON public.project_backups(user_email);
CREATE INDEX IF NOT EXISTS idx_project_backups_is_deleted ON public.project_backups(is_deleted);

-- Enable RLS on project_backups
ALTER TABLE public.project_backups ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (since we're using Google Auth, not Supabase Auth)
CREATE POLICY "Allow all operations on project_backups" ON public.project_backups
    FOR ALL
    USING (true)
    WITH CHECK (true);