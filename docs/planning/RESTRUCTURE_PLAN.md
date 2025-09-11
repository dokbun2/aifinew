# 🏗️ AIFI 프로젝트 구조 개선 계획

## 현재 문제점

### 1. 파일 구조 문제
- ❌ 모든 HTML 파일이 루트에 흩어져 있음
- ❌ CSS 파일들이 중복되고 의존성이 복잡함
- ❌ 백업 파일들이 여러 곳에 분산되어 있음
- ❌ 섹션별 파일 구분이 불명확함

### 2. CSS 의존성 문제
- ❌ 5개의 CSS 파일이 비슷한 스타일 중복 정의
- ❌ concept-art-styles-unified.css가 modern.css를 불필요하게 import
- ❌ styles.css (41KB)의 용도가 불분명
- ❌ 각 섹션이 서로 다른 CSS 조합을 사용

## 제안하는 새로운 구조

```
airenew/
│
├── index.html                     # 메인 대시보드
├── netlify.toml                   # 배포 설정
├── _redirects                     # URL 리디렉션
│
├── assets/                        # 🆕 공통 자원
│   ├── css/
│   │   ├── core.css              # 🆕 통합 코어 스타일 (변수, 폰트, 리셋)
│   │   └── components.css        # 🆕 재사용 컴포넌트 스타일
│   ├── js/
│   │   ├── common.js             # 🆕 공통 유틸리티 함수
│   │   └── video-player.js       # simple_video_player.js 이동
│   ├── fonts/                    # 폰트 파일들
│   │   └── Paperlogy-*.woff
│   └── images/
│       └── og-image.jpg
│
├── dashboard/                     # 🆕 메인 대시보드 섹션
│   ├── dashboard.css             # 대시보드 전용 스타일
│   └── dashboard.js              # script.js 이동
│
├── storyboard/                    # ✅ 기존 유지 (이미 잘 구성됨)
│   ├── index.html
│   ├── css/
│   │   └── main.css
│   └── js/
│       └── app.js
│
├── concept-art/                   # 🆕 컨셉아트 통합 섹션
│   ├── index.html                # your_title_storyboard_v9.4_c.html 이동
│   ├── gallery.html              # concept-art-gallery.html 이동
│   ├── concept-art.css          # 🆕 컨셉아트 전용 통합 스타일
│   └── js/
│       ├── gallery.js            # concept-art-gallery.js 이동
│       └── bundle.js             # concept-art-bundle.js 이동
│
├── media-gallery/                 # 🆕 미디어 갤러리 섹션
│   ├── index.html                # media-gallery.html 이동
│   └── media-gallery.css        # 🆕 미디어 갤러리 전용 스타일
│
├── prompt-generator/              # 🆕 프롬프트 생성기 섹션
│   ├── index.html                # image_prompt_generator.html 이동
│   └── prompt-generator.css     # 🆕 프롬프트 생성기 전용 스타일
│
└── _archive/                      # 🆕 모든 백업 통합
    ├── backups/                  # 기존 백업 파일들
    ├── old-versions/             # 이전 버전들
    └── deprecated/               # 사용하지 않는 파일들
```

## CSS 통합 계획

### 1단계: 코어 CSS 생성 (core.css)
- CSS 변수 (--primary-gradient, --bg-primary 등)
- 폰트 정의 (@font-face)
- 리셋 스타일
- 기본 타이포그래피

### 2단계: 컴포넌트 CSS 생성 (components.css)
- 버튼 스타일
- 카드 레이아웃
- 모달/팝업
- 헤더/네비게이션
- 폼 요소

### 3단계: 섹션별 CSS 최적화
- 각 섹션 고유 스타일만 포함
- core.css와 components.css 임포트
- 중복 제거

## 리팩토링 실행 계획

### Phase 1: 폴더 구조 생성 (안전)
```bash
# 새 폴더 구조 생성
mkdir -p assets/{css,js,images}
mkdir -p dashboard
mkdir -p concept-art/js
mkdir -p media-gallery
mkdir -p prompt-generator
mkdir -p _archive/{backups,old-versions,deprecated}
```

### Phase 2: CSS 통합 (중요)
1. design-system.css의 변수들을 core.css로 통합
2. 공통 컴포넌트를 components.css로 분리
3. 각 섹션 CSS에서 중복 제거

### Phase 3: 파일 이동 (주의)
1. 각 HTML 파일을 해당 섹션 폴더로 이동
2. CSS/JS 링크 경로 업데이트
3. 테스트 및 검증

### Phase 4: 백업 정리 (안전)
1. backup/ 폴더를 _archive/backups/로 통합
2. archive/ 폴더를 _archive/old-versions/로 통합
3. 사용하지 않는 파일을 _archive/deprecated/로 이동

## 예상 효과

### 장점
✅ **구조 명확성**: 각 섹션이 독립적인 폴더로 구성
✅ **유지보수성**: 섹션별 파일 관리 용이
✅ **성능 개선**: CSS 중복 제거로 파일 크기 감소
✅ **확장성**: 새로운 섹션 추가 용이
✅ **백업 관리**: 모든 백업이 한 곳에 정리

### 위험 요소 및 대응
⚠️ **경로 변경**: 모든 링크 업데이트 필요 → 자동화 스크립트 작성
⚠️ **CSS 통합**: 스타일 충돌 가능성 → 단계적 통합 및 테스트
⚠️ **배포 영향**: Netlify 설정 확인 필요 → _redirects 파일 업데이트

## 실행 우선순위

1. **즉시 실행 가능** (위험도 낮음)
   - 폴더 구조 생성
   - 백업 파일 통합
   
2. **신중한 실행 필요** (위험도 중간)
   - CSS 파일 통합
   - 섹션별 CSS 분리
   
3. **단계적 실행** (위험도 높음)
   - HTML 파일 이동
   - 경로 업데이트
   - 최종 테스트

## 다음 단계

1. 이 계획 검토 및 승인
2. Phase 1 실행 (폴더 구조 생성)
3. 각 Phase별 상세 실행
4. 각 단계 후 테스트
5. 최종 검증 및 배포

---

작성일: 2025년 1월 20일
작성자: Claude Code Assistant