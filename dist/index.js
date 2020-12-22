function setupCanvas(containerSelector, size, hideSystemCursor = true) {
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
    canvas.setAttribute('width', (size[0]).toString());
    canvas.setAttribute('height', (size[1]).toString());
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
    /**
     * Process option to show or hide system cursor
     */
    if (!hideSystemCursor) {
        canvas.style.cursor = 'none';
    }
    return {
        context,
        canvas,
    };
}
function clearCanvas(canvas, context, backgroundColor = '#000000') {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
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

class EventEmitter {
    constructor() {
        this.eventHandlers = {};
        this.on = this.on.bind(this);
        this.emit = this.emit.bind(this);
        this.removeEventHandler = this.removeEventHandler.bind(this);
        this.removeAllEventHandlers = this.removeAllEventHandlers.bind(this);
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

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class Loop {
    constructor(update) {
        this.isRunning = false;
        this.update = update;
    }
    start() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.scheduleNextTick();
    }
    stop() {
        if (this.rafHandle) {
            window.cancelAnimationFrame(this.rafHandle);
        }
        this.isRunning = false;
    }
    tick() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                this.rafHandle = window.requestAnimationFrame((time) => {
                    this.update(time);
                    resolve();
                });
            });
        });
    }
    scheduleNextTick() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRunning) {
                return;
            }
            yield this.tick();
            this.scheduleNextTick();
        });
    }
}

function setupUpdateAndDrawEvents(eventEmitter, canvas, context) {
    eventEmitter.on('tick', (state, { time }, { emit }) => {
        state = emit('beforeUpdate', state, { time });
        state = emit('update', state, { time });
        state = emit('afterUpdate', state, { time });
        state = emit('beforeDraw', state, { time, context, canvas });
        state = emit('draw', state, { time, context, canvas });
        state = emit('afterDraw', state, { time, context, canvas });
        return state;
    });
}

let keysPressed = [];
let keysDown = [];
let keysUp = [];
function setupKeyboardEvents(eventEmitter) {
    window.addEventListener('keydown', (event) => {
        const key = event.key;
        if (!isKeyPressed(key) && !isKeyDown(key)) {
            keysPressed = [...keysPressed, key];
        }
        if (!isKeyDown(key)) {
            keysDown = [...keysDown, key];
        }
    });
    window.addEventListener('keyup', (event) => {
        const key = event.key;
        if (isKeyDown(key)) {
            keysDown = arrayWithout(keysDown, key);
        }
        if (!isKeyUp(key)) {
            keysUp = [...keysUp, key];
        }
    });
    window.addEventListener('blur', resetAllKeys);
    eventEmitter.on('update', (state, updateEvent, { emit }) => {
        keysPressed.forEach((keyPressed) => {
            state = emit('keyPressed', state, { key: keyPressed });
        });
        keysDown.forEach((keyDown) => {
            state = emit('keyDown', state, { key: keyDown });
        });
        keysUp.forEach((keyUp) => {
            state = emit('keyUp', state, { key: keyUp });
        });
        return state;
    });
    eventEmitter.on('afterUpdate', (state) => {
        resetKeysPressed();
        resetKeysUp();
        return state;
    });
}
function isKeyPressed(key) {
    return keysPressed.includes(key);
}
function isKeyDown(key) {
    return keysDown.includes(key);
}
function isKeyUp(key) {
    return keysUp.includes(key);
}
function resetKeysPressed() {
    keysPressed = [];
}
function resetKeysDown() {
    keysDown = [];
}
function resetKeysUp() {
    keysUp = [];
}
function resetAllKeys() {
    resetKeysPressed();
    resetKeysDown();
    resetKeysUp();
}

