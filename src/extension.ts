import * as vscode from 'vscode';
import { PromptStudioPanel } from './panel';
import { IdeaStartPanel } from './ideaPanel';
import { FeaturePromptPanel } from './featurePanel';

export function activate(context: vscode.ExtensionContext) {
  const startProject = vscode.commands.registerCommand('promptStudio.startProject', () => {
    PromptStudioPanel.createOrShow(context.extensionUri);
  });

  const startFromIdea = vscode.commands.registerCommand('promptStudio.startFromIdea', () => {
    IdeaStartPanel.createOrShow(context);
  });

  const buildFeaturePrompt = vscode.commands.registerCommand('promptStudio.buildFeaturePrompt', () => {
    FeaturePromptPanel.createOrShow(context.extensionUri);
  });

  context.subscriptions.push(startProject, startFromIdea, buildFeaturePrompt);
}

export function deactivate() {}
