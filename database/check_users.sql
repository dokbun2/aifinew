-- =====================================================
-- users 테이블 확인 SQL
-- =====================================================

-- 1. users 테이블이 존재하는지 확인
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'users'
) as table_exists;

-- 2. users 테이블 구조 확인
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. users 테이블의 모든 데이터 확인
SELECT * FROM users ORDER BY created_at DESC;

-- 4. 승인 대기중인 사용자만 확인
SELECT
    email,
    name,
    status,
    created_at
FROM users
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 5. 테이블에 데이터가 있는지 개수 확인
SELECT
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_users
FROM users;