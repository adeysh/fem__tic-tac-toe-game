import { insertSVG } from './svgUtils';
import { checkWinOrTie } from "./gameplay";
import { updateTurnIcon } from './ui';
import { tryCpuMove } from './cpu';
import { saveGameState } from './gameState';

export function setupBoard(gameState) {
    const board = document.getElementById("board");
    if (!board) return;

    board.addEventListener("click", async (e) => {
        const tile = e.target.closest(".board__tile");
        if (
            !tile || !board.contains(tile) ||
            tile.classList.contains("filled") ||
            gameState.isCpuThinking
        ) return;

        const hoverIcon = tile.querySelector(".hover-icon");
        if (hoverIcon) {
            hoverIcon.remove();
        }

        const tileIndex = Array.from(board.children).indexOf(tile);
        tile.innerHTML = "";
        const mark = gameState.currentTurn;

        await insertSVG(tile, mark === "X" ? "icon-x.svg" : "icon-o.svg");
        tile.classList.add("filled");
        gameState.board[tileIndex] = mark;
        saveGameState(gameState);
        await checkWinOrTie(gameState, mark);

        if (!gameState.isGameOver) {
            gameState.currentTurn = mark === "X" ? "O" : "X";
            await updateTurnIcon(gameState.currentTurn);

            if (
                gameState.mode === "CPU" &&
                gameState.currentTurn === gameState.player2Mark
            ) {
                document.getElementById("board")?.classList.add("no-pointer");
                setTimeout(() => tryCpuMove(gameState), 500);
            }
        }
    });
}

export async function renderSavedBoard(boardArray) {
    const boardElement = document.getElementById("board");
    if (!boardElement) return;

    const tiles = Array.from(boardElement.children);

    for (let i = 0; i < boardArray.length; i++) {
        const mark = boardArray[i];
        const tile = tiles[i];

        if (mark !== "" && tile) {
            await insertSVG(tile, mark === "X" ? "icon-x.svg" : "icon-o.svg");
            tile.classList.add("filled");
        }
    }
}