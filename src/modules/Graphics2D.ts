import Hex, { Boundaries, Room, Viewport, Position, PositionComponent, Size, Offset } from './../Hex.js';
import { Components } from './../Component.js';
import Entity from './../Entity.js';
import Module from './../Module.js';
import { ComponentObject } from './../Component.js';

export const imageCache: {
    [filePath: string]: HTMLImageElement;
} = {};

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
    public engine: Hex;

    public constructor(engine: Hex) {
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

    public sprites: { [spriteId in Sprite['id']]: Sprite } = {};

    public loadSpriteAtlas(sprites: SpriteSheet[]): void {
        sprites.forEach((spriteDefinition): void => {
            this.createSpriteFromSpriteSheet(spriteDefinition);
        });
    }

    public createSprite(
        id: Sprite['id'],
        file: Sprite['file'],
        frames: Sprite['frames'],
        origin: Sprite['origin'] = { top: 0, left: 0 }
    ): Sprite {
        const newSprite: Sprite = {
            id,
            file,
            frames,
            origin,
        };

        this.sprites = {
            ...this.sprites,
            [newSprite.id]: newSprite,
        };

        return newSprite;
    }

    public createSpriteFromSpriteSheet(spriteSheet: SpriteSheet): void {
        const frames = spriteSheet.frames.reduce((frameSet: SpriteFrame[], frameIndex): SpriteFrame[] => {
            const frameRow = 0;
            const frameColumn = frameIndex + spriteSheet.frameStart;

            return [
                ...frameSet,
                {
                    size: spriteSheet.frameSize,
                    offset: {
                        top: frameRow * spriteSheet.frameSize.height,
                        left: frameColumn * spriteSheet.frameSize.width,
                    }
                }
            ]
        }, []);

        this.createSprite(
            spriteSheet.name,
            spriteSheet.file,
            frames,
            spriteSheet.origin,
        );
    }

    public getComponentForSprite(
        spriteId: SpriteComponent['id'],
        framesPerSecond: SpriteComponent['framesPerSecond'] = 0,
        isAnimating: SpriteComponent['isAnimating'] = false,
        isLooping: SpriteComponent['isLooping'] = false,
        startFrame: SpriteComponent['frame'] = 0
    ): SpriteComponent {
        if (!this.sprites.hasOwnProperty(spriteId)) {
            throw new Error(`Sprite with ${spriteId} doesn't exist.`);
        }

        return {
            id: spriteId,
            frame: startFrame,
            framesPerSecond,
            isAnimating,
            isLooping,
        }
    }

    public getSprite(spriteId: Sprite['id']): Sprite {
        if (!this.sprites.hasOwnProperty(spriteId)) {
            throw new Error(`Sprite with ${spriteId} doesn't exist.`);
        }

        return this.sprites[spriteId];
    }
}

export function updateSpriteFrame(
    engine: Hex,
    entity: Entity<{ sprite: SpriteComponent }>,
    timeElapsed: number
): void {
    const spriteAsset = engine.modules.Graphics2D.getSprite(entity.components.sprite.id);

    if (!entity.components.sprite.isAnimating) {
        delete entity.components.sprite.animationStart;

        return;
    }

    if (spriteAsset.frames.length <= 1 || entity.components.sprite.framesPerSecond === 0) {
        return;
    }

    if (!entity.components.sprite.hasOwnProperty('animationStart')) {
        entity.components.sprite.animationStart = timeElapsed;
    }

    entity.components.sprite.frame = calculateFrameIndexFromTimeDifference(
        spriteAsset.frames.length,
        entity.components.sprite.framesPerSecond,
        entity.components.sprite.animationStart,
        timeElapsed,
        entity.components.sprite.isLooping,
    );
}


