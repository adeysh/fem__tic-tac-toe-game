export function initKeyboardNavigation() {
    // Prevent Enter from submitting the form when radio is focused
    const radios = document.querySelectorAll('input[type="radio"][name="mark"]');

    radios.forEach(radio => {
        radio.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                radio.checked = true;
            }
        });
    });
}