-- AIFI 인증 시스템을 위한 Supabase 테이블 생성 스크립트
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 기존 테이블 삭제 (필요시)
-- DROP TABLE IF EXISTS users CASCADE;

-- users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    nickname TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    profile_picture TEXT,
    login_count INTEGER DEFAULT 0,
    google_id TEXT
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 1. 모든 사용자가 자신의 정보를 읽을 수 있음
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (true);

-- 2. 새로운 사용자 등록 허용 (회원가입)
CREATE POLICY "Anyone can insert new user"
    ON users FOR INSERT
    WITH CHECK (true);

-- 3. 사용자가 자신의 정보를 업데이트할 수 있음
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- 4. 관리자만 다른 사용자 정보를 업데이트할 수 있음
CREATE POLICY "Admins can update all users"
    ON users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
            AND role = 'admin'
        )
    );

-- 5. 관리자만 사용자를 삭제할 수 있음
CREATE POLICY "Admins can delete users"
    ON users FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
            AND role = 'admin'
        )
    );

-- projects 테이블 (프로젝트 백업용 - 선택사항)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT REFERENCES users(email) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    film_id TEXT,
    backup_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_email, project_name)
);

-- projects 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_projects_user_email ON projects(user_email);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- projects 테이블 RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- projects RLS 정책
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert own projects"
    ON projects FOR INSERT
    WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- 초기 관리자 계정 생성 (비밀번호는 setup-admin.html에서 설정)
-- 주의: 이 쿼리는 setup-admin.html 페이지를 통해 실행하는 것을 권장합니다
/*
INSERT INTO users (
    email,
    password_hash,
    name,
    status,
    role,
    approved_at,
    profile_picture
) VALUES (
    'ggamsire@gmail.com',
    '여기에_해시된_비밀번호', -- setup-admin.html에서 생성
    '관리자',
    'approved',
    'admin',
    NOW(),
    'https://ui-avatars.com/api/?name=관리자&background=ff6b6b&color=fff'
) ON CONFLICT (email) DO NOTHING;
*/

-- 테이블 권한 설정 (public 액세스 허용)
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT ALL ON projects TO anon;
GRANT ALL ON projects TO authenticated;

-- 함수: 사용자 승인
CREATE OR REPLACE FUNCTION approve_user(user_email TEXT, admin_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users
    SET status = 'approved',
        approved_at = NOW(),
        approved_by = admin_email
    WHERE email = user_email;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수: 사용자 거절
CREATE OR REPLACE FUNCTION reject_user(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users
    SET status = 'rejected'
    WHERE email = user_email;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수: 마지막 로그인 시간 업데이트
CREATE OR REPLACE FUNCTION update_last_login(user_email TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET last_login = NOW(),
        login_count = login_count + 1
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 테이블에 nickname 컬럼 추가 (이미 있는 경우 무시)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'nickname'
    ) THEN
        ALTER TABLE users ADD COLUMN nickname TEXT;
        RAISE NOTICE '✅ nickname 컬럼이 추가되었습니다.';
    ELSE
        RAISE NOTICE '📌 nickname 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- 성공 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ AIFI 인증 시스템 테이블이 성공적으로 생성되었습니다!';
    RAISE NOTICE '📌 setup-admin.html 페이지를 열어 관리자 계정을 생성하세요.';
END $$;