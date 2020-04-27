import { GameState, Position, Size } from './types';
export interface Sprite {
    name: string;
    path: string;
    size: Size;
    origin: Position;
}
export declare const addSprite: (sprite: Sprite) => (state: GameState) => GameState;
export declare function getSprite(state: GameState, name: string): Sprite;
interface DrawOptions {
    scale?: number;
    offset?: Position;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
}
export declare function drawSprite(sprite: Sprite, context: CanvasRenderingContext2D, position: Position, { scale, offset }?: DrawOptions): void;
export declare function getImageForFilePath(filePath: string, cached?: boolean): HTMLImageElement;
export {};
