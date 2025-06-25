import { insertSVG } from "./svgUtils";
import { checkWinOrTie } from "./gameplay";
import { updateTurnIcon } from "./ui";


export async function tryCpuMove(gameState) {
    const board = document.getElementById("board");

    if (gameState.currentTurn !== gameState.player2Mark || gameState.isGameOver) return;

    const emptyIndices = gameState.board
        .map((val, idx) => val === "" ? idx : null)
        .filter(val => val !== null);

    const randomIndex = emptyIndices[
        Math.floor(Math.random() * emptyIndices.length)
    ];

    if (randomIndex === undefined) return;

    gameState.isCpuThinking = true;

    const tile = board.children[randomIndex];
    const hoverIcon = tile.querySelector(".hover-icon");
    if (hoverIcon) hoverIcon.remove();
    tile.innerHTML = "";

    await insertSVG(tile, gameState.player2Mark === "X" ? "icon-x.svg" : "icon-o.svg");
    tile.classList.add("filled");
    gameState.board[randomIndex] = gameState.player2Mark;
    await checkWinOrTie(gameState, gameState.player2Mark);

    gameState.isCpuThinking = false;
    board.classList.remove("no-pointer");

    if (!gameState.isGameOver) {
        gameState.currentTurn = gameState.userMark;
        await updateTurnIcon(gameState.currentTurn);
    }
};

export function initCpuLogic(gameState) {

    if (gameState.mode !== "CPU") return;

    if (
        gameState.mode === "CPU" &&
        gameState.userMark === "O" &&
        gameState.currentTurn === gameState.player2Mark
    ) {
        setTimeout(() => tryCpuMove(gameState), 1000);
    }
}