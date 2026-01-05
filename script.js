const crosswordConfig = {
  rows: 10,
  cols: 18,
  words: [
    { key: 'HAPPY', answer: 'HAPPY', row: 1, col: 6, direction: 'across', hidden: true, prefill: [0, 1, 2, 3, 4] },
    { key: 'BIRTHDAY', answer: 'BIRTHDAY', row: 4, col: 3, direction: 'across', hidden: true, prefill: [0, 1, 2, 3, 4, 5, 6, 7] },
    { key: 'SHANU', answer: 'SHANU', row: 6, col: 10, direction: 'across', hidden: true, prefill: [0, 1, 2, 3, 4] },
    { key: 'LIME', answer: 'LIME', row: 0, col: 5, direction: 'down', clue: 'Zesty green fruit' },
    { key: 'PONY', answer: 'PONY', row: 0, col: 11, direction: 'down', clue: 'Small horse' },
    { key: 'HUG', answer: 'HUG', row: 0, col: 7, direction: 'across', clue: 'Squeeze with affection' },
    { key: 'GIG', answer: 'GIG', row: 0, col: 13, direction: 'down', clue: 'One-night performance' },
    { key: 'NEST', answer: 'NEST', row: 3, col: 0, direction: 'across', clue: 'Snug bird home' },
    { key: 'IMAGE', answer: 'IMAGE', row: 8, col: 0, direction: 'across', clue: 'Picture or likeness' },
    { key: 'MAGIC', answer: 'MAGIC', row: 0, col: 2, direction: 'down', clue: 'A kind of sparkle' },
    { key: 'LEI', answer: 'LEI', row: 0, col: 15, direction: 'down', clue: 'Flower garland' },
  ],
};

const boardEl = document.getElementById('crossword-board');
const wordListEl = document.getElementById('word-list');
const celebrationEl = document.getElementById('celebration');
const overlayEl = document.getElementById('intro-overlay');
const confettiCanvas = document.getElementById('confetti');

let grid = [];
let wordStatus = {};
let cellsByPosition = new Map();
let celebrationStarted = false;

function buildGrid() {
  grid = Array.from({ length: crosswordConfig.rows }, () => Array(crosswordConfig.cols).fill(null));
  wordStatus = {};
  boardEl.innerHTML = '';

  crosswordConfig.words.forEach((word, wordIndex) => {
    const positions = [];
    for (let i = 0; i < word.answer.length; i++) {
      const row = word.direction === 'across' ? word.row : word.row + i;
      const col = word.direction === 'across' ? word.col + i : word.col;
      positions.push({ row, col, letter: word.answer[i], prefilled: word.prefill?.includes(i) });
    }
    wordStatus[word.key] = { positions, solved: false };

    positions.forEach((pos, charIndex) => {
      if (!grid[pos.row][pos.col]) {
        grid[pos.row][pos.col] = {
          letter: '',
          prefilled: pos.prefilled,
          solution: pos.letter,
          words: [word.key],
        };
      } else {
        grid[pos.row][pos.col].words.push(word.key);
        grid[pos.row][pos.col].solution = pos.letter;
      }
    });
  });

  for (let r = 0; r < crosswordConfig.rows; r++) {
    for (let c = 0; c < crosswordConfig.cols; c++) {
      const cellData = grid[r][c];
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (!cellData) {
        cell.classList.add('empty');
      } else {
        const inner = document.createElement('div');
        inner.className = 'inner filled';

        const input = document.createElement('input');
        input.maxLength = 1;
        input.dataset.row = r;
        input.dataset.col = c;
        input.value = cellData.prefilled ? cellData.solution : '';
        input.readOnly = Boolean(cellData.prefilled);
        if (cellData.prefilled) {
          cell.classList.add('prefilled');
        }

        input.addEventListener('input', handleInput);
        input.addEventListener('focus', (e) => e.target.select());

        inner.appendChild(input);
        cell.appendChild(inner);
        cellsByPosition.set(`${r}-${c}`, cell);
      }

      boardEl.appendChild(cell);
    }
  }

  renderWordList();
}

