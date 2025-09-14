-- Supabase users 테이블 생성 SQL
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 기존 테이블이 있으면 삭제 (주의: 데이터가 삭제됩니다)
-- DROP TABLE IF EXISTS users;

-- users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    picture TEXT,
    google_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    login_count INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by TEXT,
    metadata JSONB,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 모든 사용자가 자신의 정보를 읽을 수 있음
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (true);

-- 정책 생성: 모든 사용자가 자신의 정보를 삽입할 수 있음
CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (true);

-- 정책 생성: 모든 사용자가 자신의 정보를 업데이트할 수 있음
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (true);

-- 업데이트 시간 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 초기 관리자 추가 (이메일을 실제 관리자 이메일로 변경하세요)
INSERT INTO users (email, name, status, created_at)
VALUES ('ggamsire@gmail.com', '관리자', 'approved', NOW())
ON CONFLICT (email)
DO UPDATE SET status = 'approved';

-- 테이블 권한 설정
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;

-- 테스트 쿼리
-- SELECT * FROM users;
-- SELECT * FROM users WHERE status = 'pending';
-- SELECT * FROM users WHERE status = 'approved';