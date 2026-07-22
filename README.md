# Prompt Studio

Claude Code와 함께 바이브 코딩할 때, 더 좋은 결과를 얻을 수 있도록 고품질 프롬프트를
쉽고 빠르게 만들어주는 웹 도구입니다.

코드를 대신 생성해주는 도구가 아닙니다. "AI에게 무엇을 어떻게 요청할지"를 정리해주는
프롬프트 빌더입니다.

빌드 과정이나 서버가 필요 없는 **순수 정적 웹앱**(`index.html` 하나)입니다. 링크만
열면 바로 사용할 수 있습니다.

## 기능

- **프로젝트 시작 프롬프트 생성** — 프로젝트명, 목적, 플랫폼, 기술스택 등을 입력하면
  Claude Code에 붙여넣을 프로젝트 시작 프롬프트를 생성합니다.
- **아이디어로 시작하기** — "가계부 앱 만들고 싶어" 같은 한 줄 아이디어를 입력하면,
  Claude API가 기획을 구체화할 역질문을 만들어줍니다. 아이디어에 이미 답이 드러난
  항목은 자동으로 채워집니다. 답변을 정리하면 자연스러운 문장으로 요약된 프롬프트가
  만들어집니다. (Anthropic API 키 필요, 아래 참고)
- **기능 구현 프롬프트 생성** — 로그인/회원가입/DB 설계/캘린더/가계부/OCR/AI 분석/
  UI 생성/API 개발/리팩토링/테스트 중 카테고리를 고르고 구현하고 싶은 내용을 적으면,
  카테고리별 체크포인트가 담긴 프롬프트를 생성합니다.
- **프롬프트 라이브러리** — 생성한 프롬프트를 저장해두고, 즐겨찾기로 상단에 고정하거나,
  나중에 내용을 수정할 수 있습니다.

모든 생성 화면에는 결과를 클립보드로 복사하는 버튼과 라이브러리에 저장하는 버튼이
있습니다.

## 개인정보 처리

**API 키와 저장한 프롬프트는 이 브라우저의 `localStorage`에만 저장되며, 어떤 서버로도
전송되지 않습니다.** 서버 자체가 존재하지 않습니다 — 이 앱은 정적 HTML 파일 하나입니다.

"아이디어로 시작하기"의 AI 호출만 예외로, 입력한 API 키를 사용해 브라우저에서
`api.anthropic.com`으로 직접 요청을 보냅니다(Anthropic이 제공하는 브라우저 직접 호출
방식). 이 요청은 사용자의 브라우저와 Anthropic 사이에서만 이루어지고, 다른 어떤
서버도 거치지 않습니다.

localStorage는 브라우저·기기별로 분리되어 있으므로, 다른 브라우저나 기기에서 열면
저장된 키/프롬프트가 보이지 않습니다. 브라우저 방문 기록을 지우면 함께 삭제됩니다.

## Anthropic API 키 설정

"아이디어로 시작하기" 화면에서 API 키를 입력하고 저장하면 됩니다. 키는 아래에서
발급받을 수 있습니다.

- [Claude (Anthropic)](https://console.anthropic.com/settings/keys)
- [Gemini](https://aistudio.google.com/apikey)
- [GPT (OpenAI)](https://platform.openai.com/api-keys)
- [Perplexity](https://www.perplexity.ai)

## 로컬에서 열기

빌드 없이 `index.html`을 브라우저로 바로 열면 됩니다.

```bash
git clone https://github.com/fg-youngju-ko/Prompt-Studio.git
cd Prompt-Studio
open index.html   # macOS
start index.html  # Windows
```

## 배포 (링크로 공유하기)

정적 파일 하나이므로 어디든 올리면 됩니다.

- **GitHub Pages**: 저장소를 Public으로 전환하거나(무료 플랜 기준 Public 저장소만
  가능) GitHub Pro/조직 플랜이면 Private 저장소에서도 가능합니다. 저장소 설정의
  Pages에서 브랜치를 `main`, 폴더를 `/ (root)`로 지정하면 됩니다.
- **Netlify / Vercel**: 저장소를 Private으로 유지한 채로도 배포 가능합니다. 계정을
  연결하고 이 저장소를 선택하면 별도 빌드 설정 없이(Build command 없음, Publish
  directory `/`) 바로 배포됩니다.

## 개발 원칙

이 프로젝트는 MVP부터 하나씩 만드는 것을 원칙으로 합니다. 문서/폴더 자동 생성,
Git 자동 설정 같은 부가 기능은 목표가 아니며, 오직 "고품질 프롬프트를 만드는 것"에
집중합니다.

## 라이선스

MIT
