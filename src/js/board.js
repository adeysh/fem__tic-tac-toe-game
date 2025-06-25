import { insertSVG } from './svgUtils';
import { checkWinOrTie } from "./gameplay";
import { updateTurnIcon } from './ui';
import { tryCpuMove } from './cpu';

export function setupBoard(gameState) {
    const board = document.getElementById("board");
    if (!board) return;

    board.addEventListener("click", async (e) => {
        const tile = e.target.closest(".board__tile");
        if (!tile || !board.contains(tile) || tile.classList.contains("filled") || gameState.isCpuThinking) return;

        const hoverIcon = tile.querySelector(".hover-icon");
        if (hoverIcon) {
            console.log(hoverIcon);
            hoverIcon.remove();
        }

        const tileIndex = Array.from(board.children).indexOf(tile);
        tile.innerHTML = "";
        console.log(tile.innerHTML);
        const mark = gameState.currentTurn;

        await insertSVG(tile, mark === "X" ? "icon-x.svg" : "icon-o.svg");
        tile.classList.add("filled");
        gameState.board[tileIndex] = mark;
        await checkWinOrTie(gameState, mark);

        if (!gameState.isGameOver) {
            gameState.currentTurn = mark === "X" ? "O" : "X";
            await updateTurnIcon(gameState.currentTurn);

            if (gameState.mode === "CPU" && gameState.currentTurn === gameState.player2Mark) {
                document.getElementById("board")?.classList.add("no-pointer");
                setTimeout(() => tryCpuMove(gameState), 500);
            }
        }
    });
}