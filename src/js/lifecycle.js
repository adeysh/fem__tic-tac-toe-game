import { updateTurnIcon, updateScores, showOverlay } from './ui';
import { insertSVG } from './svgUtils';
import { initCpuLogic } from './cpu';
import { initHoverEffects } from './hover';
import { saveGameState } from './gameState';
import { clearGameState } from './main';

export function initLifecycle(gameState) {
    const restartBtn = document.getElementById("restart-btn");
    const headerQuitBtn = document.getElementById("header-quit-btn");
    const OverlayQuitBtn = document.getElementById("overlay-quit-btn");
    const nextRoundBtn = document.getElementById("next-round-btn");

    const overlayWinContainer = document.getElementById("win-container");
    const quitConfirmContainer = document.getElementById("quit-confirm-container");
    const confirmYesBtn = document.getElementById("confirm-quit-yes");
    const confirmNoBtn = document.getElementById("confirm-quit-no");

    restartBtn?.addEventListener('click', () => {
        resetBoard(gameState);
    });

    headerQuitBtn?.addEventListener('click', () => {
        overlayWinContainer.classList.add("hidden");
        quitConfirmContainer.classList.remove("hidden");
        showOverlay(null, gameState.mode, gameState.userMark);
    });

    confirmYesBtn?.addEventListener('click', () => {
        quitGame();
    });

    confirmNoBtn?.addEventListener('click', () => {
        const overlay = document.getElementById("overlay");
        overlay.classList.remove("overlay--visible");

        setTimeout(() => {
            quitConfirmContainer.classList.add("hidden");
            overlayWinContainer.classList.remove("hidden");
        }, 500)
    });

    OverlayQuitBtn?.addEventListener("click", () => {
        quitGame();
    });

    nextRoundBtn?.addEventListener("click", async (e) => {
        await resetBoard(gameState);
    });
}

async function resetBoard(gameState) {
    gameState.board = Array(9).fill("");
    gameState.isGameOver = false;
    gameState.winner = null;
    gameState.winningTiles = [];
    gameState.isCpuThinking = false;
    gameState.currentTurn = "X";

    document.querySelectorAll(".board__tile").forEach(tile => {
        tile.classList.remove(
            "filled", "board__tile--win", "board__tile--win-X",
            "board__tile--win-O"
        );
        tile.innerHTML = "";
    });

    const overlay = document.getElementById("overlay");
    overlay.classList.remove("overlay--visible");

    await updateTurnIcon(gameState.currentTurn);
    updateScores(gameState.scores, gameState.mode, gameState.userMark);
    saveGameState(gameState);

    if (
        gameState.mode === "CPU" &&
        gameState.currentTurn === gameState.player2Mark
    ) {
        initCpuLogic(gameState);
    }

    saveGameState(gameState);
}

function quitGame() {
    clearGameState();
    window.location.reload();
}