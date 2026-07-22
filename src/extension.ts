import * as vscode from 'vscode';
import { PromptStudioPanel } from './panel';
import { IdeaStartPanel } from './ideaPanel';
import { FeaturePromptPanel } from './featurePanel';
import { LibraryPanel } from './libraryPanel';

export function activate(context: vscode.ExtensionContext) {
  const startProject = vscode.commands.registerCommand('promptStudio.startProject', () => {
    PromptStudioPanel.createOrShow(context);
  });

  const startFromIdea = vscode.commands.registerCommand('promptStudio.startFromIdea', () => {
    IdeaStartPanel.createOrShow(context);
  });

  const buildFeaturePrompt = vscode.commands.registerCommand('promptStudio.buildFeaturePrompt', () => {
    FeaturePromptPanel.createOrShow(context);
  });

  const openLibrary = vscode.commands.registerCommand('promptStudio.openLibrary', () => {
    LibraryPanel.createOrShow(context);
  });

  context.subscriptions.push(startProject, startFromIdea, buildFeaturePrompt, openLibrary);
}
