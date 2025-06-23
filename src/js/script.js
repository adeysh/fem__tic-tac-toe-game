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
const overlayWinIconWrapper = document.querySelector(".overlay__win-icon");

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
        hasGameStarted: false,
        isCpuThinking: false,
    };
}


function initGame(formData) {
    const initialStateBasedOnForm = createInitialGameState(formData);

    originalGameStateForCurrentSession = JSON.parse(JSON.stringify(initialStateBasedOnForm));

    currentGameState = JSON.parse(JSON.stringify(initialStateBasedOnForm));
    currentGameState.hasGameStarted = true;
}

async function displayBoardAndStats() {
    const clone = gameScreenTemplate.content.cloneNode(true);
    main.appendChild(clone);

    setupBoardEventListeners();
    await updateTurnIcon(currentGameState);
    updateScores(currentGameState);
    clearAllHoverIcons();

    if (
        currentGameState.mode === "CPU" &&
        currentGameState.userMark === "O" &&
        currentGameState.currentTurn === "X"
    ) {
        makeCpuMove(currentGameState);
    }
}

async function updateTurnIcon(currentGameState) {
    const turnIcon = turn.querySelector(".turn__icon");
    turnIcon.innerHTML = "";

    const iconName = currentGameState.currentTurn === "X"
        ? "icon-x-default.svg"
        : "icon-o-default.svg";

    await insertSVG(turnIcon, iconName);
}

const winPatterns = {
    rows: [[0, 1, 2], [3, 4, 5], [6, 7, 8]],
    columns: [[0, 3, 6], [1, 4, 7], [2, 5, 8]],
    diagonals: [[0, 4, 8], [2, 4, 6]]
};

async function checkWinOrTie(currentGameState, tileIndex, lastPlayedMark) {
    const board = currentGameState.board;

    for (const winningLine in winPatterns) {

        for (const winPattern of winPatterns[winningLine]) {

            const isWinningPattern = winPattern.every(index => board[index] === lastPlayedMark);

            if (isWinningPattern) {
                currentGameState.isGameOver = true;
                currentGameState.winner = lastPlayedMark;
                currentGameState.winningTiles = winPattern;
                currentGameState.scores[lastPlayedMark]++;
                updateScores(currentGameState);
                await highlightWinningTiles(winPattern, lastPlayedMark);

                setTimeout(() => {
                    displayOverlay(currentGameState);
                }, 500)
                return;
            }

        }
    }

    if (board.every(cell => cell !== "") && !currentGameState.isGameOver) {
        currentGameState.isGameOver = true;
        currentGameState.winner = null;
        currentGameState.scores.ties++;
        updateScores(currentGameState);
        displayOverlay(currentGameState);
    }
}

async function displayOverlay(currentGameState) {
    overlay.classList.remove("hidden");

    overlayWinPlayer.classList.remove("overlay__win-player--X", "overlay__win-player--O");

    overlayWinIconWrapper.innerHTML = "";

    const winner = currentGameState.winner;

    if (!winner) {
        overlayWinMessage.textContent = "Nobody";
        overlayWinPlayer.innerHTML = "";
        overlayWinPlayer.textContent = "Game Tied!";
        return;
    }

    const winnerIconFile = winner === "X" ? "icon-x.svg" : "icon-o.svg";
    const winnerClass = winner === "X" ? "overlay__win-player--X" : "overlay__win-player--O";

    overlayWinPlayer.classList.add(winnerClass);

    if (currentGameState.mode === "CPU") {
        const isUserWinner = winner === currentGameState.userMark;
        overlayWinMessage.textContent = isUserWinner ? "You" : "CPU";
    } else {
        const isPlayer1Winner = winner === currentGameState.userMark;
        overlayWinMessage.textContent = isPlayer1Winner ? "Player 1" : "Player 2";
    }

    await insertSVG(overlayWinIconWrapper, winnerIconFile, "overlay__icon");
}

async function toggleTurn(currentGameState) {

    if (currentGameState.mode === "CPU") {

        if (currentGameState.userMark === "X") {

            if (currentGameState.currentTurn === "X") {

                currentGameState.currentTurn = "O";

                makeCpuMove(currentGameState);
                return;
            } else {
                currentGameState.currentTurn = "X";
            }
        } else {
            if (currentGameState.currentTurn === "O") {
                currentGameState.currentTurn = "X";
                makeCpuMove(currentGameState);
                return;
            } else {
                currentGameState.currentTurn = "O";
            }
        }
    } else {
        currentGameState.currentTurn = currentGameState.currentTurn === "X" ? "O" : "X";
    }
    await updateTurnIcon(currentGameState);
}

