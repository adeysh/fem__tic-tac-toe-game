const cpuBtn = document.getElementById("button-cpu");
const vsPlayerBtn = document.getElementById("button-vs-player");

const turn = document.getElementById("turn");
const restartBtn = document.getElementById("restart-btn");
const body = document.getElementById("body");
const header = document.getElementById("header");
const main = document.getElementById("main");
const menu = document.getElementById("menu");
const menuForm = document.getElementById("menu-form");

const gameScreenTemplate = document.getElementById("game-screen");

const overlay = document.getElementById("overlay");
const overlayWinMessage = document.getElementById("overlay-win-message");
const overlayWinPlayer = document.getElementById("overlay-win-player");
const overlayWinIconX = overlayWinPlayer.querySelector(".overlay__win-icon--X");
const overlayWinIconO = overlayWinPlayer.querySelector(".overlay__win-icon--O");

const quitBtn = document.getElementById("quit-btn");
const nextRoundBtn = document.getElementById("next-round-btn");

let currentGameState = null;
let originalGameStateForCurrentSession = null;

function createInitialGameState(formData) {
    return {
        mode: formData["menu-choice"] === "cpu" ? "CPU" : "Player",
        userMark: formData["mark"],
        player2Mark: formData["mark"] === "X" ? "O" : "X",
        currentTurn: "X",
        board: ["", "", "", "", "", "", "", "", ""],
        scores: {
            X: 0,
            O: 0,
            ties: 0
        },
        isGameOver: false,
        winner: null,
        hasGameStarted: false
    };
}


function initGame(formData) {
    const initialStateBasedOnForm = createInitialGameState(formData);

    originalGameStateForCurrentSession = JSON.parse(JSON.stringify(initialStateBasedOnForm));

    currentGameState = JSON.parse(JSON.stringify(initialStateBasedOnForm));
    currentGameState.hasGameStarted = true;
}

function displayBoardAndStats() {
    const clone = gameScreenTemplate.content.cloneNode(true);
    main.appendChild(clone);

    setupBoardEventListeners();
    updateTurnIcon(currentGameState);
    updateScores(currentGameState);
}

function updateTurnIcon(currentGameState) {
    const iconX = turn.querySelector(".turn__icon--X");
    const iconO = turn.querySelector(".turn__icon--O");

    if (currentGameState.currentTurn === "X") {
        if (iconX.classList.contains("hidden")) {
            iconX.classList.remove("hidden");
        }

        if (!iconO.classList.contains("hidden")) {
            iconO.classList.add("hidden");
        }
    } else {
        if (!iconX.classList.contains("hidden")) {
            iconX.classList.add("hidden");
        }

        if (iconO.classList.contains("hidden")) {
            iconO.classList.remove("hidden");
        }
    }
}

const winPatterns = {
    rows: [[0, 1, 2], [3, 4, 5], [6, 7, 8]],
    columns: [[0, 3, 6], [1, 4, 7], [2, 5, 8]],
    diagonals: [[0, 4, 8], [2, 4, 6]]
};

function checkWinOrTie(currentGameState, tileIndex) {
    const board = currentGameState.board;

    for (const winningLine in winPatterns) {

        for (const winPattern of winPatterns[winningLine]) {

            const isWinningPattern = winPattern.every(index => board[index] === currentGameState.currentTurn);

            if (isWinningPattern) {
                currentGameState.isGameOver = true;
                currentGameState.winner = currentGameState.currentTurn;

                if (currentGameState.currentTurn === "X") {
                    currentGameState.scores.X++;
                } else {
                    currentGameState.scores.O++;
                }
                updateScores(currentGameState);
                displayOverlay(currentGameState);
                return;
            }

        }

        if (board.every(cell => cell !== "") && !currentGameState.isGameOver) {
            currentGameState.isGameOver = true;
            currentGameState.scores.ties++;
            updateScores(currentGameState);
            displayOverlay(currentGameState);
            console.log(currentGameState);
        }
    }
}

function displayOverlay(currentGameState) {
    overlay.classList.remove("hidden");

    if (currentGameState.winner === null) {
        console.log(overlayWinMessage.textContent);
        overlayWinMessage.textContent = "Nobody";
        overlayWinPlayer.innerHTML = "";
        overlayWinPlayer.textContent = "Game Tied!";
        return;
    }

    if (currentGameState.mode === "CPU") {
        if (currentGameState.userMark === "X") {
            if (currentGameState.winner === "X") {
                overlayWinMessage.textContent = "You";
                overlayWinPlayer.classList.add("overlay__win-player--X");
                overlayWinIconX.classList.remove("hidden");
            } else {
                overlayWinMessage.textContent = "CPU";
                overlayWinPlayer.classList.add("overlay__win-player--O");
                overlayWinIconO.classList.remove("hidden");
            }
        } else {
            if (currentGameState.winner === "O") {
                overlayWinMessage.textContent = "You";
                overlayWinPlayer.classList.add("overlay__win-player--O");
                overlayWinIconO.classList.remove("hidden");
            } else {
                overlayWinMessage.textContent = "CPU";
                overlayWinPlayer.classList.add("overlay__win-player--X");
                overlayWinIconX.classList.remove("hidden");
            }
        }
    } else {
        if (currentGameState.userMark === "X") {
            if (currentGameState.winner === "X") {
                overlayWinMessage.textContent = "Player 1";
                overlayWinPlayer.classList.add("overlay__win-player--X");
                overlayWinIconX.classList.remove("hidden");
            } else {
                overlayWinMessage.textContent = "Player 2";
                overlayWinPlayer.classList.add("overlay__win-player--O");
                overlayWinIconO.classList.remove("hidden");
            }
        } else {
            if (currentGameState.winner === "O") {
                overlayWinMessage.textContent = "Player 1";
                overlayWinPlayer.classList.add("overlay__win-player--O");
                overlayWinIconO.classList.remove("hidden");
            } else {
                overlayWinMessage.textContent = "Player 2";
                overlayWinPlayer.classList.add("overlay__win-player--X");
                overlayWinIconX.classList.remove("hidden");
            }
        }
    }
}

