# Stage 6 미드저니 프롬프트 표시 문제 디버깅

## 문제 상황
- Stage 6 JSON 파일에는 `universal`과 `nanobana` 프롬프트만 있음
- 하지만 화면에는 Midjourney 섹션이 표시되고 있음

## 확인된 사실
1. **stage6_1.json 파일 내용**:
   - `selected_ai_tools`: ["universal", "nanobana"]
   - 각 이미지마다 `prompts.universal`과 `prompts.nanobana`만 존재
   - Midjourney 관련 데이터는 없음

2. **app.js 파일**:
   - 1019번 줄에서 모든 AI 도구 리스트 정의 (midjourney 포함)
   - 이미지 렌더링 시 선택된 도구만 표시해야 하는데 모든 도구를 표시하는 것으로 보임

## 문제 해결 방법

### 1. 브라우저에서 디버깅
1. 브라우저 개발자 도구 열기 (F12)
2. Console에서 다음 확인:
```javascript
// 현재 로드된 Stage 6 데이터 확인
console.log(window.stage6Data);

// 선택된 AI 도구 확인
console.log(window.stage6Data?.generation_settings?.selected_ai_tools);

// 실제 프롬프트 데이터 확인
console.log(window.stage6Data?.shots[0]?.images[0]?.prompts);
```

### 2. 코드 수정 필요 부분
Stage 6 데이터를 렌더링할 때 `selected_ai_tools`를 확인하여 선택된 도구만 표시하도록 수정 필요

### 3. 임시 해결책
현재 표시되는 Midjourney 섹션을 숨기려면:
1. 브라우저 콘솔에서: 
```javascript
document.querySelectorAll('.ai-image-section.midjourney').forEach(el => el.style.display = 'none');
```

## 권장 사항
Stage 6 데이터 렌더링 함수를 찾아서 `selected_ai_tools`를 확인하도록 수정하는 것이 근본적인 해결책입니다.