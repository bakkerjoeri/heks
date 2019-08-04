export const imageCache = {};
export default class SpriteManager {
    constructor(engine) {
        this.sprites = {};
        this.engine = engine;
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
export function getImageForFilePath(filePath, shouldGetCached = true) {
    if (!imageCache[filePath] || !shouldGetCached) {
        const image = new Image();
        image.src = filePath;
        imageCache[filePath] = image;
    }
    return imageCache[filePath];
}
