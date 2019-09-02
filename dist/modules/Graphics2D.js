export const imageCache = {};
export default class Graphics2D {
    constructor(engine) {
        this.sprites = {};
        this.engine = engine;
        engine.addEventHandler('beforeDraw', updateViewportPositions);
        engine.addEventHandlerForEntities('beforeDraw', updateSpriteFrame, {
            'sprite': true,
        });
        engine.addEventHandlerForEntityGroup('draw', drawEntitySprite, {
            'sprite': true,
            'position': true,
        });
    }
    loadSpriteAtlas(sprites) {
        sprites.forEach((spriteDefinition) => {
            this.createSpriteFromSpriteSheet(spriteDefinition);
        });
    }
    createSprite(id, file, frames, origin = { top: 0, left: 0 }) {
        const newSprite = {
            id,
            file,
            frames,
            origin,
        };
        this.sprites = Object.assign({}, this.sprites, { [newSprite.id]: newSprite });
        return newSprite;
    }
    createSpriteFromSpriteSheet(spriteSheet) {
        const frames = spriteSheet.frames.reduce((frameSet, frameIndex) => {
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
            ];
        }, []);
        this.createSprite(spriteSheet.name, spriteSheet.file, frames, spriteSheet.origin);
    }
    getComponentForSprite(spriteId, framesPerSecond = 0, isAnimating = false, isLooping = false, startFrame = 0) {
        if (!this.sprites.hasOwnProperty(spriteId)) {
            throw new Error(`Sprite with ${spriteId} doesn't exist.`);
        }
        return {
            id: spriteId,
            frame: startFrame,
            framesPerSecond,
            isAnimating,
            isLooping,
        };
    }
    getSprite(spriteId) {
        if (!this.sprites.hasOwnProperty(spriteId)) {
            throw new Error(`Sprite with ${spriteId} doesn't exist.`);
        }
        return this.sprites[spriteId];
    }
}
export function updateSpriteFrame(engine, entity, timeElapsed) {
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
    entity.components.sprite.frame = calculateFrameIndexFromTimeDifference(spriteAsset.frames.length, entity.components.sprite.framesPerSecond, entity.components.sprite.animationStart, timeElapsed, entity.components.sprite.isLooping);
}
export function drawEntitySprite(engine, entities) {
    engine.getViewportsInCurrentRoom().forEach((viewport) => {
        engine.context.clearRect(viewport.origin.x, viewport.origin.y, viewport.size.width, viewport.size.height);
        engine.context.fillStyle = 'black';
        engine.context.fillRect(viewport.origin.x, viewport.origin.y, viewport.size.width, viewport.size.height);
        const visibleEntities = engine.filterEntities(entities.map((entity) => entity.id), {
            'position': (position, entity, engine) => {
                return isEntityVisibleInViewport(entity, viewport, engine);
            }
        });
        sortByDepth(visibleEntities, engine.currentRoom).forEach((entity) => {
            const sprite = engine.modules.Graphics2D.sprites[entity.components.sprite.id];
            const spriteFrame = sprite.frames[entity.components.sprite.frame];
            const drawPosition = {
                x: (entity.components.position.x + sprite.origin.left) - (viewport.position.x - viewport.origin.x),
                y: (entity.components.position.y + sprite.origin.top) - (viewport.position.y - viewport.origin.y),
            };
            engine.context.drawImage(getImageForFilePath(sprite.file), spriteFrame.offset.left, spriteFrame.offset.top, spriteFrame.size.width, spriteFrame.size.height, drawPosition.x, drawPosition.y, spriteFrame.size.width, spriteFrame.size.height);
        });
    });
}
export function calculateEntityBounds(engine, entity) {
    if (!entity.components.position) {
        throw new Error(`Entity with ID ${entity.id} has no position to calculate bounds for.`);
    }
    if (!entity.components.sprite) {
        return Object.assign({}, entity.components.position, { width: 0, height: 0 });
    }
    const sprite = engine.modules.Graphics2D.sprites[entity.components.sprite.id];
    const spriteFrame = sprite.frames[entity.components.sprite.frame];
    return Object.assign({}, entity.components.position, spriteFrame.size);
}
export function calculateViewportPositionCenteredOnEntity(engine, viewport, room, entityToFollow) {
    if (!entityToFollow ||
        !entityToFollow.components.position ||
        !entityToFollow.components.sprite) {
        return viewport.position;
    }
    const entityBounds = calculateEntityBounds(engine, entityToFollow);
    const horizontalOffset = entityBounds.x - (viewport.size.width / 2) + (entityBounds.width / 2);
    const verticalOffset = entityBounds.y - (viewport.size.height / 2) + (entityBounds.height / 2);
    const horizontalLowerBound = 0;
    const verticalLowerBound = 0;
    const horizontalUpperBound = room.size.width - viewport.size.width;
    const verticalUpperBound = room.size.height - viewport.size.height;
    const newViewportPosition = {
        x: Math.min(Math.max(horizontalOffset, horizontalLowerBound), horizontalUpperBound),
        y: Math.min(Math.max(verticalOffset, verticalLowerBound), verticalUpperBound),
    };
    return newViewportPosition;
}
export function updateViewportPositions(engine) {
    const viewportsToUpdate = engine.getViewportsInCurrentRoom().filter((viewport) => {
        return viewport.entityToFollow !== null;
    });
    viewportsToUpdate.forEach((viewport) => {
        viewport.position = calculateViewportPositionCenteredOnEntity(engine, viewport, engine.currentRoom, engine.getEntity(viewport.entityToFollow));
    });
}
export function isEntityAtPosition(engine, entity, position) {
    const entityBounds = calculateEntityBounds(engine, entity);
    return position.x >= entityBounds.x &&
        position.y >= entityBounds.y &&
        position.x <= entityBounds.x + entityBounds.width &&
        position.y <= entityBounds.y + entityBounds.height;
}
function sortByDepth(entities, inRoom) {
    return [...entities].sort((entityA, entityB) => {
        const layerDepthA = inRoom.layers[entityA.components.layer || 'default'];
        const layerDepthB = inRoom.layers[entityB.components.layer || 'default'];
        if (layerDepthA > layerDepthB)
            return -1;
        if (layerDepthA < layerDepthB)
            return 1;
        const depthA = (entityA.components.depth || 0);
        const depthB = (entityB.components.depth || 0);
        if (depthA > depthB)
            return -1;
        if (depthA < depthB)
            return 1;
        return 0;
    });
}
export function findEntitiesAtPosition(engine, position) {
    const entitiesWithPosition = engine.getEntities({ position: true });
    const entitiesAtPosition = entitiesWithPosition
        .filter((entity) => isEntityAtPosition(engine, entity, position));
    const sortedEntities = sortByDepth(entitiesAtPosition, engine.currentRoom).reverse();
    return sortedEntities;
}
export function isEntityVisibleInViewport(entity, viewport, engine) {
    const entityBounds = calculateEntityBounds(engine, entity);
    return entityBounds.x < viewport.position.x + viewport.size.width
        && entityBounds.y < viewport.position.y + viewport.size.height
        && entityBounds.x + entityBounds.width > viewport.position.x
        && entityBounds.y + entityBounds.height > viewport.position.y;
}
export function calculateFrameIndexFromTimeDifference(amountOfFrames, framesPerSecond, timeOfAnimationStart = 0, currentTime, isLooping = true) {
    const elapsed = currentTime - timeOfAnimationStart;
    if (isLooping) {
        return Math.round(elapsed / (1000 / framesPerSecond)) % amountOfFrames;
    }
    return Math.min((Math.round(elapsed / 1000) / framesPerSecond), amountOfFrames - 1);
}
export function getImageForFilePath(filePath, shouldGetCached = true) {
    if (!imageCache[filePath] || !shouldGetCached) {
        const image = new Image();
        image.src = filePath;
        imageCache[filePath] = image;
    }
    return imageCache[filePath];
}
