(function () {
  const vscode = acquireVsCodeApi();

  const symptomInput = document.getElementById('symptom');
  const errorMessageInput = document.getElementById('errorMessage');
  const desiredResultInput = document.getElementById('desiredResult');
  const formError = document.getElementById('formError');

  const generateBtn = document.getElementById('generateBtn');
  const resultCard = document.getElementById('resultCard');
  const resultText = document.getElementById('resultText');

  generateBtn.addEventListener('click', () => {
    formError.hidden = true;

    const symptom = symptomInput.value.trim();
    const desiredResult = desiredResultInput.value.trim();

    if (!symptom || !desiredResult) {
      formError.textContent = '증상과 원하는 결과는 꼭 입력해 주세요.';
      formError.hidden = false;
      return;
    }

    vscode.postMessage({
      command: 'generate',
      symptom,
      errorMessage: errorMessageInput.value,
      desiredResult
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
