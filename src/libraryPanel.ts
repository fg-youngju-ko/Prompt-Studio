import * as vscode from 'vscode';
import { deletePrompt, getLibrary, sortForDisplay, toggleFavorite, updatePromptContent } from './promptLibrary';

export class LibraryPanel {
  public static currentPanel: LibraryPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly context: vscode.ExtensionContext;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor?.viewColumn;

    if (LibraryPanel.currentPanel) {
      LibraryPanel.currentPanel.panel.reveal(column);
      LibraryPanel.currentPanel.sendLibrary();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'promptStudioLibrary',
      'Prompt Studio: 프롬프트 라이브러리',
      column ?? vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
      }
    );

    LibraryPanel.currentPanel = new LibraryPanel(panel, context);
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

  private sendLibrary() {
    const items = sortForDisplay(getLibrary(this.context));
    this.panel.webview.postMessage({ command: 'showLibrary', items });
  }

  private async handleMessage(message: { command: string; [key: string]: unknown }) {
    switch (message.command) {
      case 'ready': {
        this.sendLibrary();
        break;
      }
      case 'toggleFavorite': {
        await toggleFavorite(this.context, String(message.id ?? ''));
        this.sendLibrary();
        break;
      }
      case 'updateContent': {
        await updatePromptContent(this.context, String(message.id ?? ''), String(message.content ?? ''));
        this.sendLibrary();
        break;
      }
      case 'deletePrompt': {
        await deletePrompt(this.context, String(message.id ?? ''));
        this.sendLibrary();
        break;
      }
      case 'copyToClipboard': {
        await vscode.env.clipboard.writeText(String(message.text ?? ''));
        this.panel.webview.postMessage({ command: 'copied', id: message.id });
        break;
      }
    }
  }

  private getHtml(extensionUri: vscode.Uri): string {
    const webview = this.panel.webview;
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'library.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'library.js'));

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${cssUri}" />
  <title>Prompt Studio - 프롬프트 라이브러리</title>
</head>
<body>
  <div class="container">
    <h1>프롬프트 라이브러리</h1>
    <p class="subtitle">저장한 프롬프트를 모아봅니다. 별표를 누르면 즐겨찾기로 상단에 고정됩니다.</p>

    <div id="emptyState" class="card" hidden>
      <p class="hint">아직 저장한 프롬프트가 없습니다. 프롬프트 생성 화면에서 "라이브러리에 저장"을 눌러보세요.</p>
    </div>

    <div id="list"></div>
  </div>
  <script src="${jsUri}"></script>
</body>
</html>`;
  }

  public dispose() {
    LibraryPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) {
        d.dispose();
      }
    }
  }
}
