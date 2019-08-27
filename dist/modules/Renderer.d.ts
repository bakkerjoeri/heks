import Hex, { Boundaries, Room, Viewport, Position, PositionComponent } from './../Hex.js';
import SpriteManager from './SpriteManager.js';
import { Entity } from './../Entity.js';
import Module from './../Module.js';
import { SpriteComponent } from './SpriteManager.js';
export default class Renderer implements Module<{
    Renderer: Renderer;
    SpriteManager: SpriteManager;
}> {
    engine: Hex<{
        Renderer: Renderer;
        SpriteManager: SpriteManager;
    }>;
    constructor(engine: Hex<{
        Renderer: Renderer;
        SpriteManager: SpriteManager;
    }>);
}
export declare function updateSpriteFrame(engine: Hex<{
    SpriteManager: SpriteManager;
}>, entity: Entity<{
    sprite: SpriteComponent;
}>, timeElapsed: number): void;
export declare function drawEntitySprite(engine: Hex<{
    SpriteManager: SpriteManager;
}>, entities: (Entity<{
    position: PositionComponent;
    sprite: SpriteComponent;
}>)[]): void;
export declare function calculateEntityBounds(engine: Hex<{
    SpriteManager: SpriteManager;
}>, entity: Entity<{
    position?: PositionComponent;
    sprite?: SpriteComponent;
}>): Boundaries;
export declare function calculateViewportPositionCenteredOnEntity(engine: Hex<{
    SpriteManager: SpriteManager;
}>, viewport: Viewport, room: Room, entityToFollow?: Entity<{
    position: PositionComponent;
    sprite: SpriteComponent;
}>): Position;
export declare function updateViewportPositions(engine: Hex<{
    SpriteManager: SpriteManager;
}>): void;
export declare function isEntityAtPosition(engine: Hex<{
    SpriteManager: SpriteManager;
}>, entity: Entity, position: Position): boolean;
export declare function findEntitiesAtPosition(engine: Hex<{
    SpriteManager: SpriteManager;
}>, position: Position): (Entity<{
    position: PositionComponent;
}>)[];
export declare function isEntityVisibleInViewport(entity: Entity<{
    position?: PositionComponent;
    sprite?: SpriteComponent;
}>, viewport: Viewport, engine: Hex<{
    SpriteManager: SpriteManager;
}>): boolean;
export declare function calculateFrameIndexFromTimeDifference(amountOfFrames: SpriteComponent['frame'], framesPerSecond: SpriteComponent['framesPerSecond'], timeOfAnimationStart: number | undefined, currentTime: number, isLooping?: boolean): number;
