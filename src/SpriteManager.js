export const imageCache = {};

export default class SpriteManager {
    constructor(engine) {
        this.engine = engine;
        this.sprites = {};
    }

    createSprite(id, file, size, offset = { top: 0, left: 0 }) {
        const newSprite = {
            id,
            file,
            size,
            offset,
        };

        this.sprites = {
            ...this.sprites,
            [newSprite.id]: newSprite,
        };

        return newSprite;
    }

    getComponentForSprite(spriteId) {
        if (!this.sprites.hasOwnProperty(spriteId)) {
            throw new Error(`Sprite with ${spriteId} doesn't exist.`);
        }

        return {
            id: spriteId,
        }
    }

    getSprite(spriteId) {
        if (!this.sprites.hasOwnProperty(spriteId)) {
            throw new Error(`Sprite with ${spriteId} doesn't exist.`);
        }

        return this.sprites[spriteId];
    }

    getImageForFilePath(filePath, cached = true) {
        if (!imageCache[filePath] || !cached) {
            const image = new Image();
            image.src = filePath;
            imageCache[filePath] = image;
        }

        return imageCache[filePath];
    }
}
