# AIFI 프로젝트 문제 진단 및 해결 보고서

## 1. 발견된 주요 문제점

### 1.1 파일 구조 문제
- **중복 파일**: 백업 폴더에 원본 파일들이 그대로 남아있음
- **폰트 파일 중복**: 3곳에 동일한 폰트 파일이 존재
  - `/fonts/`
  - `/storyboard/assets/fonts/`
  - `/backup/storyboard/assets/fonts/`

### 1.2 URL 경로 문제
- `storyboard/index.html`의 홈 버튼: `../index.html` (정상)
- `your_title_storyboard_dark.html`의 컨셉아트 버튼: 상대 경로 사용 (정상)
- `storyboard/js/app.js`의 컨셉아트 버튼: `../your_title_storyboard_v9.4_c.html` (정상)

### 1.3 업로드 및 페이지 이동 문제
- 업로드 알림이 표시된 후 "닫기" 버튼을 클릭해야 페이지 이동
- 알림창이 화면을 가리는 문제

### 1.4 리소스 경로 문제
- CSS/JS 파일 참조 경로가 리팩토링 후 맞지 않을 가능성

## 2. 해결 방안

### 2.1 즉시 수정 필요
1. 업로드 알림 자동 닫기 기능 추가
2. 리소스 경로 검증 및 수정
3. 중복 파일 정리

### 2.2 구조 개선
1. 백업 폴더를 별도 위치로 이동
2. 폰트 파일을 한 곳으로 통합
3. 명확한 디렉토리 구조 확립

## 3. 수정 완료 사항

### 3.1 업로드 알림 자동 닫기 (✓ 완료)
- `script.js`의 `showUploadNotification` 함수 수정
- 업로드 완료 3초 후 자동으로 페이지 이동
- 사용자가 수동으로 닫기 버튼을 누르지 않아도 됨

### 3.2 페이지 간 이동 경로 (✓ 확인됨)
- 홈 버튼: 모든 페이지에서 정상 작동
- 컨셉아트 버튼: 경로 수정 완료
- 스테이지별 업로드 후 이동: 정상 작동

### 3.3 리소스 경로 (✓ 확인됨)
- CSS/JS 파일: 모두 올바른 경로로 참조됨
- 폰트 파일: 상대 경로로 정상 참조됨

### 3.4 파일 정리 (✓ 완료)
- `_archive/` 디렉토리 생성
- 백업 폴더 이동 완료
- 테스트 파일 이동 완료

## 4. 현재 프로젝트 구조

```
/Users/sohee/Downloads/run/dev/ai/
├── index.html (메인 대시보드)
├── script.js (메인 JavaScript)
├── styles-dark.css (다크 테마 스타일)
├── design-system.css (디자인 시스템)
├── fonts/ (공통 폰트 파일)
├── storyboard/ (스토리보드 앱)
│   ├── index.html
│   ├── css/main.css
│   ├── js/app.js
│   └── assets/fonts/
├── your_title_storyboard_v9.4_c.html (컨셉아트 앱)
├── your_title_storyboard_dark.html (원본 스토리보드)
└── _archive/ (보관된 파일들)