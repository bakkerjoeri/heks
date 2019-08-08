import Hex, { Boundaries, Room, Viewport, Position, PositionComponent, WithModules } from './../Hex.js';
import SpriteManager from './SpriteManager.js';
import { Entity } from './../Entity.js';
import Module from './../Module.js';
import { SpriteComponent, getImageForFilePath } from './SpriteManager.js';

export default class Renderer implements Module {
    public engine: Hex & WithModules<{ Renderer: Renderer; SpriteManager: SpriteManager }>;

    public constructor(engine: Hex & WithModules<{ Renderer: Renderer; SpriteManager: SpriteManager }>) {
        this.engine = engine;

        engine.addEventHandler('beforeDraw', updateViewportPositions);

        engine.addEventHandlerForEntities<{
            sprite: SpriteComponent;
        }>('beforeDraw', updateSpriteFrame, {
            'sprite': true,
        });

        engine.addEventHandlerForEntityGroup<{
            sprite: SpriteComponent;
            position: PositionComponent;
        }>('draw', drawEntitySprite, {
            'sprite': true,
            'position': true,
        });
    }
}

export function updateSpriteFrame(
    engine: Hex & { SpriteManager: SpriteManager },
    entity: Entity & { sprite: SpriteComponent },
    timeElapsed: number
): void {
    const spriteAsset = engine.SpriteManager.getSprite(entity.sprite.id);

    if (!entity.sprite.isAnimating) {
        delete entity.sprite.animationStart;

        return;
    }

    if (spriteAsset.frames.length <= 1 || entity.sprite.framesPerSecond === 0) {
        return;
    }

    if (!entity.sprite.hasOwnProperty('animationStart')) {
        entity.sprite.animationStart = timeElapsed;
    }

    entity.sprite.frame = calculateFrameIndexFromTimeDifference(
        spriteAsset.frames.length,
        entity.sprite.framesPerSecond,
        entity.sprite.animationStart,
        timeElapsed,
        entity.sprite.isLooping,
    );
}


export function drawEntitySprite(
    engine: Hex & { SpriteManager: SpriteManager },
    entities: (Entity & { position: PositionComponent; sprite: SpriteComponent })[]
): void {
    engine.getViewportsInCurrentRoom().forEach((viewport): void => {
        engine.context.clearRect(
            viewport.origin.x,
            viewport.origin.y,
            viewport.size.width,
            viewport.size.height
        );

        engine.context.fillStyle = 'black';
        engine.context.fillRect(
            viewport.origin.x,
            viewport.origin.y,
            viewport.size.width,
            viewport.size.height
        );

        const visibleEntities = engine.filterEntities<{
            position: PositionComponent;
            sprite: SpriteComponent;
        }>(
            entities.map((entity): Entity['id'] => entity.id),
            {
                'position': (position, entity, engine): boolean => {
                    return isEntityVisibleInViewport(
                        entity,
                        viewport,
                        engine as Hex & { SpriteManager: SpriteManager }
                    );
                }
            }
        );

        sortByDepth(visibleEntities, engine.currentRoom).forEach((entity): void => {
            const sprite = engine.SpriteManager.sprites[entity.sprite.id];
            const spriteFrame = sprite.frames[entity.sprite.frame];

            const drawPosition = {
                x: (entity.position.x + sprite.origin.left) - (viewport.position.x - viewport.origin.x),
                y: (entity.position.y + sprite.origin.top) - (viewport.position.y - viewport.origin.y),
            }

            engine.context.drawImage(
                getImageForFilePath(sprite.file),
                spriteFrame.offset.left, spriteFrame.offset.top,
                spriteFrame.size.width, spriteFrame.size.height,
                drawPosition.x, drawPosition.y,
                spriteFrame.size.width, spriteFrame.size.height
            );
        });
    });
}

export function calculateEntityBounds(
    engine: Hex & { SpriteManager: SpriteManager },
    entity: Entity & { position?: PositionComponent; sprite?: SpriteComponent }
): Boundaries {
    if (!entity.position) {
        throw new Error(`Entity with ID ${entity.id} has no position to calculate bounds for.`);
    }

    if (!entity.sprite) {
        return {
            ...entity.position,
            width: 0,
            height: 0,
        }
    }

    const sprite = engine.SpriteManager.sprites[entity.sprite.id];
    const spriteFrame = sprite.frames[entity.sprite.frame];

    return {
        ...entity.position,
        ...spriteFrame.size,
    };
}

