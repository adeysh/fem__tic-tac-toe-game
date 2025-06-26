import { insertSVG } from "./svgUtils";
import { checkWinOrTie } from "./gameplay";
import { updateTurnIcon } from "./ui";
import { winPatterns } from './config';

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

export async function tryCpuMove(gameState) {
    const boardElement = document.getElementById("board");

    if (
        gameState.currentTurn !== gameState.player2Mark ||
        gameState.isGameOver
    ) return;

    const emptyIndices = gameState.board
        .map((val, idx) => val === "" ? idx : null)
        .filter(val => val !== null);

    if (emptyIndices.length === 0) return;

    gameState.isCpuThinking = true;

    let moveIndex;

    switch (gameState.cpuDifficulty) {
        case "easy":
            moveIndex = getRandomMove(emptyIndices);
            break;

        case "medium":
            moveIndex = getMediumMove(gameState, emptyIndices);
            break;

        case "hard":
            moveIndex = getBestMove(gameState, emptyIndices);
            break;

        case "minimax":
            moveIndex = getMinimaxMove(gameState);
            break;

        default:
            moveIndex = getRandomMove(gameState, emptyIndices);
    }

    const tile = boardElement.children[moveIndex];
    const hoverIcon = tile.querySelector(".hover-icon");
    if (hoverIcon) hoverIcon.remove();
    tile.innerHTML = "";

    await insertSVG(tile, gameState.player2Mark === "X"
        ? "icon-x.svg" : "icon-o.svg");
    tile.classList.add("filled");
    gameState.board[moveIndex] = gameState.player2Mark;
    await checkWinOrTie(gameState, gameState.player2Mark);

    gameState.isCpuThinking = false;
    boardElement.classList.remove("no-pointer");

    if (!gameState.isGameOver) {
        gameState.currentTurn = gameState.userMark;
        await updateTurnIcon(gameState.currentTurn);
    }
};

function getRandomMove(emptyIndices) {
    const randomIndex = Math.floor(Math.random() * emptyIndices.length);
    return emptyIndices[randomIndex];
}

function getMediumMove(gameState, emptyIndices) {
    const opponent = gameState.userMark;
    const board = gameState.board;

    for (let i of emptyIndices) {
        const tempBoard = [...board];
        tempBoard[i] = gameState.player2Mark;
        if (isWinningMove(tempBoard, gameState.player2Mark)) {
            return i;
        }
    }

    for (const i of emptyIndices) {
        const tempBoard = [...board];
        tempBoard[i] = opponent;
        if (isWinningMove(tempBoard, opponent)) {
            return i;
        }
    }

    return getRandomMove(emptyIndices);
}

function getBestMove(gameState, emptyIndices) {

    const board = gameState.board;
    const cpu = gameState.player2Mark;
    const player = gameState.userMark;

    for (let i of emptyIndices) {
        const tempBoard = [...board];
        tempBoard[i] = cpu;
        if (isWinningMove(tempBoard, cpu)) {
            return i;
        }
    }

    for (let i of emptyIndices) {
        const tempBoard = [...board];
        tempBoard[i] = player;
        if (isWinningMove(tempBoard, player)) {
            return i;
        }
    }

    const fork = findForkMove(board, cpu, emptyIndices);
    if (fork !== null) return fork;

    const blockFork = findForkMove(board, player, emptyIndices);
    if (blockFork !== null) return blockFork;

    if (board[4] === "") return 4;

    const corners = [[0, 8], [2, 6]];
    for (let [playerCorner, opposite] of corners) {
        if (
            board[playerCorner] === player &&
            board[opposite] === ""
        ) return opposite;
    }

    const cornerOptions = [0, 2, 6, 8].filter(i => board[i] === "");
    if (cornerOptions.length) {
        return cornerOptions[Math.floor(Math.random() * cornerOptions.length)];
    }

    const sideOptions = [1, 3, 5, 7].filter(i => board[i] === "");
    if (sideOptions.length) {
        return sideOptions[Math.floor(Math.random() * sideOptions.length)];
    }

    return getMediumMove(gameState, emptyIndices);
}

function getMinimaxMove(gameState) {
    const board = gameState.board;
    const ai = gameState.player2Mark;
    const human = gameState.userMark;

    function minimax(board, isMaximizing) {
        const winner = evaluateBoard(board, ai, human);
        if (winner !== null) return { score: winner };

        const emptyIndices = board
            .map((val, idx) => val === "" ? idx : null)
            .filter(val => val !== null);

        let bestMove;

        if (isMaximizing) {
            let bestScore = -Infinity;

            for (const i of emptyIndices) {
                board[i] = ai;
                const { score } = minimax(board, false);
                board[i] = "";

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }

            return { score: bestScore, move: bestMove };
        } else {
            let bestScore = Infinity;

            for (const i of emptyIndices) {
                board[i] = human;
                const { score } = minimax(board, true);
                board[i] = "";

                if (score < bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }

            return { score: bestScore, move: bestMove };
        }
    }

    const result = minimax([...board], true);
    return result.move;
}

function isWinningMove(board, mark) {
    const allPatterns = Object.values(winPatterns).flat();

    return allPatterns.some(
        pattern => pattern.every(index => board[index] === mark)
    );
}

function findForkMove(board, mark, emptyIndices) {
    for (let i of emptyIndices) {
        const tempBoard = [...board];
        tempBoard[i] = mark;

        let winningLines = 0;
        const lines = Object.values(winPatterns).flat();

        for (let line of lines) {
            const marks = line.map(idx => tempBoard[idx]);
            const markCount = marks.filter(m => m === mark).length;
            const emptyCount = marks.filter(m => m === "").length;

            if (markCount === 2 && emptyCount === 1) winningLines++;
        }

        if (winningLines >= 2) return i;
    }

    return null;
}

function evaluateBoard(board, ai, human) {
    const allPatterns = Object.values(winPatterns).flat();

    if (allPatterns.some(p => p.every(i => board[i] === ai))) return 1;
    if (allPatterns.some(p => p.every(i => board[i] === human))) return -1;
    if (board.every(cell => cell !== "")) return 0;

    return null;
}
