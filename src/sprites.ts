import { GameState, Position, Size } from './types';
import { pipe } from '@bakkerjoeri/fp';

export interface SpriteFrame {
    file: string;
    origin: Position;
    size: Size;
}

export interface Sprite {
    name: string;
    frames: SpriteFrame[];
    offset: Position;
}

export type SpriteSheet = Sprite[];

export const addSprite = (sprite: Sprite) => (state: GameState): GameState => {
	return {
		...state,
		sprites: {
			...state.sprites,
			[sprite.name]: sprite,
		}
	}
}

export const importSpriteSheet = (spriteSheet: SpriteSheet) => (state: GameState): GameState => {
    return pipe(...spriteSheet.map(addSprite))(state);
}

export function getSprite(state: GameState, name: string): Sprite {
	if (!state.sprites.hasOwnProperty(name)) {
		throw new Error(`No sprite with name ${name} found.`);
	}

	return state.sprites[name];
}

interface DrawOptions {
    scale?: number;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
}

export function drawSprite(
    sprite: Sprite,
    context: CanvasRenderingContext2D,
    position: Position,
    frameIndex = 0,
    { scale = 1 }: DrawOptions = {}
): void {
    if (!sprite.frames[frameIndex]) {
        throw new Error(`Sprite ${sprite.name} does not have frame with index ${frameIndex}`);
    }

    const frame = sprite.frames[frameIndex];
    const image = getImageForFilePath(frame.file);

	context.drawImage(
		image,
		frame.origin.x, frame.origin.y,
		frame.size.width, frame.size.height,
		(position.x + sprite.offset.x) * scale, (position.y + sprite.offset.y) * scale,
		frame.size.width * scale, frame.size.height * scale,
    );
}

const imageCache: {
	[path: string]: HTMLImageElement;
} = {};

export function getImageForFilePath(filePath: string, cached = true): HTMLImageElement {
	if (cached && imageCache[filePath]) {
		return imageCache[filePath];
	}

	const image = new Image();
	image.src = filePath;
	imageCache[filePath] = image;

    image.onerror = (): void => {
        delete imageCache[filePath];
        throw new Error(`No image found at ${filePath}.`);
    }

	return image;
}
