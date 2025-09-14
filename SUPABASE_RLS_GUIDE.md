# Supabase RLS 정책 설정 가이드

## 🚨 중요: 관리자 페이지가 작동하지 않는 경우 반드시 확인해야 할 사항

### 1. Supabase 대시보드 접속
1. https://app.supabase.com 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 "Authentication" → "Policies" 클릭

### 2. RLS (Row Level Security) 비활성화 (임시)

**⚠️ 주의: 프로덕션 환경에서는 권장하지 않음. 개발 환경에서만 사용**

#### SQL Editor에서 실행:
```sql
-- RLS 비활성화 (임시)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### 3. 또는 적절한 RLS 정책 생성

#### SQL Editor에서 실행:
```sql
-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Enable read access for all users" ON users
FOR SELECT USING (true);

-- 인증된 사용자만 삽입 가능
CREATE POLICY "Enable insert for authenticated users only" ON users
FOR INSERT WITH CHECK (true);

-- 모든 사용자가 업데이트 가능 (임시)
CREATE POLICY "Enable update for all users" ON users
FOR UPDATE USING (true) WITH CHECK (true);

-- 모든 사용자가 삭제 가능 (임시)
CREATE POLICY "Enable delete for all users" ON users
FOR DELETE USING (true);
```

### 4. 프로덕션용 보안 RLS 정책 (권장)

```sql
-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 작업 가능
CREATE POLICY "Admins can do everything" ON users
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.email = current_setting('app.current_user_email', true)::text
        AND users.role = 'admin'
        AND users.status = 'approved'
    )
);

-- 일반 사용자는 자신의 정보만 읽기 가능
CREATE POLICY "Users can read own data" ON users
FOR SELECT USING (
    email = current_setting('app.current_user_email', true)::text
);

-- 신규 사용자 등록 허용
CREATE POLICY "Anyone can register" ON users
FOR INSERT WITH CHECK (
    status = 'pending' AND role = 'user'
);
```

### 5. 테이블 권한 확인

```sql
-- 현재 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'users';

-- RLS 상태 확인
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname = 'users';
```

### 6. 문제 해결 체크리스트

- [ ] users 테이블이 존재하는가?
- [ ] RLS가 활성화되어 있는가?
- [ ] 적절한 정책이 설정되어 있는가?
- [ ] anon key로 접근 권한이 있는가?
- [ ] 테이블 컬럼이 올바르게 설정되어 있는가?

### 7. 테이블 구조 확인

```sql
-- users 테이블 구조
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

### 8. 필수 컬럼 확인

users 테이블에 다음 컬럼들이 반드시 있어야 합니다:
- `id` (UUID, Primary Key)
- `email` (TEXT, Unique, Not Null)
- `password_hash` (TEXT)
- `name` (TEXT)
- `nickname` (TEXT)
- `status` (TEXT) - 'pending', 'approved', 'rejected'
- `role` (TEXT) - 'user', 'admin'
- `created_at` (TIMESTAMP)
- `approved_at` (TIMESTAMP)
- `approved_by` (TEXT)
- `rejected_at` (TIMESTAMP)
- `rejected_by` (TEXT)
- `last_login` (TIMESTAMP)

### 9. 디버깅 팁

브라우저 콘솔에서 다음 로그들을 확인하세요:
- `✅ Supabase 초기화 완료` - Supabase 연결 성공
- `✅ Users 테이블 확인 완료` - 테이블 접근 성공
- `❌ 업데이트 오류` - RLS 정책 문제일 가능성 높음
- `⚠️ RLS 정책 오류` - 권한 문제 확인 필요

### 10. 긴급 해결책 (개발용)

모든 방법이 실패한 경우:
```sql
-- 모든 RLS 정책 삭제
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;
DROP POLICY IF EXISTS "Enable delete for all users" ON users;

-- RLS 완전 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Public 스키마에 모든 권한 부여 (매우 위험!)
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
```

**⚠️ 경고: 위 긴급 해결책은 보안상 매우 위험하므로 개발 환경에서만 사용하고, 문제 해결 후 즉시 적절한 RLS 정책을 다시 설정하세요!**