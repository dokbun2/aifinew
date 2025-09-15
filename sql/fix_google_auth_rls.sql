-- Google OAuth 인증을 위한 RLS 정책 수정
-- Supabase SQL Editor에서 실행하세요

-- 1. users 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    nickname TEXT,
    picture TEXT,
    is_approved BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_is_approved ON public.users(is_approved);

-- 3. RLS 비활성화 (먼저 테스트를 위해)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 4. 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Enable insert for all users" ON public.users;
DROP POLICY IF EXISTS "Enable select for all users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert users" ON public.users;
DROP POLICY IF EXISTS "Anyone can select users" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;

-- 5. RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 6. 새로운 정책 생성

-- 누구나 users 테이블에 INSERT 가능 (회원가입)
CREATE POLICY "Public users insert"
ON public.users FOR INSERT
TO public
WITH CHECK (true);

-- 누구나 users 테이블 SELECT 가능 (로그인 확인)
CREATE POLICY "Public users select"
ON public.users FOR SELECT
TO public
USING (true);

-- 자신의 레코드만 UPDATE 가능
CREATE POLICY "Users update own"
ON public.users FOR UPDATE
TO public
USING (email = current_setting('request.jwt.claims', true)::json->>'email')
WITH CHECK (email = current_setting('request.jwt.claims', true)::json->>'email');

-- 7. 함수 생성: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 트리거 생성
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 테스트용 관리자 계정 생성 (선택사항)
-- INSERT INTO public.users (email, name, is_approved, google_id)
-- VALUES ('admin@example.com', 'Admin User', true, 'admin_google_id')
-- ON CONFLICT (email) DO NOTHING;

-- 10. 권한 확인
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- 11. 테이블 상태 확인
SELECT
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables
WHERE tablename = 'users';

-- 12. RLS 정책 확인
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

-- 실행 완료 메시지
DO $$
BEGIN
    RAISE NOTICE 'Google OAuth RLS 정책 설정이 완료되었습니다!';
    RAISE NOTICE '다음 권한이 설정되었습니다:';
    RAISE NOTICE '- 누구나 회원가입 가능 (INSERT)';
    RAISE NOTICE '- 누구나 사용자 정보 조회 가능 (SELECT)';
    RAISE NOTICE '- 본인 정보만 수정 가능 (UPDATE)';
END $$;