import Hex, { Boundaries, Room, Viewport, Position, PositionComponent, Size, Offset } from './../Hex.js';
import Entity from './../Entity.js';
import Module from './../Module.js';
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
export default class Graphics2D implements Module {
    engine: Hex;
    constructor(engine: Hex);
    sprites: {
        [spriteId in Sprite['id']]: Sprite;
    };
    loadSpriteAtlas(sprites: SpriteSheet[]): void;
    createSprite(id: Sprite['id'], file: Sprite['file'], frames: Sprite['frames'], origin?: Sprite['origin']): Sprite;
    createSpriteFromSpriteSheet(spriteSheet: SpriteSheet): void;
    getComponentForSprite(spriteId: SpriteComponent['id'], framesPerSecond?: SpriteComponent['framesPerSecond'], isAnimating?: SpriteComponent['isAnimating'], isLooping?: SpriteComponent['isLooping'], startFrame?: SpriteComponent['frame']): SpriteComponent;
    getSprite(spriteId: Sprite['id']): Sprite;
}
export declare function updateSpriteFrame(engine: Hex, entity: Entity<{
    sprite: SpriteComponent;
}>, timeElapsed: number): void;
export declare function drawEntitySprite(engine: Hex, entities: (Entity<{
    position: PositionComponent;
    sprite: SpriteComponent;
}>)[]): void;
export declare function calculateEntityBounds(engine: Hex, entity: Entity<{
    position?: PositionComponent;
    sprite?: SpriteComponent;
}>): Boundaries;
export declare function calculateViewportPositionCenteredOnEntity(engine: Hex, viewport: Viewport, room: Room, entityToFollow?: Entity<{
    position: PositionComponent;
    sprite: SpriteComponent;
}>): Position;
export declare function updateViewportPositions(engine: Hex): void;
export declare function isEntityAtPosition(engine: Hex, entity: Entity, position: Position): boolean;
export declare function findEntitiesAtPosition(engine: Hex, position: Position): (Entity<{
    position: PositionComponent;
}>)[];
export declare function isEntityVisibleInViewport(entity: Entity<{
    position?: PositionComponent;
    sprite?: SpriteComponent;
}>, viewport: Viewport, engine: Hex): boolean;
export declare function calculateFrameIndexFromTimeDifference(amountOfFrames: SpriteComponent['frame'], framesPerSecond: SpriteComponent['framesPerSecond'], timeOfAnimationStart: number | undefined, currentTime: number, isLooping?: boolean): number;
export declare function getImageForFilePath(filePath: string, shouldGetCached?: boolean): HTMLImageElement;
