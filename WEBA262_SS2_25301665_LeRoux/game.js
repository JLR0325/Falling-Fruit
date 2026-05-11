// Global State
let playerName = localStorage.getItem("ffs_playerName") || "Player";
let difficulty = localStorage.getItem("ffs_difficulty") || "medium";
let gameLength = parseInt(localStorage.getItem("ffs_gameLength")) || 30;
let sortMode = localStorage.getItem("ffs_sortMode") || "fruit-only";
let doublePoints = localStorage.getItem("ffs_doublePoints") === "true";
let randomSizes = localStorage.getItem("ffs_randomSizes") === "true";

let score = 0;
let correctCount = 0;
let wrongCount = 0;
let lives = 3;
let timeLeft = gameLength;
let gameInterval, timerInterval;
let paused = false;

const basket = document.getElementById("basket");
const gameArea = document.getElementById("gameArea");
const logArea = document.getElementById("logArea");
const ruleArea = document.getElementById("ruleArea");
const messageArea = document.getElementById("messageArea");

// Difficulty Settings
const difficultySettings = {
  easy: { basketWidth: 120, speed: 2, spawnRate: 2000 },
  medium: { basketWidth: 90, speed: 3, spawnRate: 1500 },
  hard: { basketWidth: 60, speed: 4, spawnRate: 1000 },
};

// Items
const items = [
  { name: "🍎", type: "fruit", healthy: true, colour: "red" },
  { name: "🍌", type: "fruit", healthy: true, colour: "yellow" },
  { name: "🍔", type: "junk", healthy: false, colour: "brown" },
  { name: "🥕", type: "vegetable", healthy: true, colour: "orange" },
  { name: "🍩", type: "junk", healthy: false, colour: "pink" },
  { name: "🍇", type: "fruit", healthy: true, colour: "purple" },
];

// Utility Functions
function updateStats() {
  document.getElementById("displayPlayer").textContent = playerName;
  document.getElementById("displayScore").textContent = score;
  document.getElementById("displayCorrect").textContent = correctCount;
  document.getElementById("displayWrong").textContent = wrongCount;
  document.getElementById("displayLives").textContent = lives;
  document.getElementById("displayTimeLeft").textContent = timeLeft + " s";
}

function log(message) {
  const p = document.createElement("p");
  p.textContent = message;
  logArea.appendChild(p);
  logArea.scrollTop = logArea.scrollHeight;
}

function setRuleText() {
  if (sortMode === "fruit-only") {
    ruleArea.textContent = "Catch Fruit Only!";
  } else if (sortMode === "healthy-only") {
    ruleArea.textContent = "Catch Healthy Food Only!";
  } else {
    ruleArea.textContent = "Catch items of one colour group!";
  }
}

// Basket Movement
let basketX = 150;
function moveBasket(direction) {
  const step = 20;
  if (direction === "left") basketX -= step;
  if (direction === "right") basketX += step;
  basketX = Math.max(
    0,
    Math.min(gameArea.offsetWidth - basket.offsetWidth, basketX),
  );
  basket.style.left = basketX + "px";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveBasket("left");
  if (e.key === "ArrowRight") moveBasket("right");
});

// Game Mechanics
function spawnItem() {
  const item = items[Math.floor(Math.random() * items.length)];
  const div = document.createElement("div");
  div.className = "falling-item " + item.name;
  div.textContent = item.name;
  div.dataset.type = item.type;
  div.dataset.healthy = item.healthy;
  div.dataset.colour = item.colour;
  div.style.left = Math.random() * (gameArea.offsetWidth - 40) + "px";
  if (randomSizes) {
    const size = 20 + Math.random() * 30;
    div.style.fontSize = size + "px";
  }
  gameArea.appendChild(div);

  let posY = 0;
  const speed = difficultySettings[difficulty].speed;
  const fallInterval = setInterval(() => {
    if (paused) return;
    posY += speed;
    div.style.top = posY + "px";

    // Collision with basket
    const basketRect = basket.getBoundingClientRect();
    const itemRect = div.getBoundingClientRect();
    if (
      itemRect.bottom >= basketRect.top &&
      itemRect.left < basketRect.right &&
      itemRect.right > basketRect.left
    ) {
      handleCatch(item, div);
      clearInterval(fallInterval);
      div.remove();
    }

    // Missed item
    if (posY > gameArea.offsetHeight - 20) {
      handleMiss(item);
      clearInterval(fallInterval);
      div.remove();
    }
  }, 20);
}

function handleCatch(item, div) {
  let isCorrect = false;
  if (sortMode === "fruit-only" && item.type === "fruit") isCorrect = true;
  if (sortMode === "healthy-only" && item.healthy) isCorrect = true;
  if (sortMode === "colour-mode" && item.colour === "red") isCorrect = true; // Example: target red group

  if (isCorrect) {
    let points = doublePoints ? 2 : 1;
    score += points;
    correctCount++;
    log("Caught correct item: " + item.name + " (+ " + points + ")");
  } else {
    score -= 1;
    wrongCount++;
    lives--;
    log("Caught wrong item: " + item.name + " (-1, life lost)");
  }
  updateStats();
}

function handleMiss(item) {
  if (sortMode === "fruit-only" && item.type === "fruit") {
    lives--;
    log("Missed fruit: " + item.name + " (life lost)");
  }
  if (sortMode === "healthy-only" && item.healthy) {
    lives--;
    log("Missed healthy item: " + item.name + " (life lost)");
  }
  if (sortMode === "colour-mode" && item.colour === "red") {
    lives--;
    log("Missed target colour: " + item.name + " (life lost)");
  }
  updateStats();
}

// Game Controls
function startGame() {
  resetGame();
  setRuleText();
  messageArea.textContent = "Game started!";
  updateStats();

  gameInterval = setInterval(
    spawnItem,
    difficultySettings[difficulty].spawnRate,
  );
  timerInterval = setInterval(() => {
    if (!paused) {
      timeLeft--;
      updateStats();
      if (timeLeft <= 0 || lives <= 0) endGame();
    }
  }, 1000);
}

function pauseGame() {
  paused = !paused;
  messageArea.textContent = paused ? "Game paused." : "Game resumed.";
}

function saveSession() {
  const state = { score, correctCount, wrongCount, lives, timeLeft };
  localStorage.setItem("ffs_gameState", JSON.stringify(state));
  log("Game session saved.");
}

function loadSession() {
  const state = JSON.parse(localStorage.getItem("ffs_gameState"));
  if (state) {
    score = state.score;
    correctCount = state.correctCount;
    wrongCount = state.wrongCount;
    lives = state.lives;
    timeLeft = state.timeLeft;
    updateStats();
    log("Game session loaded.");
  }
}

function resetGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  lives = 3;
  timeLeft = gameLength;
  gameArea.querySelectorAll(".falling-item").forEach((el) => el.remove());
  updateStats();
  log("Game reset.");
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  messageArea.textContent = "Game over! Final score: " + score;
  log("Game ended.");

  alert("Game Over!\nYour final score is: " + score);
}

// Button Events
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", pauseGame);
document.getElementById("saveBtn").addEventListener("click", saveSession);
document.getElementById("loadBtn").addEventListener("click", loadSession);
document.getElementById("resetBtn").addEventListener("click", resetGame);
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});

// Initialize
basket.style.width = difficultySettings[difficulty].basketWidth + "px";
basket.style.left = basketX + "px";
updateStats();
setRuleText();
