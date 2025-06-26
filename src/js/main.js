import { createInitialGameState } from "./gameState";
import { setupBoard, renderSavedBoard } from "./board";
import { displayGame } from "./ui";
import { initLifecycle } from "./lifecycle";
import { initHoverEffects } from "./hover";
import { initCpuLogic } from "./cpu";
import { initCpuDifficultyDropdown } from './cpuDifficulty';

const menuForm = document.getElementById("menu-form");

menuForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const clickedButton = document.activeElement;
    let actionValue = "";

    if (
        clickedButton.tagName === "BUTTON" &&
        clickedButton.name === "menu-choice"
    ) {
        actionValue = clickedButton.value;
    }

    const formData = Object.fromEntries(new FormData(menuForm));
    formData["menu-choice"] = actionValue;

    if (!formData.mark) {
        alert("Please select 'X' or 'O' before starting the game.");
        return;
    }

    const gameState = createInitialGameState(formData);
    await displayGame(gameState);
    setupBoard(gameState);
    initHoverEffects(gameState);
    initCpuLogic(gameState);
    initLifecycle(gameState);
});

document.addEventListener("DOMContentLoaded", initCpuDifficultyDropdown);

function loadGameState() {
    const saved = localStorage.getItem("ticTacToeGameState");
    return saved ? JSON.parse(saved) : null;
}

export function clearGameState() {
    localStorage.removeItem("ticTacToeGameState");
}

window.addEventListener("load", async () => {
    const savedGameState = loadGameState();

    if (savedGameState && !savedGameState.isGameOver) {
        await displayGame(savedGameState);
        await renderSavedBoard(savedGameState.board);
        setupBoard(savedGameState);
        initHoverEffects(savedGameState);
        initCpuLogic(savedGameState);
        initLifecycle(savedGameState);

        if (savedGameState.mode === "CPU" &&
            savedGameState.currentTurn === savedGameState.player2Mark
        ) {
            initCpuLogic(savedGameState);
        }

        window.gameState = savedGameState;
    } else {
        clearGameState();
        // window.location.reload();
    }
});