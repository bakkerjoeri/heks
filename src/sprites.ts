import { GameState, Position, Size } from './types';

export interface Sprite {
	name: string;
	path: string;
	size: Size;
	origin: Position;
}

export const addSprite = (sprite: Sprite) => (state: GameState): GameState => {
	return {
		...state,
		sprites: {
			...state.sprites,
			[sprite.name]: sprite,
		}
	}
}

export function getSprite(state: GameState, name: string): Sprite {
	if (!state.sprites.hasOwnProperty(name)) {
		throw new Error(`No sprite with name ${name} found.`);
	}

	return state.sprites[name];
}

interface DrawOptions {
    scale?: number;
    offset?: Position;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
}

export function drawSprite(
    sprite: Sprite,
    context: CanvasRenderingContext2D,
    position: Position,
    { scale = 1, offset = {x: 0, y: 0} }: DrawOptions = {}
): void {

	context.drawImage(
		getImageForFilePath(sprite.path),
		sprite.origin.x, sprite.origin.y,
		sprite.size.width, sprite.size.height,
		position.x + offset.x, position.y + offset.y,
		sprite.size.width * scale, sprite.size.height * scale,
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

	return image;
}
