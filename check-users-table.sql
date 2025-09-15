-- Supabase users 테이블 구조 및 데이터 확인 SQL
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하여 정확한 필드명과 데이터를 확인하세요

-- 1. 테이블 구조 확인 (모든 컬럼 정보)
SELECT
    column_name as "컬럼명",
    data_type as "데이터타입",
    is_nullable as "NULL허용",
    column_default as "기본값"
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. 실제 데이터 확인 (처음 10개)
SELECT
    id,
    email,
    name,
    nickname,
    role,
    status,
    created_at,
    approved_at,
    last_login
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 3. 승인 대기 중인 사용자 확인
SELECT
    email as "이메일",
    name as "이름",
    nickname as "닉네임",
    status as "상태",
    created_at as "가입일시"
FROM users
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 4. 필드명 확인을 위한 상세 쿼리
SELECT
    email,
    COALESCE(name, 'name필드없음') as name_field,
    COALESCE(nickname, 'nickname필드없음') as nickname_field,
    status,
    created_at
FROM users
WHERE email IN ('test@example.com', 'abc@example.com', 'dokbun2@gmail.com')
ORDER BY created_at DESC;

-- 5. 테이블에 실제로 존재하는 컬럼만 조회
SELECT * FROM users LIMIT 3;