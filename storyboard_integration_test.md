# 스토리보드 통합 테스트 체크리스트

## 완료된 작업

### 1. 파일 구조 리팩토링 ✅
- `your_title_storyboard_dark.html` (8,045줄) → 모듈화된 구조로 분리
- 새로운 위치: `/storyboard/`
  - `index.html` - HTML 구조
  - `css/main.css` - 모든 스타일
  - `js/app.js` - 모든 JavaScript
  - `assets/fonts/` - Paperlogy 폰트 파일

### 2. 경로 업데이트 ✅
- `script.js`의 모든 `your_title_storyboard_dark.html` 참조를 `storyboard/index.html`로 변경
- Stage 2, 5, 6, 7, 8 업로드 경로 모두 수정됨

### 3. URL 파라미터 지원 확인 ✅
스토리보드 app.js에서 다음 파라미터들이 모두 지원됨:
- `autoImport=true` - 자동 JSON 가져오기
- `loadTempJson=true` - Stage 2 임시 데이터 로드
- `loadStage5JsonMultiple=true` - Stage 5 다중 파일 로드
- `loadStage6JsonMultiple=true` - Stage 6 다중 파일 로드
- `loadStage7JsonMultiple=true` - Stage 7 다중 파일 로드
- `loadStage8JsonMultiple=true` - Stage 8 다중 파일 로드

## 테스트 항목

### 메인 대시보드에서 테스트
1. [ ] 스토리보드 카드 클릭 → `/storyboard/index.html`로 이동
2. [ ] Stage 2 업로드 → 스토리보드로 자동 이동 및 데이터 로드
3. [ ] Stage 5 업로드 → 스토리보드로 자동 이동 및 데이터 로드
4. [ ] Stage 6 업로드 → 스토리보드로 자동 이동 및 데이터 로드
5. [ ] Stage 7 업로드 → 스토리보드로 자동 이동 및 데이터 로드
6. [ ] Stage 8 업로드 → 스토리보드로 자동 이동 및 데이터 로드
7. [ ] 전체 Stage 업로드 → 모든 데이터가 스토리보드에 로드

### 스토리보드에서 테스트
1. [ ] JSON 가져오기 기능
2. [ ] JSON 내보내기 기능
3. [ ] 네비게이션 (시퀀스/씬/샷)
4. [ ] 각 샷의 상세 정보 표시
5. [ ] 탭 전환 (정보/이미지/영상/오디오/음악)
6. [ ] 홈 버튼 → 메인 대시보드로 이동

## 알려진 이슈
- 없음

## 테스트 URL
- 메인 대시보드: http://localhost:8080/
- 스토리보드: http://localhost:8080/storyboard/
- 기존 스토리보드 (참고용): http://localhost:8080/your_title_storyboard_dark.html