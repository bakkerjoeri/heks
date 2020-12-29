export function setupCanvas(
	containerSelector: string,
	size: [width: number, height: number],
	hideSystemCursor = true
): {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
} {
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
		throw new Error(`Couldn't find element with selector ${containerSelector} to mount canvas on.`)
	}

	gameContainer.appendChild(canvas);

	/**
	 * We give the canvas the user defined pixel size through element attributes,
	 * and make sure it fills it's container width through CSS.
	 */
	canvas.setAttribute('width', (size[0]).toString());
	canvas.setAttribute('height', (size[1]).toString());
	canvas.style.width = '100%';

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

	/**
	 * Process option to show or hide system cursor
	 */
	if (!hideSystemCursor) {
		canvas.style.cursor = 'none';
	}

	return {
		context,
		canvas,
	};
}

export function clearCanvas(
	canvas: HTMLCanvasElement,
	context: CanvasRenderingContext2D,
	backgroundColor = '#000000'
): void {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = backgroundColor;
	context.fillRect(0, 0, canvas.width, canvas.height);
}
