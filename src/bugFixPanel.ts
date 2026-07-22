import * as vscode from 'vscode';
import { buildBugFixPrompt } from './bugFixPromptBuilder';

export class BugFixPromptPanel {
  public static currentPanel: BugFixPromptPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor?.viewColumn;

    if (BugFixPromptPanel.currentPanel) {
      BugFixPromptPanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'promptStudioBugFixPrompt',
      'Prompt Studio: 버그 수정 프롬프트 생성',
      column ?? vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
    );

    BugFixPromptPanel.currentPanel = new BugFixPromptPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.panel.webview.html = this.getHtml(extensionUri);

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.command === 'generate') {
          const prompt = buildBugFixPrompt({
            symptom: String(message.symptom ?? ''),
            errorMessage: String(message.errorMessage ?? ''),
            desiredResult: String(message.desiredResult ?? '')
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
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'bugfix.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'bugfix.js'));

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${cssUri}" />
  <title>Prompt Studio - 버그 수정 프롬프트 생성</title>
</head>
<body>
  <div class="container">
    <h1>버그 수정 프롬프트 생성</h1>
    <p class="subtitle">증상, 에러메시지, 원하는 결과를 입력하면 디버깅 프롬프트를 만들어 드립니다.</p>

    <div class="card">
      <label for="symptom">증상</label>
      <textarea id="symptom" rows="3" placeholder="예: 로그인 버튼을 누르면 화면이 멈춰요"></textarea>

      <label for="errorMessage">에러 메시지 (있다면)</label>
      <textarea id="errorMessage" rows="3" placeholder="콘솔이나 터미널에 뜨는 에러 메시지를 붙여넣으세요"></textarea>

      <label for="desiredResult">원하는 결과</label>
      <textarea id="desiredResult" rows="2" placeholder="예: 로그인 버튼을 누르면 정상적으로 홈 화면으로 이동해야 해요"></textarea>

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
    BugFixPromptPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) {
        d.dispose();
      }
    }
  }
}
