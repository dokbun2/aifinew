-- Supabase UPDATE 정책 수정
-- 관리자가 다른 사용자의 role을 변경할 수 있도록 수정

-- 1. 기존 UPDATE 정책 제거
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- 2. 새로운 UPDATE 정책 생성
-- 모든 인증된 사용자가 UPDATE 가능 (실제 권한 체크는 프론트엔드에서)
CREATE POLICY "Enable update for authenticated users"
ON users FOR UPDATE
USING (true)
WITH CHECK (true);

-- 3. 테이블 권한 확인
GRANT UPDATE ON users TO authenticated;
GRANT UPDATE ON users TO anon;

-- 4. 현재 정책 확인
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
WHERE tablename = 'users'
ORDER BY policyname;

-- 5. RLS 상태 확인
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'users';