// src/js/cpuDifficultyDropdown.js

export function initCpuDifficultyDropdown() {
    const customSelect = document.getElementById("cpu-difficulty-select");
    if (!customSelect) return;

    const selected = customSelect.querySelector(".menu__choice-selected");
    const selectedText = customSelect.querySelector("#selected-text");
    const options = customSelect.querySelector(".menu__choice-options");
    const hiddenInput = customSelect.querySelector("input[type='hidden']");

    selected.addEventListener("click", () => {
        options.classList.toggle("hidden");
    });

    selected.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            options.classList.toggle("hidden");
            e.preventDefault();
        }
    });

    options.querySelectorAll("div").forEach(option => {
        option.addEventListener("click", () => {
            const value = option.getAttribute("data-value");
            const label = option.textContent;

            selectedText.textContent = label;
            hiddenInput.value = value;
            options.classList.add("hidden");
        });
    });

    // Close if clicked outside
    document.addEventListener("click", (e) => {
        if (!customSelect.contains(e.target)) {
            options.classList.add("hidden");
        }
    });
}
