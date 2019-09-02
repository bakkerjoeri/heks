import Entity from './Entity.js';
import createUuid from './utilities/createUuid.js';
import isEmptyObject from './utilities/isEmptyObject.js';
import findElementOrSelector from './utilities/findElementOrSelector.js';
import objectWithout from './utilities/objectWithout.js';
import arrayWithout from './utilities/arrayWithout.js';
export default class Heks {
    constructor({ modules = [], size = { width: 0, height: 0 }, container = 'body', scale = 1, } = {}) {
        this.isRunning = false;
        this.state = {
            componentsMap: {},
            currentRoomId: null,
            rooms: {},
            viewports: {},
        };
        this.entities = {};
        this.eventHandlers = {};
        this.modules = modules.reduce((allModules, ModuleClass) => {
            return Object.assign({}, allModules, {
                [ModuleClass.name]: new ModuleClass(this),
            });
        }, {});
        this.size = size;
        this.scale = scale;
        this.canvas = document.createElement('canvas');
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not create context 2D on canvas.');
        }
        this.context = context;
        this.setupCanvas(this.canvas, container);
        this.step = this.step.bind(this);
    }
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            window.requestAnimationFrame(this.step);
        }
    }
    stop() {
        this.isRunning = false;
    }
    setupCanvas(canvas, containerElementOrSelector = 'body') {
        canvas.setAttribute('width', this.size.width.toString());
        canvas.setAttribute('height', this.size.height.toString());
        const canvasStyle = canvas.style;
        canvasStyle.width = `${this.size.width * this.scale}px`;
        canvasStyle.height = `${this.size.height * this.scale}px`;
        canvasStyle.imageRendering = '-moz-crisp-edges';
        canvasStyle.imageRendering = '-webkit-crisp-edges';
        canvasStyle.imageRendering = 'pixelated';
        canvasStyle.backgroundColor = 'black';
        const container = findElementOrSelector(containerElementOrSelector);
        if (!container) {
            throw new Error(`Unable to find container for canvas ${container}.`);
        }
        container.appendChild(canvas);
    }
    step(timeElapsed) {
        this.update(timeElapsed);
        this.draw(timeElapsed);
        if (this.isRunning) {
            window.requestAnimationFrame(this.step);
        }
    }
    update(timeElapsed) {
        this.emitEvent('beforeUpdate', timeElapsed);
        this.emitEvent('update', timeElapsed);
        this.emitEvent('afterUpdate', timeElapsed);
    }
    draw(timeElapsed) {
        this.emitEvent('beforeDraw', timeElapsed);
        this.emitEvent('draw', timeElapsed);
        this.emitEvent('afterDraw', timeElapsed);
    }
    createRoom(id = createUuid(), size = this.size, setAsCurrent = false) {
        const newRoom = {
            id,
            size,
            entities: [],
            viewports: [],
            layers: {
                default: 0,
            }
        };
        this.state.rooms = Object.assign({}, this.state.rooms, { [id]: newRoom });
        if (setAsCurrent) {
            this.setCurrentRoom(newRoom.id);
        }
        return id;
    }
    setCurrentRoom(roomId) {
        if (!this.state.rooms.hasOwnProperty(roomId)) {
            throw new Error(`Room with id ${roomId} doesn't exist.`);
        }
        this.state.currentRoomId = roomId;
    }
    get currentRoom() {
        if (!this.state.currentRoomId) {
            throw new Error('There is no current room. Please set one before expecting it.');
        }
        return this.state.rooms[this.state.currentRoomId];
    }
    createLayer(name, depth = 0, roomId = this.state.currentRoomId) {
        this.state.rooms[roomId].layers[name] = depth;
    }
    addViewportToRoom(roomId, viewportId) {
        if (!this.state.rooms.hasOwnProperty(roomId)) {
            throw new Error(`Can't find room with ID "${roomId}".`);
        }
        this.state.rooms = Object.assign({}, this.state.rooms, { [roomId]: Object.assign({}, this.state.rooms[roomId], { viewports: [
                    ...this.state.rooms[roomId].viewports,
                    viewportId,
                ] }) });
    }
    addEntityToRoom(roomId, entityId) {
        if (!this.state.rooms.hasOwnProperty(roomId)) {
            throw new Error(`Can't find room with ID "${roomId}".`);
        }
        this.state.rooms = Object.assign({}, this.state.rooms, { [roomId]: Object.assign({}, this.state.rooms[roomId], { entities: [
                    ...this.state.rooms[roomId].entities,
                    entityId,
                ] }) });
    }
    createViewport(viewportOptions = {}, roomId = this.state.currentRoomId) {
        const DEFAULT_PROPERTIES = {
            id: createUuid(),
            position: {
                x: 0,
                y: 0,
            },
            origin: {
                x: 0,
                y: 0,
            },
            size: this.size,
            entityToFollow: null,
        };
        const viewport = Object.assign({}, DEFAULT_PROPERTIES, viewportOptions);
        this.state.viewports = Object.assign({}, this.state.viewports, { [viewport.id]: viewport });
        this.addViewportToRoom(roomId, viewport.id);
        return viewport;
    }
    getViewport(viewportId) {
        if (!this.state.viewports.hasOwnProperty(viewportId)) {
            throw new Error(`No viewport with ID ${viewportId} found.`);
        }
        return this.state.viewports[viewportId];
    }
    getViewportsInCurrentRoom() {
        if (!this.currentRoom) {
            throw new Error('There is no current room set.');
        }
        return this.currentRoom.viewports.map((viewportId) => {
            return this.getViewport(viewportId);
        });
    }
    setEntityToFollowForViewport(entityId, viewportId) {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ID ${entityId} found.`);
        }
        const viewport = this.getViewport(viewportId);
        viewport.entityToFollow = entityId;
    }
    createEntity(components = {}, roomId = this.state.currentRoomId) {
        const entity = new Entity(this);
        this.entities = Object.assign({}, this.entities, { [entity.id]: entity });
        this.setComponentsForEntity(components, entity.id);
        this.addEntityToRoom(roomId, entity.id);
        return entity;
    }
    removeEntity(entityId) {
        this.state.rooms = Object.entries(this.state.rooms).reduce((rooms, [roomId, room]) => {
            return Object.assign({}, rooms, { [roomId]: Object.assign({}, room, { entities: arrayWithout(room.entities, entityId) }) });
        }, {});
        this.removeComponentsFromEntity(entityId);
        this.entities = objectWithout(this.entities, entityId);
    }
    getEntity(entityId) {
        return this.entities[entityId];
    }
    getEntities(entityFilter = {}) {
        if (!this.currentRoom) {
            return [];
        }
        return this.filterEntities(this.currentRoom.entities, entityFilter);
    }
    filterEntities(entityIds, entityFilter) {
        return Object.entries(entityFilter)
            .reduce((entityIds, [componentName, filterValue]) => {
            if (!this.state.componentsMap.hasOwnProperty(componentName)) {
                return filterValue ? [] : entityIds;
            }
            return entityIds.filter((entityId) => {
                if (typeof filterValue === 'function' &&
                    this.state.componentsMap[componentName].hasOwnProperty(entityId)) {
                    return filterValue(this.state.componentsMap[componentName][entityId], this.getEntity(entityId), this);
                }
                if (!filterValue) {
                    return !this.state.componentsMap[componentName].hasOwnProperty(entityId) ||
                        !this.state.componentsMap[componentName][entityId];
                }
                return this.state.componentsMap[componentName].hasOwnProperty(entityId) &&
                    !!this.state.componentsMap[componentName][entityId];
            });
        }, entityIds).map((entityId) => {
            return this.getEntity(entityId);
        });
    }
    setComponentForEntity(componentName, value, entityId) {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ${entityId} found.`);
        }
        this.state.componentsMap = Object.assign({}, this.state.componentsMap, { [componentName]: Object.assign({}, this.state.componentsMap[componentName] || {}, { [entityId]: value }) });
    }
    setComponentsForEntity(components = {}, entityId) {
        this.removeComponentsFromEntity(entityId);
        Object.keys(components).forEach((componentName) => {
            this.setComponentForEntity(componentName, components[componentName], entityId);
        });
    }
    removeComponentFromEntity(componentName, entityId) {
        if (!this.state.componentsMap.hasOwnProperty(componentName)) {
            return;
        }
        if (!this.state.componentsMap[componentName].hasOwnProperty(entityId)) {
            return;
        }
        this.state.componentsMap = Object.assign({}, this.state.componentsMap, { [componentName]: objectWithout(this.state.componentsMap[componentName], entityId) });
        if (isEmptyObject(this.state.componentsMap[componentName])) {
            this.state.componentsMap = objectWithout(this.state.componentsMap, componentName);
        }
    }
    removeComponentsFromEntity(entityId) {
        Object.keys(this.state.componentsMap).forEach((componentName) => {
            this.removeComponentFromEntity(componentName, entityId);
        });
    }
    getValueOfComponentForEntity(componentName, entityId) {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ${entityId} found.`);
        }
        if (!this.state.componentsMap.hasOwnProperty(componentName) ||
            !this.state.componentsMap[componentName].hasOwnProperty(entityId)) {
            return undefined;
        }
        return this.state.componentsMap[componentName][entityId];
    }
    getComponentsForEntity(entityId) {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ${entityId} found.`);
        }
        return Object.keys(this.state.componentsMap)
            .reduce((components, componentName) => {
            if (this.state.componentsMap[componentName].hasOwnProperty(entityId)) {
                return Object.assign({}, components, {
                    [componentName]: this.state.componentsMap[componentName][entityId],
                });
            }
            return components;
        }, {});
    }
    addEventHandler(eventName, handler) {
        this.eventHandlers = Object.assign({}, this.eventHandlers, { [eventName]: [
                ...this.eventHandlers[eventName] || [],
                handler,
            ] });
    }
    addEventHandlerForEntities(eventName, handler, entityFilter = {}) {
        this.addEventHandler(eventName, (engine, ...args) => {
            this.getEntities(entityFilter).forEach((entity) => {
                handler(engine, entity, ...args);
            });
        });
    }
    addEventHandlerForEntityGroup(eventName, handler, entityFilter = {}) {
        this.addEventHandler(eventName, (engine, ...args) => {
            handler(engine, this.getEntities(entityFilter), ...args);
        });
    }
    emitEvent(eventName, ...args) {
        if (!this.eventHandlers.hasOwnProperty(eventName)) {
            return;
        }
        this.eventHandlers[eventName].forEach((eventHandler) => {
            eventHandler(this, ...args);
        });
    }
}
