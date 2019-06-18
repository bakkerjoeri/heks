export const imageCache = {};

export default class SpriteManager {
    constructor(engine) {
        this.engine = engine;
        this.sprites = {};
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

        this.sprites = {
            ...this.sprites,
            [newSprite.id]: newSprite,
        };

        return newSprite;
    }

    createSpriteFromSpriteSheet(definition) {
        const frames = definition.frames.reduce((frameSet, frameIndex) => {
            const frameRow = 0;
            const frameColumn = frameIndex + definition.frameStart;

            return [
                ...frameSet,
                {
                    size: definition.frameSize,
                    offset: {
                        top: frameRow * definition.frameSize.height,
                        left: frameColumn * definition.frameSize.width,
                    }
                }
            ]
        }, []);

        this.createSprite(
            definition.name,
            definition.file,
            frames,
            definition.origin,
        );
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
        }
    }

    getSprite(spriteId) {
        if (!this.sprites.hasOwnProperty(spriteId)) {
            throw new Error(`Sprite with ${spriteId} doesn't exist.`);
        }

        return this.sprites[spriteId];
    }
}

export function getImageForFilePath(filePath, cached = true) {
    if (!imageCache[filePath] || !cached) {
        const image = new Image();
        image.src = filePath;
        imageCache[filePath] = image;
    }

    return imageCache[filePath];
}
