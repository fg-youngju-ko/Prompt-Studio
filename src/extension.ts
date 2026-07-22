import * as vscode from 'vscode';
import { PromptStudioPanel } from './panel';
import { IdeaStartPanel } from './ideaPanel';
import { FeaturePromptPanel } from './featurePanel';
import { BugFixPromptPanel } from './bugFixPanel';
import { RefactorPromptPanel } from './refactorPanel';

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

  const buildBugFixPrompt = vscode.commands.registerCommand('promptStudio.buildBugFixPrompt', () => {
    BugFixPromptPanel.createOrShow(context.extensionUri);
  });

  const buildRefactorPrompt = vscode.commands.registerCommand('promptStudio.buildRefactorPrompt', () => {
    RefactorPromptPanel.createOrShow(context.extensionUri);
  });

  context.subscriptions.push(
    startProject,
    startFromIdea,
    buildFeaturePrompt,
    buildBugFixPrompt,
    buildRefactorPrompt
  );
}

export function deactivate() {}
