-- Supabase 테이블 스키마 설정
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 기존 테이블이 있다면 삭제 (주의: 데이터가 삭제됩니다!)
-- DROP TABLE IF EXISTS project_backups CASCADE;

-- project_backups 테이블 생성
CREATE TABLE IF NOT EXISTS project_backups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Google 로그인 이메일
    user_email TEXT NOT NULL,
    user_name TEXT,
    project_name TEXT NOT NULL,
    project_type TEXT DEFAULT 'movie',
    backup_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    metadata JSONB,

    -- 유니크 제약: 같은 사용자의 같은 프로젝트명은 하나만
    UNIQUE(user_email, project_name)
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_project_backups_user_email ON project_backups(user_email);
CREATE INDEX IF NOT EXISTS idx_project_backups_project_name ON project_backups(project_name);
CREATE INDEX IF NOT EXISTS idx_project_backups_created_at ON project_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_backups_is_deleted ON project_backups(is_deleted);

-- RLS (Row Level Security) 활성화
ALTER TABLE project_backups ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 백업만 볼 수 있음
CREATE POLICY "Users can view own backups" ON project_backups
    FOR SELECT
    USING (auth.jwt() ->> 'email' = user_email);

-- RLS 정책: 사용자는 자신의 백업만 생성할 수 있음
CREATE POLICY "Users can create own backups" ON project_backups
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- RLS 정책: 사용자는 자신의 백업만 수정할 수 있음
CREATE POLICY "Users can update own backups" ON project_backups
    FOR UPDATE
    USING (auth.jwt() ->> 'email' = user_email);

-- RLS 정책: 사용자는 자신의 백업만 삭제할 수 있음 (soft delete)
CREATE POLICY "Users can delete own backups" ON project_backups
    FOR DELETE
    USING (auth.jwt() ->> 'email' = user_email);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거
CREATE TRIGGER update_project_backups_updated_at
    BEFORE UPDATE ON project_backups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 테스트 데이터 삽입 (선택사항)
-- INSERT INTO project_backups (user_id, user_email, user_name, project_name, backup_data)
-- VALUES (
--     'test@example.com',
--     'test@example.com',
--     'Test User',
--     'Test Project',
--     '{"test": "data"}'::jsonb
-- );

-- 테이블 구조 확인
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'project_backups';