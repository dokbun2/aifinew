-- 🔧 가장 간단한 수정 SQL (에러 없는 버전)
-- 각 명령을 하나씩 실행하세요

-- 1단계: user_id 컬럼 추가
ALTER TABLE project_backups
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 2단계: 기존 데이터 업데이트
UPDATE project_backups
SET user_id = user_email
WHERE user_id IS NULL;

-- 3단계: RLS 비활성화 (중요!)
ALTER TABLE project_backups DISABLE ROW LEVEL SECURITY;

-- 4단계: 간단한 테스트 데이터 (에러 방지를 위해 단순화)
INSERT INTO project_backups (
    user_id,
    user_email,
    user_name,
    project_name,
    project_type,
    backup_data
) VALUES (
    'test@example.com',
    'test@example.com',
    'Test User',
    'Test_Project_001',
    'movie',
    '{"test": true, "message": "This is a test"}'::jsonb
) ON CONFLICT (user_email, project_name)
DO UPDATE SET
    backup_data = EXCLUDED.backup_data,
    updated_at = NOW();

-- 5단계: 결과 확인
SELECT * FROM project_backups
ORDER BY created_at DESC
LIMIT 5;