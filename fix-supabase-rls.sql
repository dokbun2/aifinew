-- Supabase RLS 정책 수정 SQL
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 먼저 users 테이블의 RLS 상태 확인
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- 2. RLS 비활성화 (임시 해결책)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 또는

-- 3. RLS를 유지하면서 정책 추가 (권장)
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;

-- 새로운 정책 생성
-- 모든 사용자가 읽기 가능
CREATE POLICY "Enable read access for all users"
ON users FOR SELECT
USING (true);

-- 모든 사용자가 추가 가능 (회원가입)
CREATE POLICY "Enable insert for all users"
ON users FOR INSERT
WITH CHECK (true);

-- 모든 사용자가 업데이트 가능 (임시 - 개발용)
CREATE POLICY "Enable update for all users"
ON users FOR UPDATE
USING (true)
WITH CHECK (true);

-- 또는 관리자만 업데이트 가능하게 하려면:
-- CREATE POLICY "Enable update for admins"
-- ON users FOR UPDATE
-- USING (role = 'admin' OR email = 'ggamsire@gmail.com')
-- WITH CHECK (role = 'admin' OR email = 'ggamsire@gmail.com');

-- 4. 권한 확인
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;

-- 5. 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;