function renderWordList() {
  wordListEl.innerHTML = '';
  crosswordConfig.words.forEach((word) => {
    const li = document.createElement('li');
    li.textContent = `${word.key} (${word.direction})${word.clue ? ' - ' + word.clue : ''}`;
    li.id = `word-${word.key}`;
    wordListEl.appendChild(li);
  });
}

function handleInput(event) {
  const input = event.target;
  input.value = input.value.toUpperCase().slice(-1);
  validateWords();
}

function validateWords() {
  crosswordConfig.words.forEach((word) => {
    const letters = [];
    const positions = wordStatus[word.key].positions;

    for (const pos of positions) {
      const cell = grid[pos.row][pos.col];
      const cellEl = cellsByPosition.get(`${pos.row}-${pos.col}`);
      if (!cell) continue;
      const val = cell.prefilled ? cell.solution : cellEl.querySelector('input').value;
      letters.push(val || '');
    }

    const wordComplete = letters.every((char) => char !== '');
    const wordCorrect = wordComplete && letters.join('') === word.answer;
    wordStatus[word.key].solved = wordCorrect;

    positions.forEach((pos) => {
      const cellEl = cellsByPosition.get(`${pos.row}-${pos.col}`);
      if (!cellEl) return;
      cellEl.classList.remove('correct', 'incorrect');
      if (wordCorrect) {
        cellEl.classList.add('correct');
      } else if (wordComplete) {
        cellEl.classList.add('incorrect');
      }
    });

    const clueEl = document.getElementById(`word-${word.key}`);
    if (clueEl) {
      clueEl.style.opacity = wordCorrect ? '1' : '0.7';
      clueEl.style.textDecoration = wordCorrect ? 'line-through' : 'none';
    }
  });

  checkHiddenMessage();
}

function checkHiddenMessage() {
  const hiddenWords = crosswordConfig.words.filter((w) => w.hidden);
  const allHiddenSolved = hiddenWords.every((w) => wordStatus[w.key].solved);
  const allWordsSolved = crosswordConfig.words.every((w) => wordStatus[w.key].solved);

  hiddenWords.forEach((word) => {
    wordStatus[word.key].positions.forEach((pos) => {
      const cellEl = cellsByPosition.get(`${pos.row}-${pos.col}`);
      if (!cellEl) return;
      if (allHiddenSolved && allWordsSolved) {
        cellEl.classList.remove('correct', 'incorrect');
        cellEl.classList.add('hidden-message');
      } else if (wordStatus[word.key].solved) {
        cellEl.classList.add('correct');
      } else {
        cellEl.classList.remove('hidden-message');
      }
    });
  });

  if (allHiddenSolved && allWordsSolved && !celebrationStarted) {
    triggerCelebration();
  }
}

function triggerCelebration() {
  celebrationStarted = true;
  celebrationEl.classList.add('visible');
  startConfetti();
}

function startConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  const w = (confettiCanvas.width = window.innerWidth);
  const h = (confettiCanvas.height = window.innerHeight);
  const pieces = Array.from({ length: 160 }, () => createPiece(w, h));

  function createPiece(width, height) {
    const colors = ['#ffd166', '#f4a261', '#81c784', '#90caf9', '#ff80ab'];
    return {
      x: Math.random() * width,
      y: Math.random() * height - height,
      rotation: Math.random() * 360,
      size: 8 + Math.random() * 12,
      speed: 2 + Math.random() * 3,
      drift: Math.random() * 2 - 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    pieces.forEach((p) => {
      p.y += p.speed;
      p.x += p.drift;
      p.rotation += p.drift;

      if (p.y > h) {
        p.y = -10;
        p.x = Math.random() * w;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }

  draw();
}

function launchIntro() {
  const monkey = document.querySelector('.monkey-wrapper');
  setTimeout(() => monkey?.classList.add('exit'), 6200);
  setTimeout(() => {
    overlayEl.classList.add('hidden');
    setTimeout(() => overlayEl.remove(), 800);
  }, 7000);
}

function init() {
  buildGrid();
  document.querySelectorAll('.pop-text span').forEach((span, idx) => {
    span.style.setProperty('--i', idx);
  });
  launchIntro();
}

window.addEventListener('resize', () => {
  if (celebrationStarted) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
});

init();
