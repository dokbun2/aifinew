-- users 테이블 수정 SQL
-- 기존 테이블에 누락된 컬럼 추가

-- updated_at 컬럼이 없으면 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- approved_at 컬럼이 없으면 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- approved_by 컬럼이 없으면 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- metadata 컬럼이 없으면 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 테이블 구조 확인
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 테스트: 현재 users 테이블 데이터 확인
SELECT * FROM users;

-- 관리자 계정 업데이트 (이메일을 실제 관리자 이메일로 변경)
UPDATE users
SET status = 'approved',
    updated_at = NOW()
WHERE email = 'ggamsire@gmail.com';

-- 최종 확인
SELECT
    email,
    name,
    status,
    created_at,
    updated_at,
    login_count
FROM users
ORDER BY created_at DESC;