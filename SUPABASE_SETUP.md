# Supabase 프로젝트 설정 가이드

## 1. Supabase 프로젝트 생성

### Step 1: 계정 생성 및 프로젝트 생성
1. [supabase.com](https://supabase.com) 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭
4. 프로젝트 정보 입력:
   - Organization: 개인 또는 팀 선택
   - Project name: `aifi-dashboard`
   - Database Password: 강력한 비밀번호 설정 (저장 필수!)
   - Region: `Northeast Asia (Seoul)` 또는 `Northeast Asia (Tokyo)`
   - Pricing Plan: Free tier (시작용)

### Step 2: 프로젝트 설정 확인
프로젝트 생성 후 Settings > API에서 다음 정보 확인:
- Project URL: `https://[PROJECT_ID].supabase.co`
- Anon/Public Key: `eyJ...` (공개 가능)
- Service Role Key: `eyJ...` (비밀 유지!)

## 2. Google OAuth 설정

### Step 1: Supabase Authentication 설정
1. Authentication > Providers 이동
2. Google 활성화
3. Google OAuth 설정:
   - Authorized Client IDs에 기존 Google Client ID 입력:
     ```
     325933740145-8ubka8q1fobrdv8hf5t196btkog8fnas.apps.googleusercontent.com
     ```

### Step 2: Google Console 리디렉션 URI 추가
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 기존 OAuth 2.0 클라이언트 수정
3. 승인된 리디렉션 URI 추가:
   ```
   https://[PROJECT_ID].supabase.co/auth/v1/callback
   ```

## 3. 데이터베이스 설정

SQL Editor에서 아래 schema.sql 파일 실행

## 4. Storage 버킷 생성

### Storage 설정
1. Storage > Create Bucket
2. 버킷 생성:
   - Name: `project-files`
   - Public: false (RLS로 제어)

## 5. Row Level Security 활성화

SQL Editor에서 RLS 정책 실행 (schema.sql에 포함)

## 6. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:
```env
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

⚠️ **중요**: Service Role Key는 클라이언트 사이드에서 사용하지 않음!

## 7. 테스트

1. 브라우저에서 `https://[PROJECT_ID].supabase.co` 접속
2. Supabase Dashboard 확인
3. Table Editor에서 테이블 생성 확인

## 다음 단계

- [ ] supabase-config.js 설정
- [ ] 클라이언트 모듈 초기화
- [ ] 대시보드 페이지 구현