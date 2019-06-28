import Entity from './Entity.js';
import createUuid from './utilities/createUuid.js';
import isEmptyObject from './utilities/isEmptyObject.js';
import isObject from './utilities/isObject.js';
import isPlainObject from './utilities/isPlainObject.js';
import objectWithout from './utilities/objectWithout.js';
import arrayWithout from './utilities/arrayWithout.js';

export default class Hex {
    constructor(modules = {}, container, size, scale = 1) {
        this.setupCanvas(container, size, scale);

        this.state = {
            componentsMap: {},
            currentRoomId: null,
            rooms: {},
            viewports: {},
        };

        this.isRunning = false;
        this.entities = {};
        this.eventHandlers = {};

        Object.keys(modules).forEach((moduleName) => {
            this.registerModule(moduleName, modules[moduleName]);
        });

        this.step = this.step.bind(this);
    }

    setupCanvas(container, size, scale) {
        this.size = size;
        this.scale = scale;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        container.appendChild(this.canvas);
        this.canvas.setAttribute('width', size.width);
        this.canvas.setAttribute('height', size.height);
        this.canvas.style.width = `${size.width * scale}px`;
        this.canvas.style.height = `${size.height * scale}px`;
        this.canvas.style.imageRendering = '-moz-crisp-edges';
        this.canvas.style.imageRendering = '-webkit-crisp-edges';
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.backgroundColor = 'black';
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

    registerModule(name, Class) {
        if (this.hasOwnProperty(name)) {
            throw new Error(`Cannot register a module under name ${name} because that's already a property of Hex.`);
        }

        this[name] = new Class(this);
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

        this.state.rooms = {
            ...this.state.rooms,
            [id]: newRoom,
        };

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

    addViewportToRoom(roomId, viewportId) {
        if (!this.state.rooms.hasOwnProperty(roomId)) {
            throw new Error(`Can't find room with ID "${roomId}".`);
        }

        this.state.rooms = {
            ...this.state.rooms,
            [roomId]: {
                ...this.state.rooms[roomId],
                viewports: [
                    ...this.state.rooms[roomId].viewports,
                    viewportId,
                ],
            },
        };
    }

    createLayer(name, depth = 0, roomId = this.state.currentRoomId) {
        this.state.rooms[roomId].layers[name] = depth;
    }

    addEntityToRoom(roomId, entityId) {
        if (!this.state.rooms.hasOwnProperty(roomId)) {
            throw new Error(`Can't find room with ID "${roomId}".`);
        }

        this.state.rooms = {
            ...this.state.rooms,
            [roomId]: {
                ...this.state.rooms[roomId],
                entities: [
                    ...this.state.rooms[roomId].entities,
                    entityId,
                ],
            },
        };
    }

    createViewport(options = {}, roomId = this.state.currentRoomId) {
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
            entityToFollow: '',
        };

        const viewport = {
            ...DEFAULT_PROPERTIES,
            ...options,
        };

        this.state.viewports = {
            ...this.state.viewports,
            [viewport.id]: viewport,
        }
        this.addViewportToRoom(roomId, viewport.id);

        return viewport;
    }

    getViewportsInCurrentRoom() {
        if (!this.currentRoom) {
            throw new Error('There is no current room set.');
        }

        return this.currentRoom.viewports.map((viewportId) => {
            return this.state.viewports[viewportId];
        });
    }

    createEntity(components = {}, roomId = this.state.currentRoomId) {
        const entity = new Entity(this);

        this.entities = {
            ...this.entities,
            [entity.id]: entity,
        }

        this.setComponentsForEntity(components, entity.id);
        this.addEntityToRoom(roomId, entity.id);

        return entity;
    }

    removeEntity(entityId) {
        this.state.rooms = Object.entries(this.state.rooms).reduce((rooms, [roomId, room]) => {
            return {
                ...rooms,
                [roomId]: {
                    ...room,
                    entities: arrayWithout(room.entities, entityId),
                }
            }
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
        if (!isObject(entityFilter)) {
            throw new Error(`entityFilter is expected to be an object, received ${typeof entityFilter} instead.`);
        }

        return Object.entries(entityFilter).reduce((entityIds, [componentName, filterValue]) => {
            if (!this.state.componentsMap.hasOwnProperty(componentName)) {
                return filterValue ? [] : entityIds;
            }

            return entityIds.filter((entityId) => {
                if (
                    typeof filterValue === 'function' &&
                    this.state.componentsMap[componentName].hasOwnProperty(entityId)
                ) {
                    return filterValue(
                        this.state.componentsMap[componentName][entityId],
                        this.getEntity(entityId),
                        this
                    );
                }

                if (!filterValue) {
                    return !this.state.componentsMap[componentName].hasOwnProperty(entityId) ||
                        !this.state.componentsMap[componentName][entityId];
                }

                return this.state.componentsMap[componentName].hasOwnProperty(entityId) &&
                    this.state.componentsMap[componentName][entityId];
            });
        }, entityIds).map((entityId) => {
            return this.getEntity(entityId);
        });
    }

    setComponentForEntity(name, value, entityId) {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ${entityId} found.`);
        }

        this.state.componentsMap = {
            ...this.state.componentsMap,
            [name]: {
                ...this.state.componentsMap[name] || {},
                [entityId]: value,
            },
        }
    }

    setComponentsForEntity(components = {}, entityId) {
        if (!isPlainObject(components)) {
            throw new Error('Cannot create components from given value. Please provide a plain object.');
        }

        this.removeComponentsFromEntity(entityId);

        Object.keys(components).forEach((componentName) => {
            this.setComponentForEntity(
                componentName,
                components[componentName],
                entityId,
            );
        });
    }

    removeComponentFromEntity(name, entityId) {
        if (!this.state.componentsMap.hasOwnProperty(name)) {
            return;
        }

        if (!this.state.componentsMap[name].hasOwnProperty(entityId)) {
            return;
        }

        this.state.componentsMap = {
            ...this.state.componentsMap,
            [name]: objectWithout(this.state.componentsMap[name], entityId.toString()),
        }

        if (isEmptyObject(this.state.componentsMap[name])) {
            this.state.componentsMap = objectWithout(this.state.componentsMap, name);
        }
    }

    removeComponentsFromEntity(entityId) {
        Object.keys(this.state.componentsMap).forEach((componentName) => {
            this.removeComponentFromEntity(componentName, entityId);
        });
    }

    getComponentForEntity(name, entityId) {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ${entityId} found.`);
        }

        if (
            !this.state.componentsMap.hasOwnProperty(name) ||
            !this.state.componentsMap[name].hasOwnProperty(entityId)
        ) {
            return undefined;
        }

        return this.state.componentsMap[name][entityId];
    }

    getComponentsForEntity(entityId) {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ${entityId} found.`);
        }

        return Object.keys(this.state.componentsMap).reduce((components, componentName) => {
            if (this.state.componentsMap[componentName].hasOwnProperty(entityId)) {
                return {
                    ...components,
                    [componentName]: this.state.componentsMap[componentName][entityId],
                }
            }

            return components;
        }, {});
    }

    addEventHandler(eventName, handler) {
        this.eventHandlers = {
            ...this.eventHandlers,
            [eventName]: [
                ...this.eventHandlers[eventName] || [],
                handler,
            ],
        };
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
