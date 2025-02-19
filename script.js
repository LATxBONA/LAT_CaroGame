
const size = 15;
const board = document.getElementById("board");
const status = document.getElementById("status");
const resetButton = document.getElementById("reset");
const restartButton = document.getElementById("restart");
const winnerMessage = document.getElementById("winnerMessage");
const scoreA = document.getElementById("scoreA");
const scoreB = document.getElementById("scoreB");

let currentPlayer = "X";
let grid;
let scoreX = 0;
let scoreO = 0;
let gameActive = true;

function initializeGame() {
    board.innerHTML = "";
    grid = Array.from({ length: size }, () => Array(size).fill(""));
    currentPlayer = "X";
    status.textContent = `Lượt: ${currentPlayer}`;
    winnerMessage.style.display = "none";
    gameActive = true;
    createBoard();
}

function createBoard() {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener("click", handleClick);
            board.appendChild(cell);
        }
    }
}

function handleClick(event) {
    if (!gameActive) return;

    let cell = event.target;
    let row = parseInt(cell.dataset.row);
    let col = parseInt(cell.dataset.col);

    if (grid[row][col] !== "") return;

    grid[row][col] = currentPlayer;
    cell.textContent = currentPlayer;

    if (checkWin(row, col, currentPlayer)) {
        gameActive = false;
        updateScore(currentPlayer);
        showWinner(currentPlayer);
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    status.textContent = `Lượt: ${currentPlayer}`;
}

function checkWin(row, col, player) {
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    for (let [dx, dy] of directions) {
        let count = 1;
        for (let i = 1; i < 5; i++) {
            if (row + i * dx >= 0 && row + i * dx < size && 
                col + i * dy >= 0 && col + i * dy < size &&
                grid[row + i * dx][col + i * dy] === player) {
                count++;
            } else break;
        }
        for (let i = 1; i < 5; i++) {
            if (row - i * dx >= 0 && row - i * dx < size && 
                col - i * dy >= 0 && col - i * dy < size &&
                grid[row - i * dx][col - i * dy] === player) {
                count++;
            } else break;
        }
        if (count >= 5) return true;
    }
    return false;
}

function updateScore(winner) {
    if (winner === "X") {
        scoreX++;
        scoreA.textContent = scoreX;
    } else {
        scoreO++;
        scoreB.textContent = scoreO;
    }
}

function showWinner(player) {
    winnerMessage.textContent = `${player} thắng!`;
    winnerMessage.style.display = "block";
    
    // Tự động ẩn thông báo sau 2 giây
    setTimeout(() => {
        winnerMessage.style.display = "none";
    }, 2000);
}

// Reset ván chơi mới nhưng giữ điểm
resetButton.addEventListener("click", () => {
    initializeGame();
});

// Restart toàn bộ game và reset điểm
restartButton.addEventListener("click", () => {
    scoreX = 0;
    scoreO = 0;
    scoreA.textContent = "0";
    scoreB.textContent = "0";
    initializeGame();
});

initializeGame();
