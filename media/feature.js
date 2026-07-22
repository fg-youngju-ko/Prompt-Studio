(function () {
  const vscode = acquireVsCodeApi();

  const categoryButtons = Array.from(document.querySelectorAll('.category-btn'));
  const categoryError = document.getElementById('categoryError');

  const descriptionInput = document.getElementById('description');
  const descriptionError = document.getElementById('descriptionError');

  const generateBtn = document.getElementById('generateBtn');
  const resultCard = document.getElementById('resultCard');
  const resultText = document.getElementById('resultText');
  const copyBtn = document.getElementById('copyBtn');
  const saveBtn = document.getElementById('saveBtn');

  let selectedCategory = '';

  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedCategory = btn.dataset.category;
      categoryError.hidden = true;
    });
  });

  generateBtn.addEventListener('click', () => {
    categoryError.hidden = true;
    descriptionError.hidden = true;

    if (!selectedCategory) {
      categoryError.hidden = false;
      return;
    }

    const description = descriptionInput.value.trim();
    if (!description) {
      descriptionError.textContent = '구현하고 싶은 내용을 입력해 주세요.';
      descriptionError.hidden = false;
      return;
    }

    vscode.postMessage({ command: 'generate', category: selectedCategory, description });
  });

  copyBtn.addEventListener('click', () => {
    vscode.postMessage({ command: 'copyToClipboard', text: resultText.textContent });
  });

  saveBtn.addEventListener('click', () => {
    const title = selectedCategory ? `${selectedCategory} 기능 구현` : '기능 구현 프롬프트';
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
