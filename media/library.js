(function () {
  const vscode = acquireVsCodeApi();

  const list = document.getElementById('list');
  const emptyState = document.getElementById('emptyState');
  const copyButtons = {};

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }

  function renderItem(item) {
    const card = document.createElement('div');
    card.className = 'card prompt-item';

    const header = document.createElement('div');
    header.className = 'item-header';

    const star = document.createElement('button');
    star.className = 'star-btn' + (item.favorite ? ' active' : '');
    star.textContent = item.favorite ? '★' : '☆';
    star.title = '즐겨찾기';
    star.addEventListener('click', () => {
      vscode.postMessage({ command: 'toggleFavorite', id: item.id });
    });

    const titleEl = document.createElement('div');
    titleEl.className = 'item-title';
    titleEl.textContent = item.title;
    titleEl.title = item.title;

    const dateEl = document.createElement('div');
    dateEl.className = 'item-date';
    dateEl.textContent = formatDate(item.updatedAt);

    header.appendChild(star);
    header.appendChild(titleEl);
    header.appendChild(dateEl);

    const textarea = document.createElement('textarea');
    textarea.className = 'item-content';
    textarea.rows = 6;
    textarea.value = item.content;

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'secondary-btn';
    saveBtn.textContent = '수정 저장';
    saveBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'updateContent', id: item.id, content: textarea.value });
    });

    const copyBtn = document.createElement('button');
    copyBtn.className = 'secondary-btn';
    copyBtn.textContent = '복사';
    copyBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'copyToClipboard', id: item.id, text: textarea.value });
    });
    copyButtons[item.id] = copyBtn;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'secondary-btn danger-btn';
    deleteBtn.textContent = '삭제';
    deleteBtn.addEventListener('click', () => {
      vscode.postMessage({ command: 'deletePrompt', id: item.id });
    });

    actions.appendChild(saveBtn);
    actions.appendChild(copyBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(header);
    card.appendChild(textarea);
    card.appendChild(actions);

    return card;
  }

  window.addEventListener('message', (event) => {
    const message = event.data;

    if (message.command === 'showLibrary') {
      list.innerHTML = '';
      Object.keys(copyButtons).forEach((key) => delete copyButtons[key]);

      if (message.items.length === 0) {
        emptyState.hidden = false;
        return;
      }

      emptyState.hidden = true;
      message.items.forEach((item) => {
        list.appendChild(renderItem(item));
      });
    }

    if (message.command === 'copied') {
      const btn = copyButtons[message.id];
      if (btn) {
        const original = btn.textContent;
        btn.textContent = '복사됨';
        setTimeout(() => {
          btn.textContent = original;
        }, 1200);
      }
    }
  });

  vscode.postMessage({ command: 'ready' });
})();