const mouseButtonMap = {
    0: 'left',
    1: 'middle',
    2: 'right',
    3: 'back',
    4: 'forward',
};
let mouseButtonsDown = [];
let mouseButtonsPressed = [];
let mouseButtonsUp = [];
let mousePosition = [0, 0];
let previousMousePosition = mousePosition;
function setupMouseEvents(eventEmitter, canvas) {
    window.addEventListener('mousedown', (event) => {
        if (!mouseButtonMap.hasOwnProperty(event.button)) {
            return;
        }
        const mouseButton = mouseButtonMap[event.button];
        if (!isMouseButtonDown(mouseButton) && !isMouseButtonPressed(mouseButton)) {
            mouseButtonsDown = [...mouseButtonsDown, mouseButton];
        }
        if (!isMouseButtonPressed(mouseButton)) {
            mouseButtonsPressed = [...mouseButtonsPressed, mouseButton];
        }
    });
    window.addEventListener('mouseup', (event) => {
        if (!mouseButtonMap.hasOwnProperty(event.button)) {
            return;
        }
        const mouseButton = mouseButtonMap[event.button];
        if (isMouseButtonPressed(mouseButton)) {
            mouseButtonsPressed = arrayWithout(mouseButtonsPressed, mouseButton);
        }
        if (!isMouseButtonUp(mouseButton)) {
            mouseButtonsUp = [...mouseButtonsUp, mouseButton];
        }
    });
    window.addEventListener('blur', resetAllMouseButtons);
    window.addEventListener('mousemove', (event) => {
        const canvasBoundaries = canvas.getBoundingClientRect();
        const horizontalScale = canvasBoundaries.width / canvas.width;
        const verticalScale = canvasBoundaries.height / canvas.height;
        const positionInScale = [
            (event.clientX - canvasBoundaries.left) / horizontalScale,
            (event.clientY - canvasBoundaries.top) / verticalScale,
        ];
        const x = Math.round(Math.min(Math.max(positionInScale[0], 0), canvas.width));
        const y = Math.round(Math.min(Math.max(positionInScale[1], 0), canvas.height));
        mousePosition = [x, y];
    });
    eventEmitter.on('update', (state, updateEvent, { emit }) => {
        if (mousePosition[0] !== previousMousePosition[0] || mousePosition[1] !== previousMousePosition[1]) {
            state = emit('mouseMove', state, { position: mousePosition });
        }
        mouseButtonsDown.forEach((button) => {
            state = emit('mouseDown', state, { button, position: mousePosition });
        });
        mouseButtonsPressed.forEach((button) => {
            state = emit('mousePressed', state, { button, position: mousePosition });
        });
        mouseButtonsUp.forEach((button) => {
            state = emit('mouseUp', state, { button, position: mousePosition });
        });
        return state;
    });
    eventEmitter.on('afterUpdate', (state) => {
        previousMousePosition = mousePosition;
        resetMouseButtonsDown();
        resetMouseButtonsUp();
        return state;
    });
}
function isMouseButtonPressed(mouseButton) {
    return mouseButtonsPressed.includes(mouseButton);
}
function isMouseButtonDown(mouseButton) {
    return mouseButtonsDown.includes(mouseButton);
}
function isMouseButtonUp(mouseButton) {
    return mouseButtonsUp.includes(mouseButton);
}
function resetMouseButtonsPressed() {
    mouseButtonsPressed = [];
}
function resetMouseButtonsDown() {
    mouseButtonsDown = [];
}
function resetMouseButtonsUp() {
    mouseButtonsUp = [];
}
function resetAllMouseButtons() {
    resetMouseButtonsPressed();
    resetMouseButtonsDown();
    resetMouseButtonsUp();
}

const defaultState = {
    entities: {},
    sprites: {},
};
class Game {
    constructor(size, { backgroundColor, containerSelector = 'body', initialState = defaultState, showSystemCursor, } = {}) {
        const { canvas, context } = setupCanvas(containerSelector, size, showSystemCursor);
        this.canvas = canvas;
        this.context = context;
        this.state = Object.assign({}, initialState);
        this.eventEmitter = new EventEmitter();
        this.loop = new Loop(this.loopCallback.bind(this));
        setupUpdateAndDrawEvents(this.eventEmitter, this.canvas, this.context);
        setupKeyboardEvents(this.eventEmitter);
        setupMouseEvents(this.eventEmitter, this.canvas);
        this.eventEmitter.on('beforeDraw', (state, { canvas, context }) => {
            clearCanvas(canvas, context, backgroundColor);
            return state;
        });
    }
    start() {
        this.state = this.eventEmitter.emit('start', this.state, {});
        this.loop.start();
    }
    loopCallback(time) {
        this.state = this.eventEmitter.emit('tick', this.state, { time });
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
    context.drawImage(image, frame.origin[0], frame.origin[1], frame.size[0], frame.size[1], (position[0] + sprite.offset[0]), (position[1] + sprite.offset[1]), frame.size[0], frame.size[1]);
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

function isPointInPoint(a, b) {
    return a[0] === b[0]
        && a[1] === b[1];
}
/*
 * Figuring out rectangles in my head gives me a head ache, so it's comment time.
 * When given rectangle r = [[left, top], [right, bottom]], this is how you find each corner:
 *
 * top 		=> r[0][1]
 * right 	=> r[1][0]
 * bottom 	=> r[1][1]
 * left 	=> r[0][0]
 */
function isPointInRectangle(point, rectangle) {
    return point[0] >= rectangle[0][0]
        && point[1] >= rectangle[0][1]
        && point[0] <= rectangle[1][0]
        && point[1] <= rectangle[1][1];
}
function isRectangleInRectangle(a, b) {
    return a[0][0] <= b[1][0]
        && a[1][0] >= b[0][0]
        && a[0][1] <= b[1][1]
        && a[1][1] >= b[0][1];
}

export { EventEmitter, Game, Loop, calculateNewFrameIndex, clearCanvas, createSpriteComponent, defaultState, doesEntityMatch, drawSprite, findEntities, findEntity, getEntities, getEntity, getImageForFilePath, getSprite, isPointInPoint, isPointInRectangle, isRectangleInRectangle, setComponent, setEntities, setEntity, setSprite, setSprites, setupCanvas, setupKeyboardEvents, setupMouseEvents, setupUpdateAndDrawEvents, updateAnimatedSprites };
