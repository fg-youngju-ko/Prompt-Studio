(function () {
  const vscode = acquireVsCodeApi();

  const generateBtn = document.getElementById('generateBtn');
  const resultCard = document.getElementById('resultCard');
  const resultText = document.getElementById('resultText');

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

  window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === 'showPrompt') {
      resultText.textContent = message.prompt;
      resultCard.hidden = false;
      resultCard.scrollIntoView({ behavior: 'smooth' });
    }
  });
})();
