import Module from './../Module.js';
import Hex, { Offset, Size } from './../Hex.js';
import { ComponentObject } from './../Component.js';
export declare const imageCache: {
    [filePath: string]: HTMLImageElement;
};
export interface SpriteSheet {
    name: string;
    file: string;
    frameSize: Size;
    frameStart: number;
    frameTotal: number;
    frames: number[];
    origin: Offset;
}
export interface Sprite {
    id: string;
    file: string;
    frames: SpriteFrame[];
    origin: Offset;
}
export interface SpriteFrame {
    size: Size;
    offset: Offset;
}
export interface SpriteComponent extends ComponentObject {
    id: Sprite['id'];
    frame: number;
    framesPerSecond: number;
    isAnimating: boolean;
    isLooping: boolean;
    animationStart?: number;
}
export default class SpriteManager implements Module<{
    SpriteManager: SpriteManager;
}> {
    engine: Hex<{
        SpriteManager: SpriteManager;
    }>;
    sprites: {
        [spriteId in Sprite['id']]: Sprite;
    };
    constructor(engine: Hex<{
        SpriteManager: SpriteManager;
    }>);
    loadSpriteAtlas(sprites: SpriteSheet[]): void;
    createSprite(id: Sprite['id'], file: Sprite['file'], frames: Sprite['frames'], origin?: Sprite['origin']): Sprite;
    createSpriteFromSpriteSheet(spriteSheet: SpriteSheet): void;
    getComponentForSprite(spriteId: SpriteComponent['id'], framesPerSecond?: SpriteComponent['framesPerSecond'], isAnimating?: SpriteComponent['isAnimating'], isLooping?: SpriteComponent['isLooping'], startFrame?: SpriteComponent['frame']): SpriteComponent;
    getSprite(spriteId: Sprite['id']): Sprite;
}
export declare function getImageForFilePath(filePath: string, shouldGetCached?: boolean): HTMLImageElement;
