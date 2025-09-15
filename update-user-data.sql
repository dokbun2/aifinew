-- Supabase users 테이블 데이터 업데이트 SQL
-- 테스트 데이터가 올바르게 표시되도록 데이터 수정

-- 1. 먼저 현재 데이터 확인
SELECT email, name, nickname, status FROM users
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 2. 테스트 데이터 업데이트
-- 첫 번째 테스트 유저
UPDATE users
SET
    name = '테스트유저',
    nickname = 'tester'
WHERE email = 'abc@example.com';

-- 두 번째 테스트 유저
UPDATE users
SET
    name = '테스트유저',
    nickname = 'tester'
WHERE email = 'test@example.com';

-- 아이파이 유저
UPDATE users
SET
    name = '아이파이',
    nickname = '@아이파이'
WHERE email = 'dokbun2@gmail.com';

-- 3. 업데이트 결과 확인
SELECT
    email as "이메일",
    name as "이름",
    nickname as "닉네임",
    status as "상태",
    created_at as "가입일시"
FROM users
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 4. 만약 name, nickname 컬럼이 없다면 추가
-- (이미 있으면 오류가 발생하므로 무시하면 됨)
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(255);

-- 5. 전체 사용자 데이터 정리
UPDATE users
SET nickname = COALESCE(nickname, username, SPLIT_PART(email, '@', 1))
WHERE nickname IS NULL OR nickname = '';

UPDATE users
SET name = COALESCE(name, full_name, display_name, nickname, '이름 없음')
WHERE name IS NULL OR name = '';