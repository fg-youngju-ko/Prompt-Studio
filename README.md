# Prompt Studio

VS Code에서 Claude Code와 함께 바이브 코딩할 때, 더 좋은 결과를 얻을 수 있도록
고품질 프롬프트를 쉽고 빠르게 만들어주는 확장 프로그램입니다.

코드를 대신 생성해주는 도구가 아닙니다. "AI에게 무엇을 어떻게 요청할지"를 정리해주는
프롬프트 빌더입니다.

## 기능

명령 팔레트(`Ctrl+Shift+P` / `Cmd+Shift+P`)에서 실행합니다.

- **Prompt Studio: 프로젝트 시작 프롬프트 생성** — 프로젝트명, 목적, 플랫폼, 기술스택 등을
  입력하면 Claude Code에 붙여넣을 프로젝트 시작 프롬프트를 생성합니다.
- **Prompt Studio: 아이디어로 시작하기** — "가계부 앱 만들고 싶어" 같은 한 줄 아이디어를
  입력하면, Claude API가 기획을 구체화할 역질문을 만들어줍니다. 아이디어에 이미 답이
  드러난 항목은 자동으로 채워집니다. 답변을 정리하면 자연스러운 문장으로 요약된
  프롬프트가 만들어집니다. (Anthropic API 키 필요, 아래 참고)
- **Prompt Studio: 기능 구현 프롬프트 생성** — 로그인/회원가입/DB 설계/캘린더/가계부/OCR/
  AI 분석/UI 생성/API 개발/리팩토링/테스트 중 카테고리를 고르고 구현하고 싶은 내용을
  적으면, 카테고리별 체크포인트가 담긴 프롬프트를 생성합니다.
- **Prompt Studio: 프롬프트 라이브러리** — 생성한 프롬프트를 저장해두고, 즐겨찾기로
  상단에 고정하거나, 나중에 내용을 수정할 수 있습니다.

모든 생성 화면에는 결과를 클립보드로 복사하는 버튼과 라이브러리에 저장하는 버튼이
있습니다.

## Anthropic API 키 설정

"아이디어로 시작하기" 기능은 Claude API를 사용합니다. 화면에서 API 키를 입력하면
VS Code의 SecretStorage에 안전하게 저장됩니다(평문으로 디스크에 저장되지 않음).

키는 아래에서 발급받을 수 있습니다.

- [Claude (Anthropic)](https://console.anthropic.com/settings/keys)
- [Gemini](https://aistudio.google.com/apikey)
- [GPT (OpenAI)](https://platform.openai.com/api-keys)
- [Perplexity](https://www.perplexity.ai)

## 설치

1. [Releases](../../releases)에서 최신 `.vsix` 파일을 내려받습니다.
2. VS Code에서 `Ctrl+Shift+P` → **Extensions: Install from VSIX...** 실행 후 내려받은
   파일을 선택합니다.

또는 소스에서 직접 빌드할 수 있습니다.

```bash
npm install
npm run compile
npx @vscode/vsce package
code --install-extension prompt-studio-*.vsix
```

## 개발 원칙

이 프로젝트는 MVP부터 하나씩 만드는 것을 원칙으로 합니다. 문서/폴더 자동 생성,
Git 자동 설정 같은 부가 기능은 목표가 아니며, 오직 "고품질 프롬프트를 만드는 것"에
집중합니다.

## 라이선스

MIT
