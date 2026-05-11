// launcher.js
document.getElementById("openGameBtn").addEventListener("click", () => {
  const playerName = document.getElementById("playerName").value || "Player";
  const difficulty = document.getElementById("difficulty").value;
  const gameLength = document.getElementById("gameLength").value;
  const sortMode = document.querySelector(
    "input[name='sortMode']:checked",
  ).value;
  const doublePoints = document.getElementById("doublePoints").checked;
  const randomSizes = document.getElementById("randomSizes").checked;

  // Save to localStorage so game.html can read
  localStorage.setItem("ffs_playerName", playerName);
  localStorage.setItem("ffs_difficulty", difficulty);
  localStorage.setItem("ffs_gameLength", gameLength);
  localStorage.setItem("ffs_sortMode", sortMode);
  localStorage.setItem("ffs_doublePoints", doublePoints);
  localStorage.setItem("ffs_randomSizes", randomSizes);

  // Open the game window
  window.location.href = "game.html";
});

const form = document.getElementById("setupForm");
const previewText = document.getElementById("previewText");

function updatePreview() {
  const playerName = document.getElementById("playerName").value || "Player";
  const difficulty = document.getElementById("difficulty").value;
  const gameLength = document.getElementById("gameLength").value;
  const sortMode = document.querySelector(
    "input[name='sortMode']:checked",
  ).value;
  const doublePoints = document.getElementById("doublePoints").checked
    ? "Double points enabled"
    : "Normal scoring";
  const randomSizes = document.getElementById("randomSizes").checked
    ? "Random item sizes"
    : "Standard sizes";

  previewText.innerHTML =
    `Player: ${playerName}<br>` +
    `Difficulty: ${difficulty}<br>` +
    `Length: ${gameLength}s<br>` +
    `Mode: ${sortMode}<br>` +
    `${doublePoints}<br>` +
    `${randomSizes}`;
}

// Update preview whenever something changes
form.addEventListener("input", updatePreview);

// Run once on page load
updatePreview();
