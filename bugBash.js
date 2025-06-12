const grid = document.getElementById('grid');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalScore = document.getElementById('finalScore');
const resetBtn = document.getElementById('resetBtn');

const bugEmoji = '🐛';
const splatEmoji = '💥';
const bombEmoji = '💣';
const numHoles = 12;
let score = 0;
let timeLeft = 30;
let gameInterval;
let bugTimers = [];
let gameOver = false;

// Create holes
for (let i = 0; i < numHoles; i++) {
    const hole = document.createElement('div');
    hole.classList.add('hole');
    hole.dataset.index = i;
    grid.appendChild(hole);
}

function spawnBug() {
    if (gameOver) return;

    const holes = document.querySelectorAll('.hole');
    const availableHoles = [...holes].filter(h => !h.classList.contains('active'));

    if (availableHoles.length === 0) return;

    const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];

    randomHole.classList.add('active');

    // Randomly decide if this is a bug or a bomb (20% chance for bomb)
    const isBomb = Math.random() < 0.2;
    if (isBomb) {
        randomHole.innerHTML = `<span class="bomb">${bombEmoji}</span>`;
        const bomb = randomHole.querySelector('.bomb');
        bomb.addEventListener('click', () => {
            if (gameOver || !randomHole.classList.contains('active')) return;
            score = Math.max(0, score - 10);
            scoreDisplay.textContent = `Score: ${score}`;
            bomb.textContent = '💥';
            bomb.classList.add('squashed');
            setTimeout(() => {
                randomHole.innerHTML = '';
                randomHole.classList.remove('active');
            }, 500);
        });
    } else {
        randomHole.innerHTML = `<span class="bug">${bugEmoji}</span>`;
        const bug = randomHole.querySelector('.bug');
        bug.addEventListener('click', () => {
            if (gameOver || !randomHole.classList.contains('active')) return;
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
            bug.textContent = splatEmoji;
            bug.classList.add('squashed');
            setTimeout(() => {
                randomHole.innerHTML = '';
                randomHole.classList.remove('active');
            }, 500);
        });
    }

    // Remove the bug or bomb after 1.5 seconds if not clicked
    const timerId = setTimeout(() => {
        if (randomHole.classList.contains('active')) {
            randomHole.innerHTML = '';
            randomHole.classList.remove('active');
        }
    }, 1500);

    bugTimers.push(timerId);
}

function startGame() {
    // Reset state
    score = 0;
    timeLeft = 30;
    gameOver = false;
    scoreDisplay.textContent = `Score: ${score}`;
    timerDisplay.textContent = `⏱ 0:30`;
    gameOverMessage.classList.add('hidden');
    // Clear any remaining holes
    const holes = document.querySelectorAll('.hole');
    holes.forEach(hole => {
        hole.innerHTML = '';
        hole.classList.remove('active');
    });
    // Clear any previous timers
    bugTimers.forEach(clearTimeout);
    bugTimers = [];

    gameInterval = setInterval(() => {
        spawnBug();
    }, 800);

    const countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `⏱ 0:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            clearInterval(countdown);
            bugTimers.forEach(clearTimeout);
            endGame();
        }
    }, 1000);

    // Store countdown so we can clear it on reset
    startGame.countdown = countdown;
}

function endGame() {
    gameOver = true;
    const holes = document.querySelectorAll('.hole');
    holes.forEach(hole => {
        hole.innerHTML = '';
        hole.classList.remove('active');
    });
    finalScore.textContent = score;
    gameOverMessage.classList.remove('hidden');
}

// Reset button logic
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        clearInterval(gameInterval);
        if (startGame.countdown) clearInterval(startGame.countdown);
        bugTimers.forEach(clearTimeout);
        bugTimers = [];
        startGame();
    });
}

startGame();