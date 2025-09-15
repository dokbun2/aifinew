-- Supabase SQL Editor에서 실행하세요
-- Projects 테이블 구조 수정

-- 1. 먼저 현재 테이블 구조 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projects';

-- 2. breakdown_data 컬럼이 없다면 추가
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS breakdown_data JSONB;

-- 3. 다른 필요한 컬럼들도 추가
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS film_id TEXT,
ADD COLUMN IF NOT EXISTS conceptart_data JSONB,
ADD COLUMN IF NOT EXISTS stage_data JSONB,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 4. RLS 정책 비활성화 (테스트용)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- 5. 권한 부여
GRANT ALL ON projects TO anon;
GRANT ALL ON projects TO authenticated;

-- 6. 테이블 구조 확인
SELECT * FROM projects LIMIT 1;