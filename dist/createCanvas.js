export function createCanvas(document, size, scale = 1) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', size.width.toString());
    canvas.setAttribute('height', size.height.toString());
    const canvasStyle = canvas.style;
    canvasStyle.width = `${size.width * scale}px`;
    canvasStyle.height = `${size.height * scale}px`;
    canvasStyle.imageRendering = '-moz-crisp-edges';
    canvasStyle.imageRendering = '-webkit-crisp-edges';
    canvasStyle.imageRendering = 'pixelated';
    canvasStyle.backgroundColor = 'black';
    return canvas;
}
