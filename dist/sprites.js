import { pipe } from '@bakkerjoeri/fp';
import { setComponent, setEntities, findEntities, getEntities } from './entities';
export const setSprite = (sprite) => (state) => {
    return Object.assign(Object.assign({}, state), { sprites: Object.assign(Object.assign({}, state.sprites), { [sprite.name]: sprite }) });
};
export const setSprites = (sprites) => (state) => {
    return pipe(...sprites.map(setSprite))(state);
};
export function getSprite(state, name) {
    if (!state.sprites.hasOwnProperty(name)) {
        throw new Error(`No sprite with name ${name} found.`);
    }
    return state.sprites[name];
}
export function createSpriteComponent(name, { startingFrame = 0, framesPerSecond = 1, isLooping = true, isAnimating = true } = {}) {
    return {
        name,
        animationStartTime: null,
        currentFrameIndex: startingFrame,
        framesPerSecond,
        isLooping,
        isAnimating,
    };
}
export function drawSprite(sprite, context, position, frameIndex = 0) {
    if (!sprite.frames[frameIndex]) {
        throw new Error(`Sprite ${sprite.name} does not have frame with index ${frameIndex}`);
    }
    const frame = sprite.frames[frameIndex];
    const image = getImageForFilePath(frame.file);
    context.drawImage(image, frame.origin.x, frame.origin.y, frame.size.width, frame.size.height, (position.x + sprite.offset.x), (position.y + sprite.offset.y), frame.size.width, frame.size.height);
}
const imageCache = {};
export function getImageForFilePath(filePath, cached = true) {
    if (cached && imageCache[filePath]) {
        return imageCache[filePath];
    }
    const image = new Image();
    image.src = filePath;
    imageCache[filePath] = image;
    image.onerror = () => {
        delete imageCache[filePath];
        throw new Error(`No image found at ${filePath}.`);
    };
    return image;
}
export function updateAnimatedSprites(state, { time }) {
    const entitiesWithSprites = findEntities(getEntities(state), {
        sprite: true,
    });
    const updatedEntities = entitiesWithSprites.map(entity => {
        const spriteComponent = entity.sprite;
        const spriteOfEntity = getSprite(state, entity.sprite.name);
        if (spriteComponent.framesPerSecond === 0
            || spriteOfEntity.frames.length <= 1
            || !spriteComponent.isAnimating) {
            return entity;
        }
        if (!entity.sprite.animationStartTime) {
            entity.sprite.animationStartTime = time;
        }
        const newFrameIndex = calculateNewFrameIndex(spriteOfEntity.frames.length, spriteComponent.framesPerSecond, time - entity.sprite.animationStartTime, spriteComponent.isLooping);
        return setComponent('sprite')(Object.assign(Object.assign({}, spriteComponent), { currentFrameIndex: newFrameIndex }))(entity);
    });
    return setEntities(...updatedEntities)(state);
}
export function calculateNewFrameIndex(amountOfFrames, framesPerSecond, elapsedTime, isLooping) {
    if (isLooping) {
        return Math.round(elapsedTime / (1000 / framesPerSecond)) % amountOfFrames;
    }
    return Math.min((Math.round(elapsedTime / 1000) / framesPerSecond), amountOfFrames - 1);
}
