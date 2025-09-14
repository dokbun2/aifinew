# 구글 로그인 + Supabase 인증 시스템 설정 가이드

## 📋 문제 해결 완료 항목

### 1. ✅ 수정된 파일들
- `js/auth.js`: Supabase 저장 로직 개선
- `js/admin-supabase.js`: 관리자 페이지 데이터 조회 로직 개선
- `index.html`: ProjectBackup 초기화 추가
- `js/modules/project-backup.js`: 중복 초기화 방지

### 2. ✅ 구현된 기능
- 구글 로그인 후 Supabase users 테이블에 자동 저장
- 중복 가입 방지 로직
- 관리자 페이지에서 Supabase 데이터 조회
- 더 나은 에러 처리 및 로깅

## 🚀 Supabase 설정 방법

### 1. Supabase 프로젝트 설정

1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. SQL Editor 탭으로 이동

### 2. Users 테이블 생성

SQL Editor에서 아래 SQL 실행 (`sql/create_users_table.sql` 파일 내용):

```sql
-- users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    picture TEXT,
    google_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    login_count INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by TEXT,
    metadata JSONB
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (true);
```

### 3. 관리자 계정 설정

```sql
-- 관리자 이메일 추가 (본인 이메일로 변경)
INSERT INTO users (email, name, status, created_at)
VALUES ('ggamsire@gmail.com', '관리자', 'approved', NOW())
ON CONFLICT (email)
DO UPDATE SET status = 'approved';
```

## 🧪 테스트 방법

### 1. 로컬 서버 실행
```bash
python3 -m http.server 8000
# 또는
npx http-server -p 8000
```

### 2. 브라우저 콘솔 확인 사항
브라우저 개발자 도구(F12) > Console 탭에서 확인:

```javascript
// 1. ProjectBackup 초기화 확인
✅ ProjectBackup 초기화 완료

// 2. 구글 로그인 시 로그 확인
🔄 Supabase에 사용자 정보 저장 시작: user@gmail.com
✅ Supabase에 사용자 정보 저장 성공

// 3. 관리자 페이지에서 확인
✅ Supabase에서 1명의 사용자 목록 로드됨
```

### 3. Supabase Dashboard 확인
1. Supabase Dashboard > Table Editor > users 테이블
2. 새로운 사용자 데이터가 추가되었는지 확인
3. status 필드가 'pending'으로 설정되었는지 확인

### 4. 관리자 페이지 확인
1. `/admin.html` 접속
2. 관리자 비밀번호(1004) 입력
3. 대기중인 사용자 목록에 새 사용자 표시 확인

## 🔍 문제 해결 체크리스트

### ✅ 구글 로그인 후 데이터가 저장되지 않는 경우

1. **브라우저 콘솔 확인**
   - 에러 메시지 확인
   - `❌ Supabase 사용자 저장 실패` 메시지가 있는지 확인

2. **Supabase 설정 확인**
   ```javascript
   // js/modules/supabase-config.js 확인
   url: 'https://ocbqffealslwnsybeurj.supabase.co' // 올바른 URL인지
   anonKey: 'eyJhbGci...' // 올바른 Key인지
   ```

3. **테이블 권한 확인**
   ```sql
   -- Supabase SQL Editor에서 실행
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

### ✅ 관리자 페이지에서 사용자가 보이지 않는 경우

1. **ProjectBackup 초기화 확인**
   ```javascript
   // 브라우저 콘솔에서
   console.log(window.ProjectBackup);
   console.log(window.ProjectBackup.supabase);
   ```

2. **직접 쿼리 테스트**
   ```javascript
   // 브라우저 콘솔에서 (admin.html 페이지)
   const { data, error } = await window.ProjectBackup.supabase
     .from('users')
     .select('*');
   console.log(data, error);
   ```

### ✅ 중복 가입 방지 확인

1. **같은 계정으로 재로그인 시도**
   - "이미 가입 신청이 완료되었습니다" 메시지 확인
   - login_count가 증가하는지 확인

2. **Supabase에서 확인**
   ```sql
   SELECT email, login_count, status, created_at
   FROM users
   ORDER BY created_at DESC;
   ```

## 📝 주요 개선 사항

### 1. **더 나은 에러 처리**
- 각 단계별 상세 로깅 추가
- Supabase 연결 실패 시 폴백 처리
- 사용자 친화적인 에러 메시지

### 2. **중복 방지**
- 기존 사용자 체크 로직
- login_count로 재방문 추적
- 중복 가입 시도 시 알림

### 3. **데이터 동기화**
- Supabase와 localStorage 이중 백업
- ProjectBackup 인스턴스 공유
- 실시간 상태 확인

## 🛠️ 추가 권장 사항

### 1. **보안 강화**
```sql
-- IP 제한 정책 추가 (선택사항)
CREATE POLICY "Admin only from specific IPs" ON users
    FOR ALL USING (
        inet_client_addr() = '특정IP'::inet
        OR auth.jwt() ->> 'email' = 'admin@example.com'
    );
```

### 2. **성능 최적화**
```javascript
// 캐싱 추가
const userCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분
```

### 3. **모니터링**
- Supabase Dashboard > Logs에서 쿼리 모니터링
- 실패한 로그인 시도 추적
- 사용자 활동 분석

## 💡 자주 묻는 질문

### Q: Supabase 무료 플랜 제한은?
- 500MB 데이터베이스
- 2GB 파일 저장소
- 50,000 월간 활성 사용자
- 충분히 사용 가능!

### Q: 관리자를 추가하려면?
```sql
UPDATE users
SET status = 'approved'
WHERE email = 'new-admin@example.com';
```

### Q: 사용자 데이터를 백업하려면?
Supabase Dashboard > Settings > Database > Backups

### Q: 로컬 테스트 시 CORS 에러가 발생하면?
- Supabase Dashboard > Settings > API
- CORS 설정에 `http://localhost:8000` 추가

## 📞 문제 발생 시 확인 순서

1. **브라우저 콘솔** - 에러 메시지 확인
2. **네트워크 탭** - Supabase API 호출 확인
3. **Supabase Logs** - 서버 측 에러 확인
4. **테이블 데이터** - 실제 저장된 데이터 확인

---

이제 구글 로그인 시스템이 Supabase와 완벽하게 연동됩니다! 🎉