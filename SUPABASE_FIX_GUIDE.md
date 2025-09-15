# Supabase 관리자 지정 기능 수정 가이드

## 문제 원인
400 Bad Request 에러는 Supabase의 RLS(Row Level Security) 정책 때문입니다.

## 해결 방법

### 1단계: Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "SQL Editor" 클릭

### 2단계: RLS 정책 수정
아래 SQL을 실행하세요:

```sql
-- 1. RLS 비활성화 (임시)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. 기존 UPDATE 정책 모두 제거
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON users;

-- 3. RLS 다시 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. 새로운 UPDATE 정책 생성 (모든 사용자가 업데이트 가능)
CREATE POLICY "Allow all updates"
ON users FOR UPDATE
USING (true)
WITH CHECK (true);

-- 5. 권한 부여
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;

-- 6. 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### 3단계: 테이블 구조 확인
```sql
-- users 테이블 구조 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users';
```

### 4단계: 테스트
1. 브라우저 캐시 삭제 (Ctrl+Shift+R)
2. 페이지 새로고침
3. 관리자 지정 버튼 클릭
4. 콘솔에서 에러 메시지 확인

## 대안: RLS 완전 비활성화 (개발용)
**⚠️ 주의: 프로덕션에서는 사용하지 마세요!**

```sql
-- RLS 완전 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

## 추가 디버깅
브라우저 콘솔에서 다음 명령어로 직접 테스트:

```javascript
// 콘솔에서 실행
const testUpdate = async () => {
    const supabase = window.supabase.createClient(
        'https://mnnbrsmkmnysdmtewuha.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubmJyc21rbW55c2RtdGV3dWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NjcxMTIsImV4cCI6MjA3MzQ0MzExMn0.HZBpA_RLn_1Jew9jou1APUApBVfLIyq-wIM-kujtyuc'
    );

    const { data, error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('email', 'sooyg8636@gmail.com')
        .select();

    console.log('결과:', data, error);
};
testUpdate();
```

## 문제가 계속되면
1. Supabase Dashboard에서 Table Editor로 이동
2. users 테이블 선택
3. 직접 role 컬럼을 'admin'으로 수정
4. 수정이 되면 → RLS 정책 문제
5. 수정이 안 되면 → 테이블 권한 문제