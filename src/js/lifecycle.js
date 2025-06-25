import { updateTurnIcon, updateScores } from './ui';
import { insertSVG } from './svgUtils';
import { initCpuLogic } from './cpu';
import { initHoverEffects } from './hover';

export function initLifecycle(gameState) {
    const quitBtn = document.getElementById("quit-btn");
    const restartBtn = document.getElementById("restart-btn");
    const nextRoundBtn = document.getElementById("next-round-btn");

    quitBtn?.addEventListener("click", () => {
        window.location.reload();
    });

    restartBtn?.addEventListener('click', () => {
        resetBoard(gameState, true);
    });

    nextRoundBtn?.addEventListener("click", async (e) => {
        console.log("Next round clicked");
        await resetBoard(gameState, false);
    });
}

async function resetBoard(gameState, isRestart = false) {
    gameState.board = Array(9).fill("");
    gameState.isGameOver = false;
    gameState.winner = null;
    gameState.winningTiles = [];
    gameState.isCpuThinking = false;
    gameState.currentTurn = "X";

    document.querySelectorAll(".board__tile").forEach(tile => {
        tile.classList.remove("filled", "board__tile--win", "board__tile--win-X", "board__tile--win-O");
        tile.innerHTML = "";
    });

    const overlay = document.getElementById("overlay");
    overlay.classList.remove("overlay--visible");
    console.log("Overlay check:", document.querySelector(".overlay__win-player").innerHTML);

    await updateTurnIcon(gameState.currentTurn);
    updateScores(gameState.scores, gameState.mode, gameState.userMark);

    if (
        gameState.mode === "CPU" &&
        gameState.currentTurn === gameState.player2Mark
    ) {
        initCpuLogic(gameState);
    }
}