export function setupGame(containerSelector, size, scale = 1) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', (size.width * scale * window.devicePixelRatio).toString());
    canvas.setAttribute('height', (size.height * scale * window.devicePixelRatio).toString());
    canvas.style.width = `${size.width * scale}px`;
    canvas.style.height = `${size.height * scale}px`;
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Couldn\'t create context from canvas');
    }
    context.imageSmoothingEnabled = false;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    const gameElement = document.documentElement.querySelector(containerSelector);
    if (!gameElement) {
        throw new Error(`Couldn't find element with selector ${containerSelector} to mount canvas on.`);
    }
    gameElement.appendChild(canvas);
    return {
        context,
        canvas,
    };
}