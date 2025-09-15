-- =====================================================
-- Supabase project_backups 테이블 완전 수정 SQL
-- =====================================================
-- 실행 방법: Supabase SQL Editor에서 단계별로 실행하세요

-- =====================================================
-- STEP 1: user_id 컬럼 추가 (필수)
-- =====================================================
ALTER TABLE project_backups
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 기존 데이터가 있다면 user_id를 user_email로 채우기
UPDATE project_backups
SET user_id = user_email
WHERE user_id IS NULL;

-- =====================================================
-- STEP 2: RLS (Row Level Security) 설정
-- =====================================================
-- 개발 중에는 RLS 비활성화 (테스트 완료 후 다시 활성화 권장)
ALTER TABLE project_backups DISABLE ROW LEVEL SECURITY;

-- 나중에 RLS를 다시 활성화하려면:
-- ALTER TABLE project_backups ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: 테이블 구조 확인
-- =====================================================
SELECT
    column_name as "컬럼명",
    data_type as "데이터타입",
    is_nullable as "NULL허용",
    column_default as "기본값"
FROM information_schema.columns
WHERE table_name = 'project_backups'
ORDER BY ordinal_position;

-- =====================================================
-- STEP 4: 간단한 테스트 (선택사항)
-- =====================================================
-- 테스트 데이터 삽입
DO $$
BEGIN
    -- 테스트 데이터 삽입 시도
    INSERT INTO project_backups (
        user_id,
        user_email,
        user_name,
        project_name,
        project_type,
        backup_data,
        metadata,
        created_at,
        updated_at
    ) VALUES (
        'test@example.com',
        'test@example.com',
        'Test User',
        'Test_Project_' || to_char(NOW(), 'YYYYMMDD_HH24MISS'),
        'movie',
        jsonb_build_object(
            'test', true,
            'created_at', NOW()::TEXT,
            'message', '테스트 백업 데이터',
            'version', '1.0',
            'data', jsonb_build_object(
                'sequences', ARRAY[]::text[],
                'shots', ARRAY[]::text[]
            )
        ),
        jsonb_build_object(
            'source', 'sql_test',
            'environment', 'development',
            'created_by', 'admin'
        ),
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ 테스트 데이터 삽입 성공!';

EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE '⚠️ 테스트 데이터가 이미 존재합니다 (중복 방지됨)';
    WHEN OTHERS THEN
        RAISE NOTICE '❌ 오류 발생: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 5: 데이터 확인
-- =====================================================
-- 최근 저장된 백업 데이터 확인
SELECT
    user_email as "사용자 이메일",
    project_name as "프로젝트명",
    project_type as "프로젝트 타입",
    created_at as "생성일시",
    updated_at as "수정일시",
    pg_size_pretty(length(backup_data::text)::bigint) as "데이터 크기"
FROM project_backups
WHERE is_deleted = false OR is_deleted IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- STEP 6: 권한 확인 (중요)
-- =====================================================
-- 현재 사용자의 권한 확인
SELECT
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'project_backups';

-- =====================================================
-- 문제 해결 가이드
-- =====================================================
/*
🔧 일반적인 문제와 해결방법:

1. "column user_id does not exist" 오류
   → STEP 1 실행

2. "permission denied" 오류
   → STEP 2 실행 (RLS 비활성화)

3. JSON 파싱 오류
   → jsonb_build_object 함수 사용 (STEP 4 참고)

4. 데이터가 저장되지 않음
   → STEP 5로 데이터 확인
   → STEP 6으로 권한 확인

5. 프로덕션 배포 시
   → RLS를 다시 활성화하고 적절한 정책 설정 필요
*/