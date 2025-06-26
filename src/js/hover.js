import { insertSVG } from "./svgUtils";

export function initHoverEffects(gameState) {
    const board = document.getElementById("board");

    board.addEventListener("mouseover", async (e) => {
        if (gameState.isCpuThinking) return;

        const tile = e.target.closest(".board__tile");
        if (
            !tile || !board.contains(tile) ||
            tile.classList.contains("filled") ||
            tile.querySelector(".hover-icon")
        ) return;

        removeHoverClasses(tile);
        const hoverClass = gameState.currentTurn === "X"
            ? "hover-border-X" : "hover-border-O";
        tile.classList.add(hoverClass);

        const iconName = gameState.currentTurn === "X"
            ? "icon-x-outline.svg" : "icon-o-outline.svg";
        await insertSVG(tile, iconName, ["hover-icon"]);
    });

    board.addEventListener("mouseout", (e) => {
        const tile = e.target.closest(".board__tile");
        const toElement = e.relatedTarget;
        if (tile && tile.contains(toElement)) return;
        if (!tile || tile.classList.contains("filled")) return;

        removeHoverClasses(tile);
        const hoverIcon = tile.querySelector(".hover-icon");
        if (hoverIcon) hoverIcon.remove();
    });

    function removeHoverClasses(tile) {
        tile.classList.remove("hover-border-X", "hover-border-O");
    }
}