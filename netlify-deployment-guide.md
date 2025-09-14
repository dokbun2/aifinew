# 🚀 Netlify 배포 가이드 - AIFI 프로젝트

## ⚠️ 중요 보안 체크리스트

### 1. **환경 변수 설정 (필수!)**

Netlify에서 환경 변수를 설정해야 합니다:

1. Netlify 대시보드 → Site settings → Environment variables
2. 다음 변수들 추가:

```env
# Supabase 설정
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth (index.html의 Client ID도 수정 필요)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 2. **supabase-config.js 파일 생성**

⚠️ **중요**: 이 파일은 `.gitignore`에 포함되어 있어 GitHub에 업로드되지 않습니다.

Netlify 빌드 과정에서 자동 생성하려면:

#### 방법 1: netlify.toml 사용 (권장)

`netlify.toml` 파일 생성:
```toml
[build]
  command = "echo 'export const SUPABASE_CONFIG = { url: \"'$VITE_SUPABASE_URL'\", anonKey: \"'$VITE_SUPABASE_ANON_KEY'\" };' > js/modules/supabase-config.js"
  publish = "."

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

#### 방법 2: 수동으로 파일 생성

`js/modules/supabase-config.js`:
```javascript
// ⚠️ 이 파일은 .gitignore에 포함되어야 합니다!
export const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key'
};
```

### 3. **Google OAuth 설정 업데이트**

Google Cloud Console에서:
1. OAuth 2.0 클라이언트 ID 수정
2. 승인된 JavaScript 출처에 추가:
   - `https://aifinew.netlify.app`
3. 승인된 리디렉션 URI에 추가:
   - `https://aifinew.netlify.app/auth/google/callback`

### 4. **Supabase CORS 설정**

Supabase 대시보드에서:
1. Authentication → URL Configuration
2. Site URL: `https://aifinew.netlify.app`
3. Redirect URLs에 추가:
   - `https://aifinew.netlify.app`
   - `https://aifinew.netlify.app/*`

### 5. **RLS (Row Level Security) 활성화**

프로덕션 배포 전 필수:

```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE project_backups ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (사용자 본인 데이터만 접근)
CREATE POLICY "Users can manage own backups"
ON project_backups
FOR ALL
USING (user_email = current_setting('request.jwt.claims')::json->>'email'
    OR user_id = current_setting('request.jwt.claims')::json->>'email');
```

## 🔒 보안 체크리스트

### ✅ 반드시 확인할 사항:

- [ ] `supabase-config.js`가 `.gitignore`에 포함되어 있는가?
- [ ] GitHub 저장소에 민감한 정보가 없는가?
- [ ] Netlify 환경 변수가 설정되어 있는가?
- [ ] Google OAuth 클라이언트 ID가 프로덕션용으로 업데이트되었는가?
- [ ] Supabase RLS가 활성화되어 있는가?
- [ ] HTTPS가 강제되고 있는가? (Netlify는 자동)
- [ ] CORS 설정이 올바른가?

### ⚠️ 주의사항:

1. **localStorage 제한사항**
   - 각 도메인별로 독립적
   - `localhost`의 데이터는 `netlify.app`에서 접근 불가
   - 첫 배포 후 사용자는 다시 로그인 필요

2. **인증 토큰 관리**
   - Google OAuth 토큰은 클라이언트에서만 처리
   - Supabase는 anon key 사용 (공개 가능)
   - 민감한 작업은 서버 함수 사용 권장

3. **데이터 마이그레이션**
   - 로컬 개발 데이터는 수동으로 이전 필요
   - Supabase 대시보드에서 직접 관리

## 📝 배포 전 최종 체크

```bash
# 1. 민감한 정보 확인
grep -r "supabase" . --exclude-dir=node_modules
grep -r "SUPABASE" . --exclude-dir=node_modules

# 2. .gitignore 확인
cat .gitignore | grep supabase-config

# 3. 테스트
# - Google 로그인 작동 확인
# - 프로젝트 저장/불러오기 확인
# - 콘솔 에러 확인
```

## 🚨 긴급 대응

문제 발생 시:

1. **인증 실패**: Google Console과 Netlify URL 확인
2. **Supabase 연결 실패**: 환경 변수 및 CORS 확인
3. **데이터 저장 실패**: RLS 정책 및 테이블 권한 확인

## 📧 지원

문제가 지속되면:
- Supabase 대시보드 로그 확인
- Netlify 빌드 로그 확인
- 브라우저 개발자 도구 Network 탭 확인