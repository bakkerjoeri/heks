function start(callback) {
    scheduleNextTick(callback);
}
function scheduleNextTick(callback) {
    window.requestAnimationFrame((time) => {
        tick(callback, time);
    });
}
function tick(callback, time) {
    callback(time);
    scheduleNextTick(callback);
}

function setupGame(containerSelector, size) {
    /**
     * First, we mount the game in the container element.
     */
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
        throw new Error('Couldn\'t create context from canvas');
    }
    const gameContainer = document.documentElement.querySelector(containerSelector);
    if (!gameContainer) {
        throw new Error(`Couldn't find element with selector ${containerSelector} to mount canvas on.`);
    }
    gameContainer.appendChild(canvas);
    /**
     * We give the canvas the user defined pixel size through element attributes,
     * but make sure it fills it's container through CSS.
     */
    canvas.setAttribute('width', (size.width).toString());
    canvas.setAttribute('height', (size.height).toString());
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.objectFit = 'contain';
    /**
     * By default an inline element, the canvas can have some stray spacing.
     * We change its display value to block to prevent those.
     */
    canvas.style.display = 'block';
    /**
     * We make sure that rendering is crisp in different browsers.
     */
    canvas.style.imageRendering = '-moz-crisp-edges';
    canvas.style.imageRendering = '-webkit-crisp-edges';
    canvas.style.imageRendering = 'pixelated';
    return {
        context,
        canvas,
    };
}

function arrayWithout(array, ...valuesToExclude) {
    return array.filter((value) => {
        return !valuesToExclude.includes(value);
    });
}

function objectWithout(object, ...keysToRemove) {
    const entries = Object.entries(object);
    return entries.reduce((newObject, [currentKey, currentValue]) => {
        if (keysToRemove.includes(currentKey)) {
            return newObject;
        }
        return Object.assign(Object.assign({}, newObject), { [currentKey]: currentValue });
    }, {});
}

function setupLifecycleEvents(game) {
    game.on('tick', (state, { time }, { emit }) => {
        state = emit('beforeUpdate', state, { time });
        state = emit('update', state, { time });
        state = emit('afterUpdate', state, { time });
        return state;
    });
}

function setupDrawEvents(game) {
    game.on('tick', (state, { time }, { emit }) => {
        state = emit('beforeDraw', state, { time, context: game.context });
        state = emit('draw', state, { time, context: game.context });
        state = emit('afterDraw', state, { time, context: game.context });
        return state;
    });
}

let pressedKeys = [];
let activeKeys = [];
let releasedKeys = [];
function setupKeyboardEvents(game) {
    window.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (!isKeyPressed(key) && !isKeyDown(key)) {
            pressedKeys = [...pressedKeys, key];
        }
        if (!isKeyDown(key)) {
            activeKeys = [...activeKeys, key];
        }
    });
    window.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        if (isKeyDown(key)) {
            activeKeys = arrayWithout(activeKeys, key);
        }
        if (!isKeyReleased(key)) {
            releasedKeys = [...releasedKeys, key];
        }
    });
    window.addEventListener('blur', resetAllKeys);
    game.on('update', (state, updateEvent, { emit }) => {
        pressedKeys.forEach((activeKey) => {
            state = emit('keyPressed', state, { key: activeKey });
        });
        activeKeys.forEach((activeKey) => {
            state = emit('keyDown', state, { key: activeKey });
        });
        releasedKeys.forEach((activeKey) => {
            state = emit('keyUp', state, { key: activeKey });
        });
        return state;
    });
    game.on('afterUpdate', (state) => {
        resetPressedKeys();
        resetReleasedKeys();
        return state;
    });
}
function isKeyPressed(key) {
    return pressedKeys.includes(key);
}
function isKeyDown(key) {
    return activeKeys.includes(key);
}
function isKeyReleased(key) {
    return releasedKeys.includes(key);
}
function resetPressedKeys() {
    pressedKeys = [];
}
function resetActiveKeys() {
    activeKeys = [];
}
function resetReleasedKeys() {
    releasedKeys = [];
}
function resetAllKeys() {
    resetPressedKeys();
    resetActiveKeys();
    resetReleasedKeys();
}

const defaultState = {
    entities: {},
    sprites: {},
};
class Game {
    constructor(size, { initialState = defaultState, containerSelector = 'body' } = {}) {
        this.eventHandlers = {};
        const { canvas, context } = setupGame(containerSelector, size);
        this.canvas = canvas;
        this.context = context;
        this.state = Object.assign({}, initialState);
        this.on = this.on.bind(this);
        this.emit = this.emit.bind(this);
        this.removeEventHandler = this.removeEventHandler.bind(this);
        this.removeAllEventHandlers = this.removeAllEventHandlers.bind(this);
        setupLifecycleEvents(this);
        setupDrawEvents(this);
        setupKeyboardEvents(this);
    }
    start() {
        this.state = this.emit('start', this.state, {});
        start((time) => {
            this.state = this.emit('tick', this.state, { time });
        });
    }
    on(eventType, handler) {
        this.eventHandlers = Object.assign(Object.assign({}, this.eventHandlers), { [eventType]: [
                ...this.eventHandlers[eventType] || [],
                handler,
            ] });
    }
    emit(eventType, currentState, event) {
        if (!this.eventHandlers.hasOwnProperty(eventType)) {
            return currentState;
        }
        const handlers = this.eventHandlers[eventType];
        return handlers.reduce((newState, currentHandler) => {
            return currentHandler(newState, event, {
                on: this.on,
                emit: this.emit,
                removeEventHandler: this.removeEventHandler,
                removeAllEventHandlers: this.removeAllEventHandlers,
            });
        }, currentState);
    }
    removeEventHandler(eventType, handler) {
        this.eventHandlers = Object.assign(Object.assign({}, this.eventHandlers), { [eventType]: arrayWithout(this.eventHandlers[eventType], handler) });
    }
    removeAllEventHandlers(eventType) {
        this.eventHandlers = objectWithout(this.eventHandlers, eventType);
    }
}

