import { Size } from './types.js';
export declare function setupGame(containerSelector: string, size: Size, scale?: number): {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
};
