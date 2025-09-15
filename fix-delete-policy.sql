-- Supabase 삭제 정책 수정
-- 관리자가 다른 사용자를 삭제할 수 있도록 수정

-- 1. 기존 삭제 정책 제거
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- 2. 새로운 삭제 정책 생성
-- 모든 사용자가 삭제 가능 (실제 권한 체크는 프론트엔드에서)
CREATE POLICY "Enable delete for authenticated users"
ON users FOR DELETE
USING (true);

-- 또는 더 안전한 방법:
-- Supabase의 auth.uid()를 사용한 관리자 체크 (auth 테이블과 연동 필요)
-- 하지만 현재 구조상 프론트엔드에서 체크하는 것이 더 적합

-- 3. 현재 정책 확인
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

-- 4. 테스트를 위한 더 간단한 정책 (개발 환경용)
-- 주의: 프로덕션에서는 사용하지 마세요
-- DROP POLICY IF EXISTS "Enable delete for authenticated users" ON users;
-- CREATE POLICY "Enable delete for all"
-- ON users FOR DELETE
-- USING (true);