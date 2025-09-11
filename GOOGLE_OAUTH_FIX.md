# Google OAuth 로그인 버튼 문제 해결 가이드

## 🚨 문제
Netlify에 배포된 사이트에서 Google 로그인 버튼이 표시되지 않음

## ✅ 해결 방법

### 1. Google Cloud Console에서 도메인 추가 (필수!)

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 선택 (AIFICUT 또는 현재 프로젝트)
3. **API 및 서비스** → **사용자 인증 정보** 클릭
4. OAuth 2.0 클라이언트 ID 클릭 (웹 애플리케이션)
5. **승인된 JavaScript 출처**에 다음 추가:
   ```
   https://aifimulty.netlify.app
   https://aifiwb.netlify.app
   https://aifinew.netlify.app
   ```

6. **승인된 리디렉션 URI**에 다음 추가:
   ```
   https://aifimulty.netlify.app/auth/google/callback
   https://aifiwb.netlify.app/auth/google/callback
   https://aifinew.netlify.app/auth/google/callback
   ```

7. **저장** 클릭

### 2. 브라우저에서 확인할 사항

1. **개발자 도구 열기** (F12)
2. **Console** 탭에서 다음 메시지 확인:
   - `🔄 Initializing Google Auth...`
   - `Current domain: [도메인 이름]`
   - `✅ Google Auth initialized successfully` 또는 에러 메시지

### 3. 일반적인 에러와 해결방법

#### "idpiframe_initialization_failed" 에러
- **원인**: 도메인이 Google Console에 등록되지 않음
- **해결**: 위의 1번 단계 실행

#### "The given origin is not allowed for the given client ID"
- **원인**: 현재 도메인이 승인된 출처에 없음
- **해결**: Google Console에서 현재 사이트 도메인 추가

#### 버튼이 전혀 나타나지 않음
- **원인**: Google 라이브러리 로드 실패
- **해결**: 
  1. 네트워크 연결 확인
  2. 광고 차단기 비활성화
  3. 브라우저 캐시 삭제 (Ctrl+Shift+R)

### 4. 코드 수정 사항 (이미 적용됨)

- ✅ `auth.js`: 초기화 로직 개선
- ✅ 디버깅 로그 추가
- ✅ 버튼 렌더링 재시도 로직 추가

### 5. 테스트 방법

1. 브라우저 캐시 삭제
2. 시크릿 모드에서 사이트 접속
3. 콘솔 로그 확인
4. 로그인 버튼 표시 확인

### 6. 추가 도메인 설정이 필요한 경우

새로운 Netlify 도메인을 추가하려면:
1. Netlify Dashboard에서 사이트 URL 확인
2. Google Console에서 해당 URL을 승인된 출처에 추가
3. 변경사항 저장 (반영까지 5-10분 소요)

## 💡 중요 참고사항

- Google Console 변경사항은 즉시 반영되지 않을 수 있음 (5-10분 대기)
- HTTPS 프로토콜 필수 (HTTP는 작동 안 함)
- 로컬 테스트는 `http://localhost:8000` 사용
- 프로덕션은 반드시 HTTPS 도메인 사용

## 📞 문제가 지속되면

1. 브라우저 콘솔의 전체 에러 메시지 확인
2. Network 탭에서 Google API 요청 상태 확인
3. Client ID가 올바른지 확인