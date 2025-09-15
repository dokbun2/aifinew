-- 🚀 빠른 수정 SQL
-- Supabase SQL Editor에서 이 코드를 실행하세요

-- 1. user_id 컬럼 추가 (없는 경우)
ALTER TABLE project_backups
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 2. 기존 데이터의 user_id 업데이트
UPDATE project_backups
SET user_id = user_email
WHERE user_id IS NULL;

-- 3. RLS 임시 비활성화 (개발/테스트용)
ALTER TABLE project_backups DISABLE ROW LEVEL SECURITY;

-- 4. 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'project_backups'
ORDER BY ordinal_position;

-- 5. 테스트 데이터 삽입 (선택사항)
INSERT INTO project_backups (
    user_id,
    user_email,
    user_name,
    project_name,
    project_type,
    backup_data,
    metadata
) VALUES (
    'test@example.com',
    'test@example.com',
    'Test User',
    'Test_Project_' || to_char(NOW(), 'YYYY-MM-DD_HH24-MI-SS'),
    'movie',
    jsonb_build_object(
        'test', true,
        'created', NOW()::TEXT,
        'message', '테스트 데이터입니다'
    ),
    jsonb_build_object(
        'source', 'sql_test',
        'version', '1.0'
    )
) ON CONFLICT (user_email, project_name) DO UPDATE
SET backup_data = EXCLUDED.backup_data,
    updated_at = NOW();

-- 6. 최근 백업 확인
SELECT
    user_email,
    project_name,
    created_at,
    updated_at,
    jsonb_pretty(backup_data) as data
FROM project_backups
ORDER BY created_at DESC
LIMIT 5;