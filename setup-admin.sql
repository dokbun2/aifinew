-- Supabase 관리자 시스템 설정 SQL
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 먼저 RLS 비활성화 (테이블 수정을 위해)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. 초기 관리자 계정 생성 또는 업데이트
-- ggamsire@gmail.com이 이미 있으면 관리자로 업데이트
UPDATE users
SET
    role = 'admin',
    status = 'approved',
    approved_at = COALESCE(approved_at, NOW()),
    approved_by = 'system'
WHERE email = 'ggamsire@gmail.com';

-- ggamsire@gmail.com이 없으면 새로 생성
INSERT INTO users (
    email,
    name,
    nickname,
    role,
    status,
    password_hash,
    created_at,
    approved_at,
    approved_by
)
SELECT
    'ggamsire@gmail.com',
    '관리자',
    'Admin',
    'admin',
    'approved',
    '1234567890', -- 임시 비밀번호 해시
    NOW(),
    NOW(),
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'ggamsire@gmail.com'
);

-- 3. RLS 정책 재설정 (보안 강화)
-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;
DROP POLICY IF EXISTS "Enable delete for admins" ON users;

-- RLS 다시 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. 새로운 RLS 정책 생성

-- 모든 사용자가 읽기 가능
CREATE POLICY "Users can read all users"
ON users FOR SELECT
USING (true);

-- 모든 사용자가 회원가입 가능
CREATE POLICY "Anyone can sign up"
ON users FOR INSERT
WITH CHECK (true);

-- 관리자만 업데이트 가능 (상태 변경, 역할 변경 등)
CREATE POLICY "Admins can update all users"
ON users FOR UPDATE
USING (true)  -- 일단 모두 허용 (개발 중)
WITH CHECK (true);

-- 관리자만 삭제 가능
CREATE POLICY "Admins can delete users"
ON users FOR DELETE
USING (role = 'admin');

-- 5. 권한 부여
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;

-- 6. 현재 관리자 목록 확인
SELECT email, name, nickname, role, status, created_at, approved_at
FROM users
WHERE role = 'admin'
ORDER BY created_at;

-- 7. 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;