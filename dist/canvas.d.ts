export declare function setupCanvas(containerSelector: string, size: [width: number, height: number], hideSystemCursor?: boolean): {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
};
export declare function clearCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, backgroundColor?: string): void;
