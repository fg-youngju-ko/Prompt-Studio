import * as assert from 'assert';
import * as vscode from 'vscode';
import { buildProjectStartPrompt } from '../../promptBuilder';
import { PromptStudioPanel } from '../../panel';

suite('Prompt Studio Extension', () => {
  test('buildProjectStartPrompt includes all required sections and form values', () => {
    const prompt = buildProjectStartPrompt({
      projectName: '가계부 앱',
      projectPurpose: '개인 지출 관리',
      platform: 'Mobile',
      devPurpose: '포트폴리오',
      techStack: 'React Native',
      designStyle: '미니멀',
      devTendency: '빠르게 만들고 다듬기'
    });

    for (const value of ['가계부 앱', '개인 지출 관리', 'Mobile', '포트폴리오', 'React Native', '미니멀', '빠르게 만들고 다듬기']) {
      assert.ok(prompt.includes(value), `프롬프트에 "${value}" 값이 포함되어야 함`);
    }

    for (const section of [
      '# 프로젝트 목표',
      '# 현재 작업 범위',
      '# 개발 원칙',
      'MVP 우선 개발',
      '기존 구조 분석',
      '영향 범위 확인',
      '더 좋은 구조 제안',
      '사용자 승인 후 구현',
      '테스트 수행',
      '변경 내용 요약'
    ]) {
      assert.ok(prompt.includes(section), `프롬프트에 "${section}" 섹션이 포함되어야 함`);
    }
  });

  test('promptStudio.startProject command is registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('promptStudio.startProject'), '명령이 등록되어 있어야 함');
  });

  test('running the command opens a webview panel with the expected form', async () => {
    await vscode.commands.executeCommand('promptStudio.startProject');

    assert.ok(PromptStudioPanel.currentPanel, '패널이 생성되어야 함');

    const panel = (PromptStudioPanel.currentPanel as any).panel as vscode.WebviewPanel;
    assert.strictEqual(panel.title, 'Prompt Studio: 프로젝트 시작');

    const html = panel.webview.html;
    for (const id of [
      'id="projectName"',
      'id="projectPurpose"',
      'id="platform"',
      'id="devPurpose"',
      'id="techStack"',
      'id="designStyle"',
      'id="devTendency"',
      'id="generateBtn"',
      'id="resultText"'
    ]) {
      assert.ok(html.includes(id), `webview HTML에 ${id} 요소가 있어야 함`);
    }

    panel.dispose();
  });
});
