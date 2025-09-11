# 📋 app.js 리팩토링 계획

## 현재 상태 분석
- **파일 크기**: 9,257줄 (너무 큼!)
- **주요 기능 영역**: 약 150+ 개 함수
- **전역 변수**: 8개
- **의존성**: localStorage, DOM 조작, 외부 HTML 연동

## 🎯 리팩토링 목표
1. **안전성 최우선** - 기존 기능 100% 유지
2. **점진적 모듈화** - 한 번에 하나씩
3. **명확한 책임 분리** - 각 모듈의 역할 명확화
4. **테스트 가능성** - 독립적인 모듈 테스트

## 📦 제안하는 모듈 구조

```
storyboard/js/
├── app.js (메인 - 축소)
├── modules/
│   ├── core/
│   │   ├── config.js         # 전역 설정, 상수
│   │   ├── state.js          # 전역 상태 관리
│   │   └── utils.js          # 유틸리티 함수들
│   ├── data/
│   │   ├── storage.js        # localStorage 관리
│   │   ├── import-export.js  # JSON 가져오기/내보내기
│   │   └── migration.js      # 데이터 마이그레이션
│   ├── ui/
│   │   ├── navigation.js     # 네비게이션 관리
│   │   ├── shot-details.js   # 샷 상세 UI
│   │   ├── tabs.js           # 탭 관리
│   │   └── modals.js         # 모달 관리
│   ├── image/
│   │   ├── image-manager.js  # 이미지 관리
│   │   ├── url-converter.js  # URL 변환 (Dropbox 등)
│   │   └── cache.js          # 이미지 캐시
│   ├── prompt/
│   │   ├── prompt-editor.js  # 프롬프트 편집
│   │   └── prompt-generator.js # 프롬프트 생성
│   └── stage/
│       ├── stage-manager.js  # 스테이지 관리
│       └── stage-converters.js # 스테이지 변환
└── app-init.js              # 초기화 로직
```

## 🔄 리팩토링 단계

### Phase 1: 기초 모듈 (위험도 낮음) ✅
1. **유틸리티 함수 분리**
   - `escapeHtmlAttribute()`
   - `copyToClipboard()`
   - `showMessage()`
   - 기타 순수 함수들

2. **설정 및 상수 분리**
   - `IMAGE_AI_TOOLS`
   - 기본 설정값들
   - URL 패턴

### Phase 2: 데이터 관리 (위험도 중간)
3. **Storage 모듈**
   - `saveDataToLocalStorage()`
   - `loadDataFromLocalStorage()`
   - 캐시 관리

4. **Import/Export 모듈**
   - JSON 가져오기
   - JSON 내보내기
   - 스테이지 데이터 변환

### Phase 3: UI 컴포넌트 (위험도 중간)
5. **Navigation 모듈**
   - 시퀀스/씬/샷 네비게이션
   - 브레드크럼

6. **Tab 관리**
   - 탭 생성 및 전환
   - 탭 콘텐츠 관리

### Phase 4: 기능별 모듈 (위험도 높음)
7. **이미지 관리**
   - URL 변환
   - 캐시 관리
   - 미리보기

8. **프롬프트 시스템**
   - 편집기
   - 생성기

## ⚠️ 주의사항

### 연동 부분 체크리스트
- [ ] HTML의 onclick 핸들러들
- [ ] localStorage 키 이름들
- [ ] 전역 변수 참조
- [ ] DOM ID 의존성
- [ ] 다른 JS 파일과의 연동

### 테스트 방법
1. 각 모듈 분리 후 즉시 테스트
2. 브라우저 콘솔에서 기능 확인
3. localStorage 데이터 무결성 체크
4. UI 상호작용 테스트

## 🚀 시작하기

Phase 1부터 시작하여 안전하게 진행합니다. 각 단계마다:
1. 백업 생성
2. 모듈 분리
3. import/export 설정
4. 테스트
5. 다음 단계 진행

## 예상 결과
- **코드 가독성**: 대폭 향상
- **유지보수성**: 모듈별 관리 가능
- **테스트 용이성**: 단위 테스트 가능
- **성능**: 동일 또는 약간 향상 (모듈 로딩 최적화)
- **확장성**: 새 기능 추가 용이