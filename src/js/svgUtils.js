export async function insertSVG(container, svgFileName, extraClasses = []) {
    try {
        const res = await fetch(`/assets/images/${svgFileName}`);
        const svgText = await res.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");

        if (svgElement) {
            if (Array.isArray(extraClasses)) {
                svgElement.classList.add(...extraClasses);
            }

            if (container.children.length === 0) {
                container.appendChild(svgElement);
            }
        }
    } catch (err) {
        console.error(`Error inserting svg: ${svgFileName}`, err);
    }
}