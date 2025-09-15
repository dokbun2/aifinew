# Supabase MCP (Model Context Protocol) 설정 가이드

## 📋 설정 전 준비사항

### 1. Supabase Access Token 생성
1. [Supabase Dashboard](https://app.supabase.com) 로그인
2. 계정 설정으로 이동
3. Personal Access Token 생성
4. 토큰 이름: "AIFI MCP Server" (또는 원하는 이름)
5. 생성된 토큰을 안전한 곳에 저장

### 2. Project Reference 확인
1. Supabase Dashboard에서 프로젝트 선택
2. Settings → General
3. Reference ID 복사 (예: `abcdefghijklmnop`)

## 🔧 MCP 설정 방법

### Claude Desktop/Code 설정

1. Claude 설정 파일 위치:
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. 설정 파일에 다음 내용 추가:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "--read-only",
        "--project-ref=YOUR_PROJECT_REF"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_ACCESS_TOKEN"
      }
    }
  }
}
```

### 환경 변수 설정 (대체 방법)

`.env` 파일 생성:
```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
SUPABASE_PROJECT_REF=YOUR_PROJECT_REF
```

## 🚀 MCP 서버 사용 방법

### 읽기 전용 모드 (권장)
```json
{
  "args": [
    "-y",
    "@supabase/mcp-server-supabase",
    "--read-only",
    "--project-ref=YOUR_PROJECT_REF"
  ]
}
```

### 전체 접근 모드 (주의 필요)
```json
{
  "args": [
    "-y",
    "@supabase/mcp-server-supabase",
    "--project-ref=YOUR_PROJECT_REF"
  ]
}
```

## 🛡️ 보안 권장사항

1. **개발 환경에서만 사용**
   - Production 데이터베이스에는 연결하지 마세요
   - 테스트/개발 프로젝트만 사용

2. **읽기 전용 모드 사용**
   - `--read-only` 플래그를 항상 사용
   - 실수로 데이터를 수정하는 것을 방지

3. **토큰 보안**
   - Access Token을 코드에 직접 포함하지 마세요
   - 환경 변수 사용 권장
   - `.gitignore`에 `.env` 파일 추가

## 📊 AIFI 프로젝트용 Supabase 테이블 구조 (예시)

```sql
-- 프로젝트 테이블
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  project_name TEXT NOT NULL,
  film_id TEXT UNIQUE,
  breakdown_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이미지 프롬프트 테이블
CREATE TABLE image_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  shot_id TEXT NOT NULL,
  ai_tool TEXT NOT NULL,
  prompt_original TEXT,
  prompt_translated TEXT,
  parameters TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 설정 테이블
CREATE TABLE user_settings (
  user_email TEXT PRIMARY KEY,
  preferences JSONB,
  last_project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 정책
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 접근
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);
```

## 🔍 MCP 서버 테스트

### 1. 연결 테스트
```bash
npx -y @supabase/mcp-server-supabase \
  --read-only \
  --project-ref=YOUR_PROJECT_REF \
  test
```

### 2. Claude에서 사용 예시
```
"Supabase에서 projects 테이블의 스키마를 보여줘"
"최근 생성된 프로젝트 5개를 조회해줘"
"user_email이 'test@example.com'인 프로젝트를 찾아줘"
```

## 📝 문제 해결

### 일반적인 오류들

1. **"Invalid access token"**
   - Access Token이 올바른지 확인
   - 토큰이 만료되지 않았는지 확인

2. **"Project not found"**
   - Project Reference ID가 정확한지 확인
   - 프로젝트가 활성 상태인지 확인

3. **"Permission denied"**
   - RLS 정책 확인
   - 사용자 권한 확인

## 🔗 참고 자료

- [Supabase MCP 공식 문서](https://supabase.com/docs/guides/getting-started/mcp)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

⚠️ **중요**: 이 설정을 적용하기 전에 반드시 Supabase 프로젝트를 백업하고, 개발 환경에서만 테스트하세요.