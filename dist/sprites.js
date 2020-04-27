export const addSprite = (sprite) => (state) => {
    return Object.assign(Object.assign({}, state), { sprites: Object.assign(Object.assign({}, state.sprites), { [sprite.name]: sprite }) });
};
export function getSprite(state, name) {
    if (!state.sprites.hasOwnProperty(name)) {
        throw new Error(`No sprite with name ${name} found.`);
    }
    return state.sprites[name];
}
export function drawSprite(sprite, context, position, { scale = 1, offset = { x: 0, y: 0 } } = {}) {
    context.drawImage(getImageForFilePath(sprite.path), sprite.origin.x, sprite.origin.y, sprite.size.width, sprite.size.height, (position.x + offset.x) * scale, (position.y + offset.y) * scale, sprite.size.width * scale, sprite.size.height * scale);
}
const imageCache = {};
export function getImageForFilePath(filePath, cached = true) {
    if (cached && imageCache[filePath]) {
        return imageCache[filePath];
    }
    const image = new Image();
    image.src = filePath;
    imageCache[filePath] = image;
    return image;
}
