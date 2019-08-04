import { createEntityProxy } from './Entity.js';
import createUuid from './utilities/createUuid.js';
import isEmptyObject from './utilities/isEmptyObject.js';
import objectWithout from './utilities/objectWithout.js';
import arrayWithout from './utilities/arrayWithout.js';
export default class Hex {
    constructor(modules = {}, containerElementOrSelector, size, scale) {
        this.isRunning = false;
        this.scale = 1;
        this.size = {
            width: 0,
            height: 0
        };
        this.state = {
            componentsMap: {},
            currentRoomId: null,
            rooms: {},
            viewports: {},
        };
        this.entities = {};
        this.eventHandlers = {};
        this.setupCanvas(containerElementOrSelector, size, scale);
        Object.keys(modules).forEach((moduleName) => {
            this.registerModule(moduleName, modules[moduleName]);
        });
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
    registerModule(name, ModuleClass) {
        if (this.hasOwnProperty(name)) {
            throw new Error(`Cannot register a module under name ${name} because that's already a property of Hex.`);
        }
        this[name] = new ModuleClass(this);
    }
    setupCanvas(containerElementOrSelector = 'body', size, scale = 1) {
        this.size = size;
        this.scale = scale;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.canvas.setAttribute('width', size.width.toString());
        this.canvas.setAttribute('height', size.height.toString());
        const canvasStyle = this.canvas.style;
        canvasStyle.width = `${size.width * scale}px`;
        canvasStyle.height = `${size.height * scale}px`;
        canvasStyle.imageRendering = '-moz-crisp-edges';
        canvasStyle.imageRendering = '-webkit-crisp-edges';
        canvasStyle.imageRendering = 'pixelated';
        canvasStyle.backgroundColor = 'black';
        let container;
        if (typeof containerElementOrSelector === 'string') {
            let containerSelector = containerElementOrSelector;
            container = document.querySelector(containerSelector);
            if (!container) {
                throw new Error(`Could not add canvas to container. No element found for selector ${containerSelector}.`);
            }
        }
        else {
            container = containerElementOrSelector;
        }
        container.appendChild(this.canvas);
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
    createRoom(id = createUuid(), size, setAsCurrent = false) {
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
    }
    setCurrentRoom(roomId) {
        if (!this.state.rooms.hasOwnProperty(roomId)) {
            throw new Error(`Room with id ${roomId} doesn't exist.`);
        }
        this.state.currentRoomId = roomId;
    }
    get currentRoom() {
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
        const entity = createEntityProxy(this);
        this.entities = Object.assign({}, this.entities, { [entity.id]: entity });
        this.setComponentsForEntity(components, entity.id);
        this.addEntityToRoom(roomId, entity.id);
        console.log(entity.id, entity.components);
        console.log(Object.assign({}, this.state.componentsMap.sprite));
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
                return Object.assign({}, components, { [componentName]: this.state.componentsMap[componentName][entityId] });
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
