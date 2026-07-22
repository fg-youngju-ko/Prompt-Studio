(function () {
  const vscode = acquireVsCodeApi();

  const generateBtn = document.getElementById('generateBtn');
  const resultCard = document.getElementById('resultCard');
  const resultText = document.getElementById('resultText');
  const copyBtn = document.getElementById('copyBtn');
  const saveBtn = document.getElementById('saveBtn');

  generateBtn.addEventListener('click', () => {
    const data = {
      projectName: document.getElementById('projectName').value,
      projectPurpose: document.getElementById('projectPurpose').value,
      platform: document.getElementById('platform').value,
      devPurpose: document.getElementById('devPurpose').value,
      techStack: document.getElementById('techStack').value,
      designStyle: document.getElementById('designStyle').value,
      devTendency: document.getElementById('devTendency').value
    };

    vscode.postMessage({ command: 'generate', data });
  });

  copyBtn.addEventListener('click', () => {
    vscode.postMessage({ command: 'copyToClipboard', text: resultText.textContent });
  });

  saveBtn.addEventListener('click', () => {
    const title = document.getElementById('projectName').value || '프로젝트 시작 프롬프트';
    vscode.postMessage({ command: 'saveToLibrary', title, content: resultText.textContent });
  });

  function flashButton(btn, tempLabel) {
    const original = btn.textContent;
    btn.textContent = tempLabel;
    setTimeout(() => {
      btn.textContent = original;
    }, 1200);
  }

  window.addEventListener('message', (event) => {
    const message = event.data;

    if (message.command === 'showPrompt') {
      resultText.textContent = message.prompt;
      resultCard.hidden = false;
      resultCard.scrollIntoView({ behavior: 'smooth' });
    }

    if (message.command === 'copied') {
      flashButton(copyBtn, '복사됨');
    }

    if (message.command === 'saved') {
      flashButton(saveBtn, '저장됨');
    }
  });
})();
