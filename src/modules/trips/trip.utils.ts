export function generatePastelColor(): string {
    // Pastel RGB range (light colors)
    const r = Math.floor(150 + Math.random() * 80);
    const g = Math.floor(150 + Math.random() * 80);
    const b = Math.floor(150 + Math.random() * 80);

    return `rgb(${r}, ${g}, ${b})`;
}