function pipe(...functions) {
    return functions.reduce((pipedFunction, currentFunction) => {
        return (value) => {
            return currentFunction(pipedFunction(value));
        };
    }, (value) => value);
}

function uuid() {
    let seed = Date.now();
    if (window.performance && typeof window.performance.now === 'function') {
        seed += performance.now();
    }
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (seed + Math.random() * 16) % 16 | 0;
        seed = Math.floor(seed / 16);
        return (c === 'x' ? r : r & (0x3 | 0x8)).toString(16);
    });
    return uuid;
}

const setEntity = (entity) => (state) => {
    const id = entity.id || uuid();
    return Object.assign(Object.assign({}, state), { entities: Object.assign(Object.assign({}, state.entities), { [id]: Object.assign({ id }, entity) }) });
};
const setEntities = (...entities) => (state) => {
    return pipe(...entities.map(setEntity))(state);
};
const setComponent = (componentName) => (value) => (entity) => {
    return Object.assign(Object.assign({}, entity), { [componentName]: value });
};
function getEntity(state, entityId) {
    if (!state.entities.hasOwnProperty(entityId)) {
        throw new Error(`Entity with id ${entityId} doesn't exist.`);
    }
    return state.entities[entityId];
}
function getEntities(state) {
    return Object.values(state.entities).reduce((entities, entity) => {
        return [
            ...entities,
            entity,
        ];
    }, []);
}
const doesEntityMatch = (filters) => (entity) => {
    return Object.entries(filters).every(([componentName, filterValue]) => {
        if (typeof filterValue === 'function' && entity.hasOwnProperty(componentName)) {
            return filterValue(entity[componentName]);
        }
        if (typeof filterValue === 'boolean' && !filterValue) {
            return !entity.hasOwnProperty(componentName) || !entity[componentName];
        }
        if (typeof filterValue === 'boolean' && filterValue) {
            return entity.hasOwnProperty(componentName) && !!entity[componentName];
        }
        return entity.hasOwnProperty(componentName) && filterValue === entity[componentName];
    });
};
function findEntities(entities, filters) {
    return entities.filter(doesEntityMatch(filters));
}
function findEntity(entities, filters) {
    return entities.find(doesEntityMatch(filters));
}

const setSprite = (sprite) => (state) => {
    return Object.assign(Object.assign({}, state), { sprites: Object.assign(Object.assign({}, state.sprites), { [sprite.name]: sprite }) });
};
const setSprites = (sprites) => (state) => {
    return pipe(...sprites.map(setSprite))(state);
};
function getSprite(state, name) {
    if (!state.sprites.hasOwnProperty(name)) {
        throw new Error(`No sprite with name ${name} found.`);
    }
    return state.sprites[name];
}
function createSpriteComponent(name, { startingFrame = 0, framesPerSecond = 1, isLooping = true, isAnimating = true } = {}) {
    return {
        name,
        animationStartTime: null,
        currentFrameIndex: startingFrame,
        framesPerSecond,
        isLooping,
        isAnimating,
    };
}
function drawSprite(sprite, context, position, frameIndex = 0) {
    if (!sprite.frames[frameIndex]) {
        throw new Error(`Sprite ${sprite.name} does not have frame with index ${frameIndex}`);
    }
    const frame = sprite.frames[frameIndex];
    const image = getImageForFilePath(frame.file);
    context.drawImage(image, frame.origin.x, frame.origin.y, frame.size.width, frame.size.height, (position.x + sprite.offset.x), (position.y + sprite.offset.y), frame.size.width, frame.size.height);
}
const imageCache = {};
function getImageForFilePath(filePath, cached = true) {
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
function updateAnimatedSprites(state, { time }) {
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
function calculateNewFrameIndex(amountOfFrames, framesPerSecond, elapsedTime, isLooping) {
    if (isLooping) {
        return Math.round(elapsedTime / (1000 / framesPerSecond)) % amountOfFrames;
    }
    return Math.min((Math.round(elapsedTime / 1000) / framesPerSecond), amountOfFrames - 1);
}

export { Game, calculateNewFrameIndex, createSpriteComponent, defaultState, doesEntityMatch, drawSprite, findEntities, findEntity, getEntities, getEntity, getImageForFilePath, getSprite, setComponent, setEntities, setEntity, setSprite, setSprites, updateAnimatedSprites };
