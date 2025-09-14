-- RLS 정책 수정 SQL
-- Supabase SQL Editor에서 실행하세요

-- 1. 먼저 기존 RLS 정책 확인
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';

-- 2. RLS 비활성화 (테스트용)
-- 주의: 프로덕션에서는 권장하지 않음
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. 또는 RLS를 활성화하되, 더 관대한 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Allow anonymous users to insert" ON users;
DROP POLICY IF EXISTS "Allow anonymous users to read" ON users;
DROP POLICY IF EXISTS "Allow anonymous users to update" ON users;

-- 4. 새로운 관대한 정책 생성
-- 모든 사용자가 읽기 가능 (가입 신청 목록 확인용)
CREATE POLICY "Anyone can read users"
ON users FOR SELECT
USING (true);

-- 인증되지 않은 사용자도 INSERT 가능 (가입 신청용)
CREATE POLICY "Anyone can insert users"
ON users FOR INSERT
WITH CHECK (true);

-- 사용자 본인 또는 관리자가 UPDATE 가능
CREATE POLICY "Users can update own record or admin can update all"
ON users FOR UPDATE
USING (
    true  -- 임시로 모두 허용 (테스트용)
    -- auth.uid()::text = google_id OR
    -- auth.email() = email OR
    -- auth.email() IN ('ggamsire@gmail.com')  -- 관리자 이메일
)
WITH CHECK (true);

-- 5. anon(익명) 사용자에게 필요한 권한 부여
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 6. 시퀀스 권한 부여 (ID 생성용)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. RLS 정책 확인
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'users';

-- 8. 테스트: anon 권한으로 INSERT 시도
-- 이 쿼리가 성공하면 RLS 정책이 올바르게 설정된 것
/*
SET ROLE anon;
INSERT INTO users (email, name, status, created_at)
VALUES ('test@example.com', 'Test User', 'pending', NOW())
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
RETURNING *;
RESET ROLE;
*/