-- AIFI Dashboard Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users Profile Table (extends Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    google_id TEXT UNIQUE,
    preferences JSONB DEFAULT '{"default_view": "grid", "auto_save": true, "save_interval": 5}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- Projects Table (Main Entity)
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic Info
    project_name TEXT NOT NULL,
    film_id TEXT UNIQUE NOT NULL,
    project_type TEXT NOT NULL DEFAULT 'movie' CHECK (project_type IN ('movie', 'cf')),
    genre TEXT,
    description TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed')),
    thumbnail_url TEXT,

    -- Type-specific Details
    movie_details JSONB,
    cf_details JSONB,

    -- Data Storage
    storyboard_data JSONB DEFAULT '{}'::jsonb,
    concept_art_data JSONB DEFAULT '{}'::jsonb,

    -- Statistics
    statistics JSONB DEFAULT '{
        "total_sequences": 0,
        "total_scenes": 0,
        "total_shots": 0,
        "total_characters": 0,
        "total_locations": 0,
        "total_props": 0
    }'::jsonb,

    -- Metadata
    is_archived BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

    -- Indexes
    CONSTRAINT unique_film_id_per_user UNIQUE(user_id, film_id)
);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_type ON public.projects(project_type);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

-- ============================================
-- Project Versions Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

    -- Version Info
    version_number TEXT NOT NULL,
    version_name TEXT,
    version_type TEXT DEFAULT 'draft' CHECK (version_type IN ('draft', 'review', 'final', 'archived')),

    -- CF Specific
    duration INTEGER, -- seconds for CF
    platform TEXT, -- TV, YouTube, Instagram
    aspect_ratio TEXT, -- 16:9, 9:16, 1:1

    -- Data Snapshots
    storyboard_data JSONB,
    concept_art_data JSONB,
    metadata JSONB,

    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

    -- Unique constraint
    CONSTRAINT unique_version_per_project UNIQUE(project_id, version_number)
);

CREATE INDEX idx_versions_project_id ON public.project_versions(project_id);
CREATE INDEX idx_versions_created_at ON public.project_versions(created_at DESC);

-- ============================================
-- CF Approvals Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.cf_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID NOT NULL REFERENCES public.project_versions(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    feedback TEXT,
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_approvals_version_id ON public.cf_approvals(version_id);
CREATE INDEX idx_approvals_project_id ON public.cf_approvals(project_id);

-- ============================================
-- Project Collaborators Table (Future)
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
    invited_by UUID REFERENCES auth.users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

    CONSTRAINT unique_collaborator UNIQUE(project_id, user_id)
);

CREATE INDEX idx_collaborators_project_id ON public.project_collaborators(project_id);
CREATE INDEX idx_collaborators_user_id ON public.project_collaborators(user_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Projects Policies
CREATE POLICY "Users can view own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id OR
           EXISTS (
               SELECT 1 FROM public.project_collaborators
               WHERE project_id = projects.id
               AND user_id = auth.uid()
           ));

CREATE POLICY "Users can create own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- Project Versions Policies
CREATE POLICY "Users can view versions of accessible projects"
    ON public.project_versions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_versions.project_id
        AND (user_id = auth.uid() OR
             EXISTS (
                 SELECT 1 FROM public.project_collaborators
                 WHERE project_id = projects.id
                 AND user_id = auth.uid()
             ))
    ));

CREATE POLICY "Users can create versions for own projects"
    ON public.project_versions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_versions.project_id
        AND user_id = auth.uid()
    ));

-- ============================================
-- Functions & Triggers
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Storage Policies
-- ============================================

-- Create storage policies (run in Storage section of Supabase)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);

-- Storage policies for project files
-- CREATE POLICY "Users can upload own project files"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own project files"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own project files"
--     ON storage.objects FOR DELETE
--     USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);