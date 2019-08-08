import Module from './../Module.js';
import Hex, { Offset, Size, WithModules } from './../Hex.js';
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

export default class SpriteManager implements Module {
    public engine: Hex & WithModules<{ SpriteManager: SpriteManager }>;
    public sprites: { [spriteId in Sprite['id']]: Sprite } = {};

    public constructor(engine: Hex & WithModules<{ SpriteManager: SpriteManager }>) {
        this.engine = engine;
    }

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

export function getImageForFilePath(filePath: string, shouldGetCached: boolean = true): HTMLImageElement {
    if (!imageCache[filePath] || !shouldGetCached) {
        const image = new Image();
        image.src = filePath;
        imageCache[filePath] = image;
    }

    return imageCache[filePath];
}
