# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIFI - AI 기반 영상 제작 및 컨셉아트 관리 웹앱 (Pure vanilla JS, No frameworks)
**Live**: https://aifiwb.netlify.app

## Quick Start

```bash
python -m http.server 8000  # Local dev
```

## Core Architecture

- **Storyboard** (`storyboard/index.html`): Sequence → Scene → Shot 구조
- **Concept Art** (`concept-art/index.html`): 캐릭터/장소/소품 프롬프트
- **Dashboard** (`index.html`): 8-stage 워크플로우 허브

### Key Data Structure
```javascript
currentData = {
  project_info: { name, film_id },
  breakdown_data: {
    sequences: [...],
    shots: [{ 
      id, scene_id,
      image_design: { ai_generated_images: {...} }
    }]
  }
}
```

### localStorage Keys
- `breakdownData_[projectName]` - 메인 데이터
- `stage[N]TempJson` - 스테이지 임시 데이터
- `imageUrlCache_[projectName]` - 이미지 캐시

## Critical Patterns

- **저장**: 데이터 수정 후 반드시 `saveDataToLocalStorage()` 호출
- **Dropbox URL**: `AppUtils.convertDropboxUrl()` 사용 (dl=0 → raw=1)
- **HTML Escape**: `AppUtils.escapeHtmlAttribute()` 사용
- **비밀번호**: config.js의 `BANANA_PASSWORD = '1004'`

## Custom Rules

- 답변은 한국어로
- 아이콘은 tabler 사용

## Module Structure (45% 리팩토링 진행중)
`app.js` → 모듈화: `app-utils.js`, `data/storage.js`, `ui/navigation.js` 등