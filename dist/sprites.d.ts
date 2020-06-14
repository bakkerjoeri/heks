import type { GameState, Position, Size } from './types';
export interface SpriteFrame {
    file: string;
    origin: Position;
    size: Size;
}
export interface Sprite {
    name: string;
    frames: SpriteFrame[];
    offset: Position;
}
export declare const setSprite: (sprite: Sprite) => <State extends GameState>(state: State) => State;
export declare const setSprites: (sprites: Sprite[]) => <State extends GameState>(state: State) => State;
export declare function getSprite<State extends GameState>(state: State, name: string): Sprite;
export interface SpriteComponent {
    name: string;
    animationStartTime: number | null;
    currentFrameIndex: number;
    framesPerSecond: number;
    isLooping: boolean;
    isAnimating: boolean;
}
interface CreateSpriteOptions {
    startingFrame?: number;
    framesPerSecond?: number;
    isLooping?: boolean;
    isAnimating?: boolean;
}
export declare function createSpriteComponent(name: string, { startingFrame, framesPerSecond, isLooping, isAnimating }?: CreateSpriteOptions): SpriteComponent;
export declare function drawSprite(sprite: Sprite, context: CanvasRenderingContext2D, position: Position, frameIndex?: number): void;
export declare function getImageForFilePath(filePath: string, cached?: boolean): HTMLImageElement;
export declare function updateAnimatedSprites<State extends GameState>(state: State, { time }: {
    time: number;
}): State;
export declare function calculateNewFrameIndex(amountOfFrames: number, framesPerSecond: number, elapsedTime: number, isLooping: boolean): number;
export {};
