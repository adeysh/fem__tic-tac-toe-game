import { winPatterns } from "./config";
import { updateScores, showOverlay } from "./ui";
import { insertSVG } from "./svgUtils"

export async function checkWinOrTie(gameState, lastMark) {
    const allPatterns = Object.values(winPatterns).flat();

    for (const line of allPatterns) {
        if (line.every(i => gameState.board[i] === lastMark)) {
            gameState.isGameOver = true;
            gameState.winner = lastMark;
            gameState.scores[lastMark]++;
            await highlightWinningTiles(line, lastMark);
            updateScores(gameState.scores, gameState.mode, gameState.userMark);
            await showOverlay(lastMark, gameState.mode, gameState.userMark);
            return;
        }
    }

    if (gameState.board.every(cell => cell !== "")) {
        gameState.isGameOver = true;
        gameState.winner = null;
        gameState.scores.ties++;
        updateScores(gameState.scores, gameState.mode, gameState.userMark);
        await showOverlay(null, gameState.mode, gameState.userMark);
    }
}

async function highlightWinningTiles(indices, mark) {
    const boardTiles = document.querySelectorAll(".board__tile");

    for (const index of indices) {
        const tile = boardTiles[index];
        tile.classList.add("board__tile--win");
        tile.classList.add(`board__tile--win-${mark}`);
        tile.innerHTML = "";
        await insertSVG(tile, mark === "X"
            ? "icon-x-win-board.svg" : "icon-o-win-board.svg", ["svg-icon"]
        );
    }
}