export function calculateViewportPositionCenteredOnEntity(
    engine: Hex & { SpriteManager: SpriteManager },
    viewport: Viewport,
    room: Room,
    entityToFollow: Entity & { position: PositionComponent; sprite: SpriteComponent }
): Position {
    if (
        !entityToFollow ||
        !entityToFollow.position ||
        !entityToFollow.sprite
    ) {
        return viewport.position;
    }

    const entityBounds = calculateEntityBounds(engine, entityToFollow);

    const horizontalOffset = entityBounds.x - (viewport.size.width / 2) + (entityBounds.width / 2);
    const verticalOffset = entityBounds.y - (viewport.size.height / 2) + (entityBounds.height / 2);
    const horizontalLowerBound = 0;
    const verticalLowerBound = 0;
    const horizontalUpperBound = room.size.width - viewport.size.width;
    const verticalUpperBound = room.size.height - viewport.size.height;

    let newViewportPosition = {
        x: Math.min(Math.max(horizontalOffset, horizontalLowerBound), horizontalUpperBound),
        y: Math.min(Math.max(verticalOffset, verticalLowerBound), verticalUpperBound),
    };

    return newViewportPosition;
}

export function updateViewportPositions(engine: Hex & { SpriteManager: SpriteManager }): void {
    const viewportsToUpdate = engine.getViewportsInCurrentRoom().filter((viewport): boolean => {
        return viewport.entityToFollow !== null;
    });

    viewportsToUpdate.forEach((viewport): void => {
        viewport.position = calculateViewportPositionCenteredOnEntity(
            engine,
            viewport,
            engine.currentRoom,
            engine.getEntity(viewport.entityToFollow)
        );
    });
}

export function isEntityAtPosition(
    engine: Hex & { SpriteManager: SpriteManager },
    entity: Entity,
    position: Position
): boolean {
    const entityBounds = calculateEntityBounds(engine, entity);

    return position.x >= entityBounds.x &&
        position.y >= entityBounds.y &&
        position.x <= entityBounds.x + entityBounds.width &&
        position.y <= entityBounds.y + entityBounds.height;
}


function sortByDepth<T extends Entity & { layer?: string; depth?: number }>(
    entities: T[],
    inRoom: Room
): T[] {
    return [...entities].sort((entityA, entityB): number => {
        const layerDepthA = inRoom.layers[entityA.layer || 'default'];
        const layerDepthB = inRoom.layers[entityB.layer || 'default'];

        if (layerDepthA > layerDepthB) return -1;
        if (layerDepthA < layerDepthB) return 1;

        const depthA = (entityA.depth || 0);
        const depthB = (entityB.depth || 0);

        if (depthA > depthB) return -1;
        if (depthA < depthB) return 1;

        return 0;
    });
}

export function findEntitiesAtPosition(
    engine: Hex & { SpriteManager: SpriteManager },
    position: Position
): (Entity & { position: Position })[] {
    const entitiesWithPosition = engine.getEntities<{ position: Position }>({ position: true });
    const entitiesAtPosition = entitiesWithPosition
        .filter((entity): boolean => isEntityAtPosition(engine, entity, position));

    return sortByDepth(entitiesAtPosition, engine.currentRoom).reverse();
}

export function isEntityVisibleInViewport(
    entity: Entity & { position?: PositionComponent; sprite?: SpriteComponent },
    viewport: Viewport,
    engine: Hex & { SpriteManager: SpriteManager },
): boolean {
    const entityBounds = calculateEntityBounds(engine, entity);

    return entityBounds.x < viewport.position.x + viewport.size.width
        && entityBounds.y < viewport.position.y + viewport.size.height
        && entityBounds.x + entityBounds.width > viewport.position.x
        && entityBounds.y + entityBounds.height > viewport.position.y;
}

export function calculateFrameIndexFromTimeDifference(
    amountOfFrames: SpriteComponent['frame'],
    framesPerSecond: SpriteComponent['framesPerSecond'],
    timeOfAnimationStart: SpriteComponent['animationStart'],
    currentTime: number,
    isLooping: boolean = true
): number {
    let elapsed = currentTime - timeOfAnimationStart;

    if (isLooping) {
        return Math.round(elapsed / (1000 / framesPerSecond)) % amountOfFrames;
    }

    return Math.min((Math.round(elapsed / 1000) / framesPerSecond), amountOfFrames - 1);
}
