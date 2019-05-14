import Entity from './Entity.js';
import createUuid from './utilities/createUuid.js';
import isEmptyObject from './utilities/isEmptyObject.js';
import isObject from './utilities/isObject.js';
import isPlainObject from './utilities/isPlainObject.js';
import objectWithout from './utilities/objectWithout.js';

export default class Hex {
    constructor(modules = {}) {
        this.rooms = {};
        this.currentRoomId;
        this.entities = {};
        this.componentsMap = {};
        this.eventHandlers = {};

        Object.keys(modules).forEach((moduleName) => {
            this.registerModule(moduleName, modules[moduleName]);
        });
    }

    registerModule(name, Class) {
        if (this.hasOwnProperty(name)) {
            throw new Error(`Cannot register a module under name ${name} because that's already a property of Hex.`);
        }

        this[name] = new Class(this);
    }

    createRoom(id = createUuid(), setAsCurrent = false) {
        const newRoom = {
            id,
            entities: [],
        };

        this.rooms = {
            ...this.rooms,
            [id]: newRoom,
        };

        if (setAsCurrent) {
            this.currentRoomId = newRoom.id;
        }
    }

    addEntityToRoom(roomId, entityId) {
        if (!this.rooms.hasOwnProperty(roomId)) {
            throw new Error(`Can't find room with ID "${roomId}".`);
        }

        this.rooms = {
            ...this.rooms,
            [roomId]: {
                ...this.rooms[roomId],
                entities: [
                    ...this.rooms[roomId].entities,
                    entityId,
                ],
            },
        };
    }

    get currentRoom() {
        return this.rooms[this.currentRoomId];
    }

    createEntity(components = {}, roomId = this.currentRoomId) {
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
        this.removeComponentsFromEntity(entityId);
        this.entities = objectWithout(this.entities, entityId);
    }

    getEntity(entityId) {
        return this.entities[entityId];
    }

    getEntities(entityFilter = {}) {
        if (!isObject(entityFilter)) {
            throw new Error(`entityFilter is expected to be an object, received ${typeof entityFilter} instead.`);
        }

        if (!this.currentRoom) {
            return [];
        }

        return Object.entries(entityFilter).reduce((entityIds, [componentName, filterValue]) => {
            if (!this.componentsMap.hasOwnProperty(componentName)) {
                return entityIds;
            }

            return entityIds.filter((entityId) => {
                if (
                    typeof filterValue === 'function' &&
                    this.componentsMap[componentName].hasOwnProperty(entityId)
                ) {
                    return filterValue(this.componentsMap[componentName][entityId]);
                }

                return filterValue === this.componentsMap[componentName].hasOwnProperty(entityId);
            });
        }, this.currentRoom.entities).map((entityId) => {
            return this.getEntity(entityId);
        });
    }

    getEntitiesEverywhere(entityFilter = {}) {
        if (!isObject(entityFilter)) {
            throw new Error(`entityFilter is expected to be an object, received ${typeof entityFilter} instead.`);
        }

        return Object.entries(entityFilter).reduce((entityIds, [componentName, filterValue]) => {
            if (!this.componentsMap.hasOwnProperty(componentName)) {
                return entityIds;
            }

            return entityIds.filter((entityId) => {
                if (
                    typeof filterValue === 'function' &&
                    this.componentsMap[componentName].hasOwnProperty(entityId)
                ) {
                    return filterValue(this.componentsMap[componentName][entityId]);
                }

                return filterValue === this.componentsMap[componentName].hasOwnProperty(entityId);
            });
        }, Object.keys(this.entities)).map((entityId) => {
            return this.getEntity(entityId);
        });
    }

    setComponentForEntity(name, value, entityId) {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ${entityId} found.`);
        }

        this.componentsMap = {
            ...this.componentsMap,
            [name]: {
                ...this.componentsMap[name] || {},
                [entityId]: value,
            },
        }
    }

    setComponentsForEntity(components, entityId) {
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
        if (!this.componentsMap.hasOwnProperty(name)) {
            return;
        }

        if (!this.componentsMap[name].hasOwnProperty(entityId)) {
            return;
        }

        this.componentsMap = {
            ...this.componentsMap,
            [name]: objectWithout(this.componentsMap[name], entityId.toString()),
        }

        if (isEmptyObject(this.componentsMap[name])) {
            this.componentsMap = objectWithout(this.componentsMap, name);
        }
    }

    removeComponentsFromEntity(entityId) {
        Object.keys(this.componentsMap).forEach((componentName) => {
            this.removeComponentFromEntity(componentName, entityId);
        });
    }

    getComponentForEntity(name, entityId) {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ${entityId} found.`);
        }

        if (
            !this.componentsMap.hasOwnProperty(name) ||
            !this.componentsMap[name].hasOwnProperty(entityId)
        ) {
            return undefined;
        }

        return this.componentsMap[name][entityId];
    }

    getComponentsForEntity(entityId) {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ${entityId} found.`);
        }

        return Object.keys(this.componentsMap).reduce((components, componentName) => {
            if (this.componentsMap[componentName].hasOwnProperty(entityId)) {
                return {
                    ...components,
                    [componentName]: this.componentsMap[componentName][entityId],
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
