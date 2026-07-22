import * as vscode from 'vscode';
import { buildRefactorPrompt } from './refactorPromptBuilder';

export class RefactorPromptPanel {
  public static currentPanel: RefactorPromptPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor?.viewColumn;

    if (RefactorPromptPanel.currentPanel) {
      RefactorPromptPanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'promptStudioRefactorPrompt',
      'Prompt Studio: 리팩토링 프롬프트 생성',
      column ?? vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
    );

    RefactorPromptPanel.currentPanel = new RefactorPromptPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.panel.webview.html = this.getHtml(extensionUri);

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.command === 'generate') {
          const prompt = buildRefactorPrompt({
            target: String(message.target ?? ''),
            reason: String(message.reason ?? '')
          });
          this.panel.webview.postMessage({ command: 'showPrompt', prompt });
        }
      },
      null,
      this.disposables
    );
  }

  private getHtml(extensionUri: vscode.Uri): string {
    const webview = this.panel.webview;
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'refactor.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'refactor.js'));

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${cssUri}" />
  <title>Prompt Studio - 리팩토링 프롬프트 생성</title>
</head>
<body>
  <div class="container">
    <h1>리팩토링 프롬프트 생성</h1>
    <p class="subtitle">현재 구조를 유지하면서, 더 좋은 구조가 있다면 먼저 제안받고 승인 후 수정하는 리팩토링 프롬프트를 만들어 드립니다.</p>

    <div class="card">
      <label for="target">리팩토링 대상</label>
      <textarea id="target" rows="3" placeholder="예: src/api 폴더의 요청 처리 로직 전체"></textarea>

      <label for="reason">리팩토링하려는 이유 / 현재 문제점 (선택)</label>
      <textarea id="reason" rows="3" placeholder="예: 비슷한 코드가 여러 파일에 반복돼서 수정할 때마다 여러 곳을 고쳐야 해요"></textarea>

      <p class="error" id="formError" hidden></p>
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
    RefactorPromptPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) {
        d.dispose();
      }
    }
  }
}
