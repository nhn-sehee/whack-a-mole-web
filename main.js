console.log('main.js 로드됨');

const container = document.getElementById('game-container');
console.log('container 요소', container);

let score = 0;
let level = 1;
let spawnInterval = 1500;
let showTime = 800;

// DOM refs for UI
const levelEl = document.getElementById('level');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');

function updateLevel() {
  levelEl.textContent = '레벨: ' + level;
}

// control game loop reference
let gameLoop;

// remove automatic level-up timer; we'll check based on score

const scoreEl = document.getElementById('score');
function updateScore() {
  scoreEl.textContent = '점수: ' + score;
}

// load bomb sound (place file named bomb.mp3 or bomb.wav in the project folder)
const bombSound = new Audio('bomb.mp3');
bombSound.volume = 0.5; // adjust as desired

function spawnMole() {
  // decide whether this spawn is a normal mole or a bomb
  const isBomb = Math.random() < 0.15; // 15% chance of bomb
  const mole = document.createElement('div');
  mole.className = isBomb ? 'bomb' : 'mole';
  mole.value = isBomb ? -50 : level * 10;  // bomb deducts fixed amount

  // log for debugging
  if (isBomb) console.log('spawned bomb mole');

  mole.style.left = Math.random() * (container.clientWidth-80) + 'px';
  mole.style.top  = Math.random() * (container.clientHeight-80) + 'px';

  mole.addEventListener('click', () => {
    score += mole.value;
    updateScore();
    container.removeChild(mole);
    if (isBomb) {
      // play bomb sound if available
      if (bombSound && typeof bombSound.play === 'function') bombSound.play().catch(()=>{});
    }
    // small chance to flip the screen on normal mole click
    if (!isBomb && Math.random() < 0.1) flipScreen();

    // check for level-up based on score after scoring
    tryLevelUp();
  });

  container.appendChild(mole);
  setTimeout(() => {
    if (container.contains(mole)) container.removeChild(mole);
  }, showTime);
}

// level-up logic
function levelUp() {
  level++;
  // speed scaling: aggressive until level 10, then more gradual
  if (level <= 10) {
    spawnInterval = Math.max(200, spawnInterval * 0.8); // 20% faster
    showTime = Math.max(100, showTime * 0.85);         // 15% shorter
  } else {
    spawnInterval = Math.max(150, spawnInterval * 0.95); // only 5% faster
    showTime = Math.max(80, showTime * 0.95);           // softer reduction
  }
  container.className = 'level-' + level;
  updateLevel();

  // restart mole spawner with new interval
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(spawnMole, spawnInterval);
}

// level-up condition based on score
function tryLevelUp() {
  const required = level * 50;
  if (score >= required) {
    levelUp();
  }
}

// start game only after clicking
function startGame() {
  startScreen.style.display = 'none';
  updateLevel();
  gameLoop = setInterval(spawnMole, spawnInterval);
  // no automatic timer; leveling happens with score
}

startButton.addEventListener('click', startGame);

// flip screen helper
function flipScreen() {
  container.classList.add('flipped');
  setTimeout(() => container.classList.remove('flipped'), 800);
}
