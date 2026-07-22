import * as vscode from 'vscode';
import { buildProjectStartPrompt, ProjectStartFormData } from './promptBuilder';
import { addPrompt } from './promptLibrary';

export class PromptStudioPanel {
  public static currentPanel: PromptStudioPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly context: vscode.ExtensionContext;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor?.viewColumn;

    if (PromptStudioPanel.currentPanel) {
      PromptStudioPanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'promptStudioStartProject',
      'Prompt Studio: 프로젝트 시작',
      column ?? vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
      }
    );

    PromptStudioPanel.currentPanel = new PromptStudioPanel(panel, context);
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
      case 'generate': {
        const prompt = buildProjectStartPrompt(message.data as ProjectStartFormData);
        this.panel.webview.postMessage({ command: 'showPrompt', prompt });
        break;
      }
      case 'copyToClipboard': {
        await vscode.env.clipboard.writeText(String(message.text ?? ''));
        this.panel.webview.postMessage({ command: 'copied' });
        break;
      }
      case 'saveToLibrary': {
        await addPrompt(this.context, String(message.title ?? ''), String(message.content ?? ''));
        this.panel.webview.postMessage({ command: 'saved' });
        break;
      }
    }
  }

  private getHtml(extensionUri: vscode.Uri): string {
    const webview = this.panel.webview;
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'main.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'main.js'));

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${cssUri}" />
  <title>Prompt Studio</title>
</head>
<body>
  <div class="container">
    <h1>프로젝트 시작 프롬프트 생성</h1>
    <p class="subtitle">몇 가지 질문에 답하면 Claude Code에 붙여넣을 프롬프트가 만들어집니다.</p>

    <div class="card">
      <label for="projectName">프로젝트명</label>
      <input id="projectName" type="text" placeholder="예: 가계부 앱" />

      <label for="projectPurpose">프로젝트 목적</label>
      <textarea id="projectPurpose" rows="3" placeholder="이 프로젝트로 무엇을 하고 싶은가요?"></textarea>

      <label for="platform">플랫폼</label>
      <select id="platform">
        <option value="Web">Web</option>
        <option value="Mobile">Mobile</option>
        <option value="Desktop">Desktop</option>
      </select>

      <label for="devPurpose">개발 목적</label>
      <select id="devPurpose">
        <option value="공부">공부</option>
        <option value="포트폴리오">포트폴리오</option>
        <option value="실사용">실사용</option>
        <option value="회사 업무">회사 업무</option>
      </select>

      <label for="techStack">사용할 기술스택</label>
      <input id="techStack" type="text" placeholder="예: React, Node.js, PostgreSQL" />

      <label for="designStyle">디자인 스타일</label>
      <input id="designStyle" type="text" placeholder="예: 미니멀, 화이트+포인트컬러" />

      <label for="devTendency">개발 성향</label>
      <input id="devTendency" type="text" placeholder="예: 빠르게 만들고 다듬기 vs 처음부터 꼼꼼히" />

      <button id="generateBtn">프롬프트 생성</button>
    </div>

    <div class="card result-card" id="resultCard" hidden>
      <h2>생성된 프롬프트</h2>
      <p class="hint">아래 내용을 드래그해서 복사한 뒤 Claude Code에 붙여넣으세요.</p>
      <pre id="resultText"></pre>
      <div class="result-actions">
        <button id="copyBtn" class="secondary-btn">복사</button>
        <button id="saveBtn" class="secondary-btn">라이브러리에 저장</button>
      </div>
    </div>
  </div>
  <script src="${jsUri}"></script>
</body>
</html>`;
  }

  public dispose() {
    PromptStudioPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) {
        d.dispose();
      }
    }
  }
}
