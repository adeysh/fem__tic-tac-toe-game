import { insertSVG } from "./svgUtils";

export async function updateTurnIcon(currentTurn) {
    const turnIcon = document.querySelector(".turn__icon");
    turnIcon.innerHTML = "";
    const file = currentTurn === "X" ? "icon-x-default.svg" : "icon-o-default.svg";
    await insertSVG(turnIcon, file);
}

export function updateScores(scores, mode, userMark) {
    const player1Notation = document.getElementById("player1-notation");
    const player1Score = document.getElementById("player1-score");
    const ties = document.getElementById("ties");
    const player2Notation = document.getElementById("player2-notation");
    const player2Score = document.getElementById("player2-score");

    if (mode === "CPU") {
        player1Notation.textContent = userMark === "X" ? "You" : "CPU";
        player2Notation.textContent = userMark === "X" ? "CPU" : "You";
    } else {
        player1Notation.textContent = userMark === "X" ? "Player 1" : "Player 2";
        player2Notation.textContent = userMark === "X" ? "Player 2" : "Player 1";
    }

    player1Score.textContent = scores.X;
    player2Score.textContent = scores.O;
    ties.textContent = scores.ties;
}

export async function showOverlay(winner, mode, userMark) {
    const overlay = document.getElementById("overlay");
    const overlayWinMessage = document.getElementById("overlay-win-message");
    const overlayWinPlayer = document.getElementById("overlay-win-player");
    const overlayWinIconWrapper = document.querySelector(".overlay__win-icon");
    const overlayWinContent = document.querySelector(".overlay__win-content");

    overlay.classList.add("overlay--visible");
    overlayWinPlayer.classList.remove("overlay__win-player--X", "overlay__win-player--O");
    overlayWinIconWrapper.innerHTML = "";

    if (!winner) {
        overlayWinMessage.textContent = "Nobody";
        overlayWinIconWrapper.classList.add("hidden");
        overlayWinContent.textContent = "Game Tied!";
        return;
    }

    const winnerIconFile = winner === "X" ? "icon-x.svg" : "icon-o.svg";
    const winnerClass = winner === "X" ? "overlay__win-player--X" : "overlay__win-player--O";
    overlayWinPlayer.classList.add(winnerClass);
    overlayWinIconWrapper.classList.remove("hidden");
    overlayWinContent.textContent = "takes the round";

    overlayWinMessage.textContent = mode === "CPU" ? (winner === userMark ? "You" : "CPU") : (winner === userMark ? "Player 1" : "Player 2");

    await insertSVG(overlayWinIconWrapper, winnerIconFile, ["overlay__icon"]);
}

export async function displayGame(gameState) {
    const menu = document.getElementById("menu");
    const body = document.getElementById("body");
    const turn = document.getElementById("turn");
    const restartBtn = document.getElementById("restart-btn");
    const header = document.getElementById("header");
    const main = document.getElementById("main");
    const gameScreenTemplate = document.getElementById("game-screen");

    // Clone and insert the board + stats template
    if (gameScreenTemplate) {
        const clone = gameScreenTemplate.content.cloneNode(true);
        const board = clone.querySelector("#board");

        const cpuPlaysFirst = (
            gameState.mode === "CPU" &&
            gameState.userMark === "O" && // So CPU is X
            gameState.currentTurn === "X"
        );

        if (board && cpuPlaysFirst) {
            board.classList.add("no-pointer");
        }

        main.appendChild(clone);
    }

    menu.classList.add("hidden");
    body.classList.add("game-active");
    turn.classList.remove("hidden");
    restartBtn.classList.remove("hidden");
    header.classList.add("header--game-active");
    main.classList.add("main--game-active");

    updateScores(gameState.scores, gameState.mode, gameState.userMark);
    await updateTurnIcon(gameState.currentTurn);
}

