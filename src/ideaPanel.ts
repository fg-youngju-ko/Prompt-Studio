import * as vscode from 'vscode';
import { fetchClarifyingQuestions } from './aiClient';
import { buildIdeaStartPrompt, QuestionAnswer } from './ideaPromptBuilder';

const API_KEY_SECRET = 'promptStudio.anthropicApiKey';

export class IdeaStartPanel {
  public static currentPanel: IdeaStartPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly context: vscode.ExtensionContext;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor?.viewColumn;

    if (IdeaStartPanel.currentPanel) {
      IdeaStartPanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'promptStudioIdeaStart',
      'Prompt Studio: 아이디어로 시작하기',
      column ?? vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
      }
    );

    IdeaStartPanel.currentPanel = new IdeaStartPanel(panel, context);
  }

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this.panel = panel;
    this.context = context;
    this.panel.webview.html = this.getHtml(context.extensionUri);

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (message) => this.handleMessage(message),
      null,
      this.disposables
    );
  }

  private async handleMessage(message: { command: string; [key: string]: unknown }) {
    switch (message.command) {
      case 'ready': {
        const hasKey = Boolean(await this.context.secrets.get(API_KEY_SECRET));
        this.panel.webview.postMessage({ command: 'apiKeyStatus', hasKey });
        break;
      }
      case 'saveApiKey': {
        const apiKey = String(message.apiKey ?? '').trim();
        if (apiKey) {
          await this.context.secrets.store(API_KEY_SECRET, apiKey);
        }
        this.panel.webview.postMessage({ command: 'apiKeyStatus', hasKey: apiKey.length > 0 });
        break;
      }
      case 'getQuestions': {
        const idea = String(message.idea ?? '').trim();
        const apiKey = await this.context.secrets.get(API_KEY_SECRET);

        if (!apiKey) {
          this.panel.webview.postMessage({
            command: 'questionsError',
            error: 'API 키가 저장되어 있지 않습니다. 먼저 API 키를 입력하고 저장해 주세요.'
          });
          return;
        }

        try {
          const questions = await fetchClarifyingQuestions(apiKey, idea);
          this.panel.webview.postMessage({ command: 'showQuestions', questions });
        } catch (err) {
          this.panel.webview.postMessage({
            command: 'questionsError',
            error: err instanceof Error ? err.message : String(err)
          });
        }
        break;
      }
      case 'generatePrompt': {
        const idea = String(message.idea ?? '');
        const qa = (message.qa ?? []) as QuestionAnswer[];
        const prompt = buildIdeaStartPrompt(idea, qa);
        this.panel.webview.postMessage({ command: 'showPrompt', prompt });
        break;
      }
    }
  }

  private getHtml(extensionUri: vscode.Uri): string {
    const webview = this.panel.webview;
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'idea.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'idea.js'));

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${cssUri}" />
  <title>Prompt Studio - 아이디어로 시작하기</title>
</head>
<body>
  <div class="container">
    <h1>아이디어로 시작하기</h1>
    <p class="subtitle">떠오른 아이디어를 한 줄로 적으면, AI가 기획을 구체화할 질문을 해드립니다.</p>

    <div class="card">
      <label for="apiKey">AI API 키 (Anthropic Claude)</label>
      <div class="key-row">
        <input id="apiKey" type="password" placeholder="sk-ant-..." />
        <button id="saveKeyBtn" class="secondary-btn">저장</button>
      </div>
      <p class="key-status" id="keyStatus">키가 저장되어 있지 않습니다.</p>

      <label class="ai-links-label">API 키 발급 / 다른 AI 서비스</label>
      <div class="ai-links">
        <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">Claude (Anthropic)</a>
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Gemini</a>
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">GPT (OpenAI)</a>
        <a href="https://www.perplexity.ai" target="_blank" rel="noopener">Perplexity</a>
      </div>
    </div>

    <div class="card">
      <label for="idea">아이디어</label>
      <textarea id="idea" rows="2" placeholder="예: 가계부 앱 만들고 싶어"></textarea>
      <button id="askBtn">질문받기</button>
      <p class="error" id="ideaError" hidden></p>
    </div>

    <div class="card" id="questionsCard" hidden>
      <h2>몇 가지만 답해주세요</h2>
      <div id="questionsList"></div>
      <button id="generateBtn">프롬프트 생성</button>
    </div>

    <div class="card result-card" id="resultCard" hidden>
      <h2>생성된 프롬프트</h2>
      <p class="hint">아래 내용을 드래그해서 복사한 뒤 Claude Code에 붙여넣으세요.</p>
      <pre id="resultText"></pre>
    </div>
  </div>
  <script src="${jsUri}"></script>
</body>
</html>`;
  }

  public dispose() {
    IdeaStartPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) {
        d.dispose();
      }
    }
  }
}
