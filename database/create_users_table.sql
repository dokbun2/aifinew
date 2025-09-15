-- =====================================================
-- 사용자 관리 테이블 생성
-- =====================================================
-- Supabase SQL Editor에서 실행하세요

-- 1. 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    picture TEXT,
    google_id TEXT UNIQUE,

    -- 승인 관리
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'blocked')),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by TEXT,

    -- 역할 관리
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),

    -- 메타데이터
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

    -- 추가 정보
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- 3. RLS 비활성화 (개발 중)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 4. 기본 관리자 계정 생성 (이메일을 실제 관리자 이메일로 변경하세요!)
INSERT INTO public.users (
    email,
    name,
    role,
    status,
    approved_at
) VALUES (
    'pogam12@gmail.com',  -- 관리자 이메일로 변경
    '관리자',
    'super_admin',
    'approved',
    NOW()
) ON CONFLICT (email) DO UPDATE
SET role = 'super_admin',
    status = 'approved';

-- 5. 사용자 목록 확인
SELECT
    email,
    name,
    status,
    role,
    created_at
FROM users
ORDER BY created_at DESC;