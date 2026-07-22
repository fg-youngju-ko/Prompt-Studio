(function () {
  const vscode = acquireVsCodeApi();

  const apiKeyInput = document.getElementById('apiKey');
  const saveKeyBtn = document.getElementById('saveKeyBtn');
  const keyStatus = document.getElementById('keyStatus');

  const ideaInput = document.getElementById('idea');
  const askBtn = document.getElementById('askBtn');
  const ideaError = document.getElementById('ideaError');

  const questionsCard = document.getElementById('questionsCard');
  const questionsList = document.getElementById('questionsList');
  const generateBtn = document.getElementById('generateBtn');

  const promptError = document.getElementById('promptError');

  const resultCard = document.getElementById('resultCard');
  const resultText = document.getElementById('resultText');
  const copyBtn = document.getElementById('copyBtn');
  const saveBtn = document.getElementById('saveBtn');

  let currentIdea = '';

  saveKeyBtn.addEventListener('click', () => {
    vscode.postMessage({ command: 'saveApiKey', apiKey: apiKeyInput.value });
    apiKeyInput.value = '';
  });

  askBtn.addEventListener('click', () => {
    const idea = ideaInput.value.trim();
    ideaError.hidden = true;

    if (!idea) {
      ideaError.textContent = '아이디어를 한 줄 입력해 주세요.';
      ideaError.hidden = false;
      return;
    }

    currentIdea = idea;
    askBtn.disabled = true;
    askBtn.textContent = '질문 생성 중...';
    vscode.postMessage({ command: 'getQuestions', idea });
  });

  generateBtn.addEventListener('click', () => {
    const items = questionsList.querySelectorAll('.question-item');
    const qa = Array.from(items).map((item) => ({
      question: item.querySelector('p').textContent,
      answer: item.querySelector('textarea').value
    }));

    promptError.hidden = true;
    generateBtn.disabled = true;
    generateBtn.textContent = '프롬프트 생성 중...';
    vscode.postMessage({ command: 'generatePrompt', idea: currentIdea, qa });
  });

  copyBtn.addEventListener('click', () => {
    vscode.postMessage({ command: 'copyToClipboard', text: resultText.textContent });
  });

  saveBtn.addEventListener('click', () => {
    vscode.postMessage({ command: 'saveToLibrary', title: currentIdea, content: resultText.textContent });
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

    if (message.command === 'apiKeyStatus') {
      if (message.hasKey) {
        keyStatus.textContent = '키가 저장되어 있습니다.';
        keyStatus.classList.add('ok');
      } else {
        keyStatus.textContent = '키가 저장되어 있지 않습니다.';
        keyStatus.classList.remove('ok');
      }
    }

    if (message.command === 'showQuestions') {
      askBtn.disabled = false;
      askBtn.textContent = '질문받기';

      questionsList.innerHTML = '';
      message.questions.forEach((q) => {
        const item = document.createElement('div');
        item.className = 'question-item';

        const p = document.createElement('p');
        p.textContent = q.question;

        const textarea = document.createElement('textarea');
        textarea.rows = 2;
        textarea.placeholder = '답변을 입력하세요';
        textarea.value = q.suggestedAnswer || '';

        item.appendChild(p);
        item.appendChild(textarea);
        questionsList.appendChild(item);
      });

      questionsCard.hidden = false;
      questionsCard.scrollIntoView({ behavior: 'smooth' });
    }

    if (message.command === 'questionsError') {
      askBtn.disabled = false;
      askBtn.textContent = '질문받기';
      ideaError.textContent = message.error;
      ideaError.hidden = false;
    }

    if (message.command === 'promptError') {
      generateBtn.disabled = false;
      generateBtn.textContent = '프롬프트 생성';
      promptError.textContent = message.error;
      promptError.hidden = false;
    }

    if (message.command === 'showPrompt') {
      generateBtn.disabled = false;
      generateBtn.textContent = '프롬프트 생성';
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

  vscode.postMessage({ command: 'ready' });
})();
