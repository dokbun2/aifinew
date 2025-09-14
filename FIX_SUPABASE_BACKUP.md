# 🔧 Supabase 백업 문제 해결 가이드

## 문제 진단
1. **`user_id` 컬럼 누락**: `project_backups` 테이블에 `user_id` 컬럼이 없음
2. **RLS 정책 문제**: Row Level Security가 제대로 설정되지 않아 인증 오류 발생
3. **Google Auth 통합 문제**: 인증 토큰이 Supabase와 제대로 연동되지 않음

## 해결 방법

### 1단계: Supabase 테이블 스키마 수정

1. **Supabase Dashboard 접속**
   - https://app.supabase.com 로그인
   - 프로젝트 선택

2. **SQL Editor에서 스키마 실행**
   ```sql
   -- 기존 테이블 백업 (선택사항)
   CREATE TABLE project_backups_old AS SELECT * FROM project_backups;

   -- 테이블 재생성
   DROP TABLE IF EXISTS project_backups CASCADE;

   -- 새 스키마로 테이블 생성
   -- (supabase_schema.sql 파일 내용 실행)
   ```

3. **또는 간단히 컬럼만 추가**
   ```sql
   -- user_id 컬럼이 없다면 추가
   ALTER TABLE project_backups
   ADD COLUMN IF NOT EXISTS user_id TEXT;

   -- user_id를 user_email과 동일하게 업데이트
   UPDATE project_backups
   SET user_id = user_email
   WHERE user_id IS NULL;

   -- NOT NULL 제약 추가
   ALTER TABLE project_backups
   ALTER COLUMN user_id SET NOT NULL;
   ```

### 2단계: RLS (Row Level Security) 정책 수정

**Anonymous 사용자를 위한 정책 추가** (Google OAuth 없이도 작동):

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own backups" ON project_backups;
DROP POLICY IF EXISTS "Users can create own backups" ON project_backups;
DROP POLICY IF EXISTS "Users can update own backups" ON project_backups;

-- 새 정책 생성 (더 유연한 방식)
CREATE POLICY "Enable read for users based on email" ON project_backups
    FOR SELECT USING (
        user_email = current_setting('request.jwt.claim.email', true)
        OR user_email = current_setting('request.jwt.claims.email', true)
        OR true -- 임시로 모든 사용자 허용 (개발 중)
    );

CREATE POLICY "Enable insert for authenticated users" ON project_backups
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for users based on email" ON project_backups
    FOR UPDATE USING (
        user_email = current_setting('request.jwt.claim.email', true)
        OR user_email = current_setting('request.jwt.claims.email', true)
        OR true -- 임시로 모든 사용자 허용 (개발 중)
    );
```

### 3단계: 프론트엔드 코드 수정

**project-backup.js 파일 수정 위치**:

```javascript
// 라인 121: user_id 필드 확인
const backupData = {
    user_id: user.email, // ✅ 이미 올바르게 설정됨
    user_email: user.email,
    // ... 나머지 필드들
};
```

### 4단계: 임시 해결책 (빠른 테스트용)

Supabase Dashboard에서:

1. **Authentication → Policies**
2. `project_backups` 테이블 선택
3. **"RLS 비활성화"** 선택 (개발 중에만!)
   ```sql
   ALTER TABLE project_backups DISABLE ROW LEVEL SECURITY;
   ```

4. 테스트 후 다시 활성화:
   ```sql
   ALTER TABLE project_backups ENABLE ROW LEVEL SECURITY;
   ```

### 5단계: 디버깅 및 모니터링

1. **Supabase Logs 확인**
   - Dashboard → Logs → API
   - 실패한 요청 확인

2. **브라우저 콘솔에서 테스트**
   ```javascript
   // Supabase 연결 테스트
   const testBackup = async () => {
       const user = JSON.parse(localStorage.getItem('user_info'));
       console.log('Current user:', user);

       // 간단한 데이터로 테스트
       const testData = {
           user_id: user.email,
           user_email: user.email,
           user_name: user.name,
           project_name: 'Test_' + Date.now(),
           backup_data: { test: true },
           project_type: 'movie'
       };

       const { data, error } = await window.projectBackup.supabase
           .from('project_backups')
           .insert([testData])
           .select();

       console.log('Result:', { data, error });
   };

   testBackup();
   ```

## 확인 사항

### ✅ 체크리스트
- [ ] Supabase에 `project_backups` 테이블이 있는가?
- [ ] `user_id` 컬럼이 존재하는가?
- [ ] RLS 정책이 올바르게 설정되었는가?
- [ ] Google 로그인이 정상 작동하는가?
- [ ] localStorage에 `user_info`가 저장되어 있는가?

### 🔍 디버깅 명령어

```javascript
// 콘솔에서 실행
console.log('User info:', localStorage.getItem('user_info'));
console.log('Supabase config:', window.projectBackup?.supabase);
console.log('Auth token:', localStorage.getItem('auth_token'));
```

## 최종 해결책

만약 위 방법들이 모두 실패한다면:

1. **새 테이블 생성**
   ```sql
   CREATE TABLE project_saves (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       email TEXT NOT NULL,
       name TEXT,
       project_data JSONB NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 인덱스
   CREATE INDEX idx_project_saves_email ON project_saves(email);

   -- RLS 비활성화 (개발용)
   ALTER TABLE project_saves DISABLE ROW LEVEL SECURITY;
   ```

2. **코드에서 새 테이블 사용**
   ```javascript
   // project-backup.js 수정
   const { data, error } = await this.supabase
       .from('project_saves') // 'project_backups' 대신
       .upsert({
           email: user.email,
           name: projectName,
           project_data: projectData.data
       });
   ```

이 가이드를 따라하시면 백업 문제가 해결될 것입니다!