import { ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

const size = 15;
const board = document.getElementById("board");
const status = document.getElementById("status");
const resetButton = document.getElementById("reset");
const restartButton = document.getElementById("restart");
const winnerMessage = document.getElementById("winnerMessage");
const scoreA = document.getElementById("scoreA");
const scoreB = document.getElementById("scoreB");
const createGameBtn = document.getElementById("createGame");
const joinGameBtn = document.getElementById("joinGame");
const gameCodeInput = document.getElementById("gameCode");
const roomInfo = document.getElementById("roomInfo");

let currentPlayer = "X";
let grid;
let scoreX = 0;
let scoreO = 0;
let gameActive = true;
let gameId = null;
let playerId = null;
const database = window.database;

// Khởi tạo game
function initializeGame() {
    board.innerHTML = "";
    grid = Array.from({ length: size }, () => Array(size).fill(""));
    currentPlayer = "X";
    status.textContent = `Lượt: ${currentPlayer}`;
    winnerMessage.style.display = "none";
    gameActive = true;
    createBoard();
}

// Tạo game mới
async function createNewGame() {
    gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    playerId = "X";
    
    const gameRef = ref(database, `games/${gameId}`);
    await set(gameRef, {
        grid: grid,
        currentPlayer: "X",
        status: "waiting",
        scoreX: 0,
        scoreO: 0
    });

    roomInfo.textContent = `Mã phòng: ${gameId}`;
    initializeGameListeners();
}

// Tham gia game
async function joinGame(code) {
    const gameRef = ref(database, `games/${code}`);
    try {
        const snapshot = await get(gameRef);
        if (snapshot.exists() && snapshot.val().status === "waiting") {
            gameId = code;
            playerId = "O";
            await set(gameRef, {
                ...snapshot.val(),
                status: "playing"
            });
            
            roomInfo.textContent = `Đã vào phòng: ${gameId}`;
            initializeGameListeners();
        } else {
            alert("Không tìm thấy phòng hoặc phòng đã đầy!");
        }
    } catch (error) {
        alert("Lỗi khi tham gia phòng: " + error.message);
    }
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
    if (!gameActive || !gameId || currentPlayer !== playerId) return;

    let cell = event.target;
    let row = parseInt(cell.dataset.row);
    let col = parseInt(cell.dataset.col);

    if (grid[row][col] !== "") return;

    grid[row][col] = currentPlayer;
    
    // Cập nhật Firebase
    const gameRef = ref(database, `games/${gameId}`);
    if (checkWin(row, col, currentPlayer)) {
        updateScore(currentPlayer);
        showWinner(currentPlayer);
        set(gameRef, {
            grid: grid,
            currentPlayer: currentPlayer === "X" ? "O" : "X",
            status: "ended",
            scoreX: scoreX,
            scoreO: scoreO
        });
    } else {
        set(gameRef, {
            grid: grid,
            currentPlayer: currentPlayer === "X" ? "O" : "X",
            status: "playing",
            scoreX: scoreX,
            scoreO: scoreO
        });
    }
}

function initializeGameListeners() {
    const gameRef = ref(database, `games/${gameId}`);
    onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        grid = data.grid;
        currentPlayer = data.currentPlayer;
        scoreX = data.scoreX;
        scoreO = data.scoreO;
        
        updateBoard();
        updateStatus();
        updateScore();
    });
}

function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.textContent = grid[row][col];
    });
}

function updateStatus() {
    status.textContent = `Lượt: ${currentPlayer}`;
}

function updateScore() {
    scoreA.textContent = scoreX;
    scoreB.textContent = scoreO;
}

// Event Listeners
createGameBtn.addEventListener('click', createNewGame);
joinGameBtn.addEventListener('click', () => {
    const code = gameCodeInput.value.toUpperCase();
    if (code) joinGame(code);
});

resetButton.addEventListener("click", () => {
    if (gameId) {
        initializeGame();
        const gameRef = ref(database, `games/${gameId}`);
        set(gameRef, {
            grid: grid,
            currentPlayer: "X",
            status: "playing",
            scoreX: scoreX,
            scoreO: scoreO
        });
    }
});

restartButton.addEventListener("click", () => {
    if (gameId) {
        scoreX = 0;
        scoreO = 0;
        initializeGame();
        const gameRef = ref(database, `games/${gameId}`);
        set(gameRef, {
            grid: grid,
            currentPlayer: "X",
            status: "playing",
            scoreX: 0,
            scoreO: 0
        });
    }
});

// Khởi tạo game ban đầu
initializeGame();