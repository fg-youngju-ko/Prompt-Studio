import * as vscode from 'vscode';
import { PromptStudioPanel } from './panel';
import { IdeaStartPanel } from './ideaPanel';

export function activate(context: vscode.ExtensionContext) {
  const startProject = vscode.commands.registerCommand('promptStudio.startProject', () => {
    PromptStudioPanel.createOrShow(context.extensionUri);
  });

  const startFromIdea = vscode.commands.registerCommand('promptStudio.startFromIdea', () => {
    IdeaStartPanel.createOrShow(context);
  });

  context.subscriptions.push(startProject, startFromIdea);
}

export function deactivate() {}
