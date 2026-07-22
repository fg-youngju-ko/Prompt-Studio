import * as vscode from 'vscode';
import { PromptStudioPanel } from './panel';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('promptStudio.startProject', () => {
    PromptStudioPanel.createOrShow(context.extensionUri);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
