export function setupGame(containerSelector, size) {
    /**
     * First, we mount the game in the container element.
     */
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
        throw new Error('Couldn\'t create context from canvas');
    }
    const gameContainer = document.documentElement.querySelector(containerSelector);
    if (!gameContainer) {
        throw new Error(`Couldn't find element with selector ${containerSelector} to mount canvas on.`);
    }
    gameContainer.appendChild(canvas);
    /**
     * We give the canvas the user defined pixel size through element attributes,
     * but make sure it fills it's container through CSS.
     */
    canvas.setAttribute('width', (size.width).toString());
    canvas.setAttribute('height', (size.height).toString());
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.objectFit = 'contain';
    /**
     * By default an inline element, the canvas can have some stray spacing.
     * We change its display value to block to prevent those.
     */
    canvas.style.display = 'block';
    /**
     * We make sure that rendering is crisp in different browsers.
     */
    canvas.style.imageRendering = '-moz-crisp-edges';
    canvas.style.imageRendering = '-webkit-crisp-edges';
    canvas.style.imageRendering = 'pixelated';
    return {
        context,
        canvas,
    };
}
