# 🧹 AIFI 프로젝트 정리 계획

## 📊 현재 상태 분석

### 발견된 문제점
1. **_unused 디렉토리**: 약 100+ 개의 백업/임시 파일 존재
2. **중복 폰트 파일**: `/fonts`와 `/assets/fonts`에 동일한 파일 존재  
3. **테스트 파일들**: 루트에 여러 test-*.js, test-*.html 파일
4. **빈 디렉토리**: `/css`, `/dashboard`, `/docs/guides` 등
5. **중복/오래된 파일**: 여러 백업 및 legacy 파일들

## 🎯 정리 대상

### 1단계: 안전한 정리 (Safe Cleanup)
- [x] `_unused` 디렉토리 전체 제거
- [ ] 빈 디렉토리 제거 (`/css`, `/dashboard`, `/docs/guides`)
- [ ] 테스트 파일 정리
  - `test-backup-integrity.js`
  - `test-gallery-fix.js`
  - `test-storyboard-fix.html`
  - `test-universal-images.json`
  - `storyboard/test-image-fix.js`

### 2단계: 구조 최적화
- [ ] 중복 폰트 제거 (assets/fonts 유지, /fonts 제거)
- [ ] 중복 HTML 파일 정리
  - `media-gallery-apple.html` (media-gallery/index.html과 중복)
  - `prompt-builder.html` (prompt-generator/index.html과 유사)
  - `video-prompt-builder.html`, `video-prompt-builder1.html` 통합

### 3단계: 파일 구조 개선
```
/
├── index.html                 # 메인 대시보드
├── storyboard/                # 스토리보드 앱
├── concept-art/               # 컨셉아트 앱  
├── media-gallery/             # 미디어 갤러리
├── prompt-generator/          # 프롬프트 생성기
├── assets/                    # 공통 리소스
│   ├── css/
│   ├── fonts/
│   ├── images/
│   └── js/
├── favicon_io/                # 파비콘
├── docs/                      # 문서
└── netlify.toml              # 배포 설정
```

## ⚠️ 주의사항
- localStorage 데이터 호환성 유지
- 현재 배포된 버전과의 호환성 확인
- 모든 변경사항은 백업 후 진행

## 예상 결과
- 프로젝트 크기: ~50% 감소 예상
- 파일 구조: 더 명확하고 유지보수 용이
- 성능: 불필요한 리소스 제거로 로딩 속도 개선