export function drawEntitySprite(
    engine: Hex,
    entities: (Entity<{ position: PositionComponent; sprite: SpriteComponent }>)[]
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
                        engine
                    );
                }
            }
        );

        sortByDepth(visibleEntities, engine.currentRoom).forEach((entity): void => {
            const sprite = engine.modules.Graphics2D.sprites[entity.components.sprite.id];
            const spriteFrame = sprite.frames[entity.components.sprite.frame];

            const drawPosition = {
                x: (entity.components.position.x + sprite.origin.left) - (viewport.position.x - viewport.origin.x),
                y: (entity.components.position.y + sprite.origin.top) - (viewport.position.y - viewport.origin.y),
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
    engine: Hex,
    entity: Entity<{ position?: PositionComponent; sprite?: SpriteComponent }>
): Boundaries {
    if (!entity.components.position) {
        throw new Error(`Entity with ID ${entity.id} has no position to calculate bounds for.`);
    }

    if (!entity.components.sprite) {
        return {
            ...entity.components.position,
            width: 0,
            height: 0,
        }
    }

    const sprite = engine.modules.Graphics2D.sprites[entity.components.sprite.id];
    const spriteFrame = sprite.frames[entity.components.sprite.frame];

    return {
        ...entity.components.position,
        ...spriteFrame.size,
    };
}

export function calculateViewportPositionCenteredOnEntity(
    engine: Hex,
    viewport: Viewport,
    room: Room,
    entityToFollow?: Entity<{ position: PositionComponent; sprite: SpriteComponent }>
): Position {
    if (
        !entityToFollow ||
        !entityToFollow.components.position ||
        !entityToFollow.components.sprite
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

export function updateViewportPositions(engine: Hex): void {
    const viewportsToUpdate = engine.getViewportsInCurrentRoom().filter((viewport): boolean => {
        return viewport.entityToFollow !== null;
    }) as (Viewport & { entityToFollow: Entity })[];

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
    engine: Hex,
    entity: Entity,
    position: Position
): boolean {
    const entityBounds = calculateEntityBounds(engine, entity);

    return position.x >= entityBounds.x &&
        position.y >= entityBounds.y &&
        position.x <= entityBounds.x + entityBounds.width &&
        position.y <= entityBounds.y + entityBounds.height;
}


function sortByDepth<TEntity extends Entity<{ layer?: string; depth?: number } & Components>>(
    entities: TEntity[],
    inRoom: Room
): TEntity[] {
    return [...entities].sort((entityA, entityB): number => {
        const layerDepthA = inRoom.layers[entityA.components.layer || 'default'];
        const layerDepthB = inRoom.layers[entityB.components.layer || 'default'];

        if (layerDepthA > layerDepthB) return -1;
        if (layerDepthA < layerDepthB) return 1;

        const depthA = (entityA.components.depth || 0);
        const depthB = (entityB.components.depth || 0);

        if (depthA > depthB) return -1;
        if (depthA < depthB) return 1;

        return 0;
    });
}

export function findEntitiesAtPosition(
    engine: Hex,
    position: Position
): (Entity<{ position: PositionComponent }>)[] {
    const entitiesWithPosition = engine.getEntities<{ position: Position }>({ position: true });
    const entitiesAtPosition = entitiesWithPosition
        .filter((entity): boolean => isEntityAtPosition(engine, entity, position));

    const sortedEntities = sortByDepth(entitiesAtPosition, engine.currentRoom).reverse();

    return sortedEntities;
}

export function isEntityVisibleInViewport(
    entity: Entity<{ position?: PositionComponent; sprite?: SpriteComponent }>,
    viewport: Viewport,
    engine: Hex,
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
    timeOfAnimationStart: SpriteComponent['animationStart'] = 0,
    currentTime: number,
    isLooping: boolean = true
): number {
    let elapsed = currentTime - timeOfAnimationStart;

    if (isLooping) {
        return Math.round(elapsed / (1000 / framesPerSecond)) % amountOfFrames;
    }

    return Math.min((Math.round(elapsed / 1000) / framesPerSecond), amountOfFrames - 1);
}

export function getImageForFilePath(filePath: string, shouldGetCached: boolean = true): HTMLImageElement {
    if (!imageCache[filePath] || !shouldGetCached) {
        const image = new Image();
        image.src = filePath;
        imageCache[filePath] = image;
    }

    return imageCache[filePath];
}