function updateScores(currentGameState) {
    const player1Notation = document.getElementById("player1-notation");
    const player1Score = document.getElementById("player1-score");

    const ties = document.getElementById("ties");

    const player2Notation = document.getElementById("player2-notation");
    const player2Score = document.getElementById("player2-score");


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
    if (currentGameState.isGameOver) return;

    currentGameState.board[tileIndex] = currentGameState.currentTurn;
    checkWinOrTie(currentGameState, tileIndex, currentGameState.currentTurn);
    // toggleTurn(currentGameState);
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

async function highlightWinningTiles(indices, mark) {
    const boardTiles = document.querySelectorAll(".board__tile");

    for (const index of indices) {
        const tile = boardTiles[index];
        tile.classList.add("board__tile--win");
        tile.classList.add(`board__tile--win-${mark}`);
        tile.innerHTML = "";
        console.log(tile.innerHTML);
        await insertSVG(tile, mark === "X" ? "icon-x-win-board.svg" : "icon-o-win-board.svg", "svg-icon");
    }
}

function hideWinnerOverlayForNextRound() {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    main.removeAttribute("inert");
}

function quitGame() {
    hideWinnerOverlay();

    currentGameState = null;
    originalGameStateForCurrentSession = null;

    const board = main.querySelector('.board');
    const gameStats = main.querySelector('.game-stats');

    if (board && gameStats) {

        board.remove();
        gameStats.remove();
        menuForm.reset();

        body.classList.remove("game-active");
        header.classList.remove("header--game-active");
        main.classList.remove("main--game-active");
        turn.classList.add("hidden");
        restartBtn.classList.add("hidden");
    }
}

async function initNextRound() {
    if (!currentGameState || !currentGameState.scores) {
        console.warn("currentGameState or scores is missing before next round.");
        return;
    }

    const newGameState = JSON.parse(JSON.stringify(originalGameStateForCurrentSession));
    console.log(currentGameState);
    newGameState.scores = { ...currentGameState.scores };
    newGameState.hasGameStarted = true;
    currentGameState = newGameState;

    const tiles = document.querySelectorAll(".board__tile");
    tiles.forEach(tile => {
        console.log(tile.classList);
        tile.classList.remove("filled", "board__tile--win", "board__tile--win-X", "board__tile--win-O");
        tile.innerHTML = "";
    });

    hideWinnerOverlayForNextRound();
    await updateTurnIcon(currentGameState);

    if (currentGameState.mode === "CPU" && currentGameState.currentTurn !== currentGameState.userMark) {
        currentGameState.isCpuThinking = true;
        board.classList.add("no-pointer");

        setTimeout(() => {
            makeCpuMove(currentGameState);
            currentGameState.isCpuThinking = false;
            board.classList.remove("no-pointer");
        }, 1000); // slight delay for UX
    }
}

async function restartGame() {
    const newGameState = JSON.parse(JSON.stringify(originalGameStateForCurrentSession));

    newGameState.scores = { ...currentGameState.scores };
    newGameState.hasGameStarted = true;
    currentGameState = newGameState;

    const tiles = document.querySelectorAll(".board__tile");
    tiles.forEach(tile => {
        tile.classList.remove("filled");
        tile.innerHTML = "";
    });

    await updateTurnIcon(currentGameState);

    if (
        currentGameState.mode === "CPU" &&
        currentGameState.userMark === "O" &&
        currentGameState.currentTurn === "X"
    ) {
        currentGameState.isCpuThinking = true;
        board.classList.add("no-pointer");

        setTimeout(() => {
            makeCpuMove(currentGameState);
            currentGameState.isCpuThinking = false;
            board.classList.remove("no-pointer");
        }, 1500)
    }
}

async function insertSVG(container, svgFileName, extraClass = "") {
    try {
        const res = await fetch(`/assets/images/${svgFileName}`);
        const svgText = await res.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");

        if (svgElement) {
            if (extraClass) svgElement.classList.add(extraClass);
            container.appendChild(svgElement);
        }
    } catch (err) {
        console.error(`Error inserting svg: ${svgFileName}`, err);
    }
}

function clearAllHoverIcons() {
    const tiles = document.querySelectorAll(".board__tile");
    tiles.forEach(tile => {
        const iconX = tile.querySelector(".board__tile--X");
        const iconO = tile.querySelector(".board__tile--O");

        if (iconX) iconX.classList.add("hidden");
        if (iconO) iconO.classList.add("hidden");
    });
}



async function makeCpuMove(currentGameState) {
    const board = document.getElementById("board");

    const emptyIndices = currentGameState.board
        .map((val, idx) => val === "" ? idx : null)
        .filter(val => val !== null);

    const randomIndex = emptyIndices[
        Math.floor(Math.random() * emptyIndices.length)
    ];
    if (!currentGameState.isGameOver && randomIndex !== undefined) {
        clearAllHoverIcons();

        const tile = board.children[randomIndex];
        tile.innerHTML = "";

        const cpuMark = currentGameState.player2Mark;
        insertSVG(tile, cpuMark === "X" ? "icon-x.svg" : "icon-o.svg");
        tile.classList.add("filled");

        currentGameState.board[randomIndex] = cpuMark;
        checkWinOrTie(currentGameState, randomIndex, cpuMark);

        if (!currentGameState.isGameOver) {
            currentGameState.currentTurn = currentGameState.userMark;
            await updateTurnIcon(currentGameState);
        }
    }
}

function setupBoardEventListeners() {
    const board = document.getElementById("board");
    if (!board) return;

    board.addEventListener("click", async (e) => {
        console.log("Click registered, game state:", currentGameState);

        const tile = e.target.closest(".board__tile");

        if (!tile || !board.contains(tile) || tile.classList.contains("filled")) return;

        const tileIndex = Array.from(board.children).indexOf(tile);
        console.log(`Tile ${tileIndex + 1} clicked!`);

        tile.innerHTML = "";


        if (currentGameState.mode === "CPU") {
            const isPlayerTurn = currentGameState.currentTurn === currentGameState.userMark;

            if (isPlayerTurn) {
                const playerMark = currentGameState.userMark;
                insertSVG(tile, playerMark === "X" ? "icon-x.svg" : "icon-o.svg");
                tile.classList.add("filled");
                updateGameState(tileIndex);

                if (!currentGameState.isGameOver) {
                    currentGameState.currentTurn = currentGameState.player2Mark;
                    currentGameState.isCpuThinking = true;
                    board.classList.add("no-pointer");
                    await updateTurnIcon(currentGameState);

                    setTimeout(() => {
                        clearAllHoverIcons();
                        makeCpuMove(currentGameState);
                        currentGameState.isCpuThinking = false;
                        board.classList.remove("no-pointer");

                    }, 1000);
                }
            }
        } else {
            const currentMark = currentGameState.currentTurn;
            insertSVG(tile, currentMark === "X" ? "icon-x.svg" : "icon-o.svg");
            tile.classList.add("filled");
            updateGameState(tileIndex);

            if (!currentGameState.isGameOver) {
                currentGameState.currentTurn = currentGameState.currentTurn === "X" ? "O" : "X";
                await updateTurnIcon(currentGameState);
            }
        }
    });

    board.addEventListener("mouseover", handleHover, true);
    board.addEventListener("mouseout", clearHover, true);

    async function handleHover(e) {

        if (currentGameState.isCpuThinking) return;

        const tile = e.target.closest(".board__tile");
        if (!tile || !board.contains(tile)) return;
        if (tile.classList.contains("filled")) return;

        if (tile.querySelector(".hover-icon")) return;

        const isXTurn = currentGameState.currentTurn === "X";
        const iconName = isXTurn ? "icon-x-outline.svg" : "icon-o-outline.svg";

        await insertSVG(tile, iconName, "hover-icon");
    }

    function clearHover(e) {
        const tile = e.target.closest(".board__tile");
        const toElement = e.relatedTarget;

        if (tile && tile.contains(toElement)) return;

        if (!tile || tile.classList.contains("filled")) return;

        const hoverIcon = tile.querySelector(".hover-icon");
        if (hoverIcon) hoverIcon.remove();
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

    if (!formData.mark) {
        alert("Please select 'X' or 'O' before starting the game.");
        return;
    }

    initGame(formData);
    displayGame();
});

quitBtn.addEventListener("click", () => {
    quitGame();
});

nextRoundBtn.addEventListener("click", () => {
    console.log("after next round");
    console.log(currentGameState);
    initNextRound();
});

restartBtn.addEventListener('click', () => {
    restartGame();
});

// displayWinnerOverlay();