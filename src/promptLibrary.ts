import * as vscode from 'vscode';

const LIBRARY_KEY = 'promptStudio.library';

export interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export function getLibrary(context: vscode.ExtensionContext): SavedPrompt[] {
  return context.globalState.get<SavedPrompt[]>(LIBRARY_KEY, []);
}

async function setLibrary(context: vscode.ExtensionContext, items: SavedPrompt[]): Promise<void> {
  await context.globalState.update(LIBRARY_KEY, items);
}

export async function addPrompt(
  context: vscode.ExtensionContext,
  title: string,
  content: string
): Promise<SavedPrompt> {
  const items = getLibrary(context);
  const now = Date.now();
  const entry: SavedPrompt = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim() || '(제목 없음)',
    content,
    favorite: false,
    createdAt: now,
    updatedAt: now
  };
  await setLibrary(context, [entry, ...items]);
  return entry;
}

export async function updatePromptContent(
  context: vscode.ExtensionContext,
  id: string,
  content: string
): Promise<void> {
  const items = getLibrary(context);
  const next = items.map((item) => (item.id === id ? { ...item, content, updatedAt: Date.now() } : item));
  await setLibrary(context, next);
}

export async function toggleFavorite(context: vscode.ExtensionContext, id: string): Promise<void> {
  const items = getLibrary(context);
  const next = items.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item));
  await setLibrary(context, next);
}

export async function deletePrompt(context: vscode.ExtensionContext, id: string): Promise<void> {
  const items = getLibrary(context);
  await setLibrary(
    context,
    items.filter((item) => item.id !== id)
  );
}

export function sortForDisplay(items: SavedPrompt[]): SavedPrompt[] {
  return [...items].sort((a, b) => {
    if (a.favorite !== b.favorite) {
      return a.favorite ? -1 : 1;
    }
    return b.updatedAt - a.updatedAt;
  });
}
