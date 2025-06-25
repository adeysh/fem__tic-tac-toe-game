export function createInitialGameState(formData) {
    return {
        mode: formData["menu-choice"] === "cpu" ? "CPU" : "Player",
        userMark: formData["mark"],
        player2Mark: formData["mark"] === "X" ? "O" : "X",
        currentTurn: "X",
        board: Array(9).fill(""),
        scores: { X: 0, O: 0, ties: 0 },
        isGameOver: false,
        winner: null,
        hasGameStarted: false,
        isCpuThinking: false,
    };
}