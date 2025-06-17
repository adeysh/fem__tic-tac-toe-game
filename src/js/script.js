const cpuBtn = document.getElementById("button-cpu");
const vsPlayerBtn = document.getElementById("button-vs-player");

const turn = document.getElementById("turn");
const restartBtn = document.getElementById("restart-btn");
const body = document.getElementById("body");
const header = document.getElementById("header");
const main = document.getElementById("main");
const menu = document.getElementById("menu");
const menuForm = document.getElementById("menu-form");

const gameScreenTemplate = document.getElementById("game-screen");

const overlay = document.getElementById("overlay");
const quitBtn = document.getElementById("quit-btn");
const nextRoundBtn = document.getElementById("next-round-btn");

const initialGameState = {
    mode: formData["menu-choice"] === "cpu" ? "CPU" : "Player",
    userMark: formData["mark"],
    player2Mark: formData["mark"] === "X" ? "O" : "X",
    currentTurn: "X",
    board: ["", "", "", "", "", "", "", "", ""],
    scores: {
        X: 0,
        O: 0,
        ties: 0
    },
    isGameOver: false,
    winner: null
};

const originalGameState = JSON.parse(JSON.stringify(initialGameState));


function initGame(formData) {
    let currentGameState = JSON.parse(JSON.stringify(initialGameState));
    console.log(currentGameState);
}

function displayBoardAndStats() {
    const clone = gameScreenTemplate.content.cloneNode(true);
    main.appendChild(clone);
}

function displayGame() {
    menu.classList.add("hidden");
    body.classList.add("game-active");
    turn.classList.remove("hidden");
    restartBtn.classList.remove("hidden");
    header.classList.add("header--game-active");
    main.classList.add("main--game-active");

    displayBoardAndStats();
}

function displayWinnerOverlay() {
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    main.setAttribute("inert", "");
}

function hideWinnerOverlay() {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    main.removeAttribute("inert");
    menu.classList.remove("hidden");
}

function quitGame() {
    hideWinnerOverlay();
    currentGameState = JSON.parse(JSON.stringify(originalGameState));
}

menuForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const clickedButton = document.activeElement;

    let actionValue = "";
    if (clickedButton.tagName === "BUTTON" && clickedButton.name === "menu-choice") {
        actionValue = clickedButton.value;
    }

    const formData = Object.fromEntries(new FormData(menuForm));
    formData["menu-choice"] = actionValue;
    console.log(formData);
    initGame(formData);
    displayGame();
});

quitBtn.addEventListener("click", () => {
    quitGame();
});

nextRoundBtn.addEventListener("click", () => {
    console.log("next round button");
});

displayWinnerOverlay();