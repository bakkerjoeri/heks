import { getImageForFilePath } from './SpriteManager.js';

export default class Renderer {
    constructor(engine) {
        engine.addEventHandler('beforeDraw', updateViewportPositions);

        engine.addEventHandlerForEntities('beforeDraw', updateSpriteFrame, {
            'sprite': true,
        });

        engine.addEventHandlerForEntityGroup('draw', drawEntitySprite, {
            'sprite': true,
            'position': true,
        });
    }
}

export function updateViewportPositions(engine) {
    const viewportsToUpdate = engine.getViewportsInCurrentRoom().filter((viewport) => {
        return viewport.entityToFollow !== null;
    });

    viewportsToUpdate.forEach((viewport) => {
        viewport.position = calculateViewportPositionCenteredOnEntity(engine, viewport, engine.currentRoom, engine.getEntity(viewport.entityToFollow));
    });
}

export function calculateViewportPositionCenteredOnEntity(engine, viewport, room, entityToFollow) {
    if (
        !entityToFollow ||
        !entityToFollow.position ||
        !entityToFollow.sprite
    ) {
        return viewport.position;
    }

    const sprite = engine.SpriteManager.sprites[entityToFollow.sprite.id];
    const spriteFrame = sprite.frames[entityToFollow.sprite.frame];
    debugger;
    const horizontalOffset = entityToFollow.position.x - (viewport.size.width / 2) + (spriteFrame.size.width / 2);
    const verticalOffset = entityToFollow.position.y - (viewport.size.height / 2) + (spriteFrame.size.height / 2);
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

export function drawEntitySprite(engine, entities) {
    engine.getViewportsInCurrentRoom().forEach((viewport) => {
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

        const visibleEntities = engine.filterEntities(entities.map(entity => entity.id), {
            'position': (position, entity, engine) => {
                return isEntityVisibleInViewport(entity, viewport, engine);
            }
        });

        sortByDepth(visibleEntities, engine.currentRoom).forEach((entity) => {
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

export function isEntityVisibleInViewport(entity, viewport, engine) {
    const sprite = engine.SpriteManager.sprites[entity.sprite.id];
    const spriteFrame = sprite.frames[entity.sprite.frame];

    let visibleBoundingBox = {
        x: entity.position.x + sprite.origin.left,
        y: entity.position.y + sprite.origin.top,
        width: spriteFrame.size.width,
        height: spriteFrame.size.height,
    }

    return visibleBoundingBox.x < viewport.position.x + viewport.size.width
        && visibleBoundingBox.y < viewport.position.y + viewport.size.height
        && visibleBoundingBox.x + visibleBoundingBox.width > viewport.position.x
        && visibleBoundingBox.y + visibleBoundingBox.height > viewport.position.y;
}

export function updateSpriteFrame(engine, entity, timeElapsed) {
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

export function calculateFrameIndexFromTimeDifference(amountOfFrames, framesPerSecond, timeOfAnimationStart, currentTime, isLooping = true) {
    let elapsed = currentTime - timeOfAnimationStart;

    if (isLooping) {
        return Math.round(elapsed / (1000 / framesPerSecond)) % amountOfFrames;
    }

    return Math.min((Math.round(elapsed / 1000) / framesPerSecond), amountOfFrames - 1);
}

function sortByDepth(entities, inRoom) {
    return [...entities].sort((entityA, entityB) => {
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