function toggleTurn(currentGameState) {
    if (currentGameState.currentTurn === "X") {
        currentGameState.currentTurn = "O";
    } else {
        currentGameState.currentTurn = "X";
    }
    updateTurnIcon(currentGameState);
}

function updateScores(currentGameState) {
    const player1Notation = document.getElementById("player1-notation");
    const player1Score = document.getElementById("player1-score");

    const ties = document.getElementById("ties");

    const player2Notation = document.getElementById("player2-notation");
    const player2Score = document.getElementById("player2-score");

    // console.log(currentGameState);

    if (currentGameState.mode === "CPU") {
        if (currentGameState.userMark === "X") {
            player1Notation.textContent = "You";
            player2Notation.textContent = "CPU";
        } else {
            player1Notation.textContent = "CPU";
            player2Notation.textContent = "You";
        }
    }

    if (currentGameState.mode === "Player") {
        if (currentGameState.userMark === "X") {
            player1Notation.textContent = "Player 1";
            player2Notation.textContent = "Player 2";
        } else {
            player1Notation.textContent = "Player 2";
            player2Notation.textContent = "Player 1";
        }
    }

    player1Score.textContent = currentGameState.scores.X;
    player2Score.textContent = currentGameState.scores.O;
    ties.textContent = currentGameState.scores.ties;
}

function updateGameState(tileIndex) {
    currentGameState.board[tileIndex] = currentGameState.currentTurn;
    checkWinOrTie(currentGameState, tileIndex);
    toggleTurn(currentGameState);
}

function displayGame() {
    menu.classList.add("hidden");
    body.classList.add("game-active");
    turn.classList.remove("hidden");
    restartBtn.classList.remove("hidden");
    header.classList.add("header--game-active");
    main.classList.add("main--game-active");

    displayBoardAndStats();
}

function displayWinnerOverlay() {
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    main.setAttribute("inert", "");
}

function hideWinnerOverlay() {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    main.removeAttribute("inert");
    menu.classList.remove("hidden");
}

function quitGame() {
    hideWinnerOverlay();

    if (originalGameStateForCurrentSession) {
        currentGameState = JSON.parse(JSON.stringify(originalGameStateForCurrentSession));
    } else {
        console.warn("cannot reset: originalGameStateForCurrentSession is not set.");
        currentGameState = null;
    }
}

async function insertSVG(targetElement, filename) {
    try {
        const res = await fetch(`/assets/images/${filename}`);
        const svgText = await res.text();
        targetElement.innerHTML = svgText;
    }
    catch (err) {
        console.error(err);
    }
}

function setupBoardEventListeners() {
    const board = document.getElementById("board");
    if (!board) return;

    board.addEventListener("click", (e) => {
        const tile = e.target.closest(".board__tile");
        if (tile && board.contains(tile)) {
            const tileIndex = Array.from(board.children).indexOf(tile);
            console.log(`Tile ${tileIndex + 1} clicked!`);

            tile.innerHTML = "";

            if (currentGameState.currentTurn === "X") {
                insertSVG(tile, "icon-x.svg");
            } else {
                insertSVG(tile, "icon-o.svg");
            }
            tile.classList.add("filled");
            updateGameState(tileIndex);
        }
    });

    board.addEventListener("mouseenter", handleHover, true);
    board.addEventListener("mouseleave", clearHover, true);

    function handleHover(e) {
        const tile = e.target.closest(".board__tile");
        if (!tile || board.contains(tile) === false) return;
        if (tile.classList.contains("filled")) return;

        const iconX = tile.querySelector(".board__tile--X");
        const iconO = tile.querySelector(".board__tile--O");

        const isXTurn = currentGameState.currentTurn === "X";

        iconX?.classList.toggle("hidden", !isXTurn);
        iconO?.classList.toggle("hidden", isXTurn);
    }

    function clearHover(e) {
        const tile = e.target.closest(".board__tile");
        if (!tile || tile.classList.contains("filled")) return;

        const iconX = tile.querySelector(".board__tile--X");
        const iconO = tile.querySelector(".board__tile--O");

        iconX?.classList.add("hidden");
        iconO?.classList.add("hidden");
    }
}

menuForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const clickedButton = document.activeElement;

    let actionValue = "";
    if (clickedButton.tagName === "BUTTON" && clickedButton.name === "menu-choice") {
        actionValue = clickedButton.value;
    }

    const formData = Object.fromEntries(new FormData(menuForm));
    formData["menu-choice"] = actionValue;
    initGame(formData);
    displayGame();
});

quitBtn.addEventListener("click", () => {
    quitGame();
});

nextRoundBtn.addEventListener("click", () => {
    console.log("next round button");
});

// displayWinnerOverlay();