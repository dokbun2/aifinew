# 🚀 Supabase 빠른 시작 가이드

## 1. Supabase 프로젝트 생성 (5분)

### 브라우저에서:
1. **[supabase.com](https://supabase.com)** 접속
2. **"Start your project"** 클릭
3. **GitHub 계정으로 로그인**
4. **"New Project"** 클릭

### 프로젝트 설정:
```
Organization: Personal (또는 팀 선택)
Project name: aifi-dashboard
Database Password: [강력한 비밀번호 입력]
Region: Northeast Asia (Seoul)
Pricing Plan: Free
```

> ⚠️ **중요**: Database Password를 안전한 곳에 저장하세요!

## 2. API 키 확인 (1분)

프로젝트 생성 완료 후:

1. **Settings** (왼쪽 메뉴) 클릭
2. **API** 섹션 이동
3. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJI...` (긴 문자열)

## 3. 프로젝트 설정 업데이트 (2분)

### supabase-config.js 수정:
```javascript
// js/modules/supabase-config.js
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co',  // 여기에 Project URL 붙여넣기
    anonKey: 'eyJhbGciOiJI...',        // 여기에 anon key 붙여넣기
    // ... 나머지는 그대로
};
```

## 4. 데이터베이스 설정 (3분)

### Supabase Dashboard에서:
1. **SQL Editor** (왼쪽 메뉴) 클릭
2. **New query** 클릭
3. `database/schema.sql` 파일 내용 전체 복사
4. SQL Editor에 붙여넣기
5. **RUN** 버튼 클릭 (우측 하단)

✅ "Success. No rows returned" 메시지 확인

## 5. Google OAuth 설정 (3분)

### Supabase Dashboard:
1. **Authentication** (왼쪽 메뉴) 클릭
2. **Providers** 탭 선택
3. **Google** 찾아서 클릭
4. **Enable Google** 토글 ON
5. **Authorized Client IDs**에 입력:
   ```
   325933740145-8ubka8q1fobrdv8hf5t196btkog8fnas.apps.googleusercontent.com
   ```
6. **Save** 클릭

### Google Cloud Console:
1. [console.cloud.google.com](https://console.cloud.google.com) 접속
2. 기존 OAuth 2.0 클라이언트 ID 수정
3. **승인된 리디렉션 URI** 추가:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
   (xxxxx는 실제 프로젝트 ID로 교체)
4. **저장**

## 6. Storage 버킷 생성 (2분)

### Supabase Dashboard:
1. **Storage** (왼쪽 메뉴) 클릭
2. **New bucket** 클릭
3. 설정:
   ```
   Name: project-files
   Public bucket: OFF (체크 해제)
   ```
4. **Create bucket** 클릭

## 7. 테스트 (1분)

### 로컬에서:
```bash
# 개발 서버 시작
python3 -m http.server 8000

# 브라우저 열기
open http://localhost:8000/dashboard.html
```

### 확인 사항:
- [ ] 대시보드 페이지 로드
- [ ] Google 로그인 버튼 표시
- [ ] 콘솔에 에러 없음

## 🎉 완료!

이제 Supabase가 연결되었습니다.

### 다음 단계:
1. Google 로그인 테스트
2. 프로젝트 생성 테스트
3. 데이터 저장/불러오기 확인

## 문제 해결

### "Supabase URL not configured" 에러
→ `supabase-config.js`에 실제 URL과 키를 입력했는지 확인

### Google 로그인 실패
→ Google Console에서 리디렉션 URI를 정확히 추가했는지 확인

### 테이블이 없다는 에러
→ SQL Editor에서 schema.sql을 다시 실행

---

**도움이 필요하면 언제든 물어보세요!**