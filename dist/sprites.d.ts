import type { EntityState } from './entities.js';
export interface SpriteFrame {
    file: string;
    origin: [x: number, y: number];
    size: [width: number, height: number];
}
export interface Sprite {
    name: string;
    frames: SpriteFrame[];
    offset: [left: number, top: number];
}
export interface SpriteState {
    sprites: {
        [spriteName: string]: Sprite;
    };
}
export declare const spriteState: SpriteState;
export declare const setSprite: (sprite: Sprite) => <State extends SpriteState>(state: State) => State;
export declare const setSprites: (sprites: Sprite[]) => <State extends SpriteState>(state: State) => State;
export declare function getSprite<State extends SpriteState>(state: State, name: string): Sprite;
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
export declare function drawSprite(sprite: Sprite, context: CanvasRenderingContext2D, position: [x: number, y: number], frameIndex?: number): void;
export declare function updateAnimatedSprites<State extends SpriteState & EntityState>(state: State, { time }: {
    time: number;
}): State;
export declare function calculateNewFrameIndex(amountOfFrames: number, framesPerSecond: number, elapsedTime: number, isLooping: boolean): number;
export {};
