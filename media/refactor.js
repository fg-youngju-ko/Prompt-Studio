(function () {
  const vscode = acquireVsCodeApi();

  const targetInput = document.getElementById('target');
  const reasonInput = document.getElementById('reason');
  const formError = document.getElementById('formError');

  const generateBtn = document.getElementById('generateBtn');
  const resultCard = document.getElementById('resultCard');
  const resultText = document.getElementById('resultText');

  generateBtn.addEventListener('click', () => {
    formError.hidden = true;

    const target = targetInput.value.trim();

    if (!target) {
      formError.textContent = '리팩토링 대상을 입력해 주세요.';
      formError.hidden = false;
      return;
    }

    vscode.postMessage({
      command: 'generate',
      target,
      reason: reasonInput.value
    });
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
