import { pipe } from '@bakkerjoeri/fp';
import { setComponent, setEntities, findEntities, getEntities } from './entities';
import type { GameState, Position, Size } from './types';

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

export const addSprite = (sprite: Sprite) => <State extends GameState>(state: State): State => {
	return {
		...state,
		sprites: {
			...state.sprites,
			[sprite.name]: sprite,
		}
	}
}

export const importSpriteSheet = (spriteSheet: SpriteSheet) => <State extends GameState>(state: State): State => {
    return pipe(...spriteSheet.map(addSprite))(state);
}

export function getSprite<State extends GameState>(state: State, name: string): Sprite {
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

export function updateAnimatedSprites<State extends GameState>(state: State, { time }: { time: number }): State {
	const entitiesWithSprites = findEntities(getEntities(state), {
		sprite: true,
	});

	const updatedEntities = entitiesWithSprites.map(entity => {
		const spriteComponent = entity.sprite as SpriteComponent;
		const spriteOfEntity = getSprite(state, entity.sprite.name);

		if (
			spriteComponent.framesPerSecond === 0
			|| spriteOfEntity.frames.length <= 1
			|| !spriteComponent.isAnimating
		) {
			return entity;
		}

		if (!entity.sprite.animationStartTime) {
			entity.sprite.animationStartTime = time;
		}

		const newFrameIndex = calculateNewFrameIndex(
			spriteOfEntity.frames.length,
			spriteComponent.framesPerSecond,
			time - entity.sprite.animationStartTime,
			spriteComponent.isLooping,
		);

		return setComponent('sprite')({
			...spriteComponent,
			currentFrameIndex: newFrameIndex,
		})(entity);
	});

	return setEntities(...updatedEntities)(state);
}

export function calculateNewFrameIndex(
	amountOfFrames: number,
	framesPerSecond: number,
	elapsedTime: number,
	isLooping: boolean
): number {
	if (isLooping) {
		return Math.round(elapsedTime / (1000 / framesPerSecond)) % amountOfFrames;
	}

	return Math.min((Math.round(elapsedTime / 1000) / framesPerSecond), amountOfFrames - 1);
}

export interface SpriteComponent {
	name: string;
	animationStartTime: number | null;
	currentFrameIndex: number;
	framesPerSecond: number;
	isLooping: boolean;
	isAnimating: boolean;
}

export interface CreateSpriteOptions {
	startingFrame?: number;
	framesPerSecond?: number;
	isLooping?: boolean;
	isAnimating?: boolean;
}

export function createSpriteComponent(name: string, {
	startingFrame = 0,
	framesPerSecond = 1,
	isLooping = true,
	isAnimating = true
}: CreateSpriteOptions = {}): SpriteComponent {
	return {
		name,
		animationStartTime: null,
		currentFrameIndex: startingFrame,
		framesPerSecond,
		isLooping,
		isAnimating,
	};
}
