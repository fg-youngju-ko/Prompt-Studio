import * as vscode from 'vscode';
import { buildFeaturePrompt, FEATURE_CATEGORIES, FeatureCategory } from './featurePromptBuilder';

export class FeaturePromptPanel {
  public static currentPanel: FeaturePromptPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor?.viewColumn;

    if (FeaturePromptPanel.currentPanel) {
      FeaturePromptPanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'promptStudioFeaturePrompt',
      'Prompt Studio: 기능 구현 프롬프트 생성',
      column ?? vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
    );

    FeaturePromptPanel.currentPanel = new FeaturePromptPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.panel.webview.html = this.getHtml(extensionUri);

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.command === 'generate') {
          const category = String(message.category ?? '') as FeatureCategory;
          const description = String(message.description ?? '');
          const prompt = buildFeaturePrompt({ category, description });
          this.panel.webview.postMessage({ command: 'showPrompt', prompt });
        }
      },
      null,
      this.disposables
    );
  }

  private getHtml(extensionUri: vscode.Uri): string {
    const webview = this.panel.webview;
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'feature.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'feature.js'));

    const categoryButtons = FEATURE_CATEGORIES.map(
      (category) => `<button type="button" class="category-btn" data-category="${category}">${category}</button>`
    ).join('\n        ');

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${cssUri}" />
  <title>Prompt Studio - 기능 구현 프롬프트 생성</title>
</head>
<body>
  <div class="container">
    <h1>기능 구현 프롬프트 생성</h1>
    <p class="subtitle">카테고리를 고르고 구현하고 싶은 내용을 적으면, 카테고리별 체크포인트가 담긴 프롬프트를 만들어 드립니다.</p>

    <div class="card">
      <label>카테고리</label>
      <div class="category-grid">
        ${categoryButtons}
      </div>
      <p class="error" id="categoryError" hidden>카테고리를 선택해 주세요.</p>

      <label for="description">구현하고 싶은 내용</label>
      <textarea id="description" rows="3" placeholder="예: 이메일/비밀번호로 로그인하고, 로그인 상태를 유지하고 싶어요"></textarea>
      <p class="error" id="descriptionError" hidden></p>

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
    FeaturePromptPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) {
        d.dispose();
      }
    }
  }
}
