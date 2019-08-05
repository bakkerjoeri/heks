import { Entity, WithComponents, createEntityProxy } from './Entity.js';
import { Components, Component, ComponentPrimitive } from './Component.js';
import Module from './Module.js';
import createUuid from './utilities/createUuid.js';
import isEmptyObject from './utilities/isEmptyObject.js';
import objectWithout from './utilities/objectWithout.js';
import arrayWithout from './utilities/arrayWithout.js';

export interface GameState {
    componentsMap: ComponentsEntityMap;
    currentRoomId: Room['id'] | null;
    rooms: {
        [roomId in Room['id']]: Room;
    };
    viewports: {
        [viewportId in Viewport['id']]: Viewport;
    };
}

export interface Room {
    id: string;
    size: Size;
    entities: Entity['id'][];
    viewports: Viewport['id'][];
    layers: {
        [layerName: string]: number;
    };
}

export interface Viewport {
    id: string;
    position: Position;
    origin: Position;
    size: Size;
    entityToFollow: Entity['id'] | null;
}

interface ComponentsEntityMap {
    [componentName: string]: {
        [entityId in Entity['id']]: Component;
    };
}

interface CSSStyleDeclarationWithImageRendering extends CSSStyleDeclaration {
    imageRendering: string | null;
}

interface ComponentFilter {
    [componentName: string]: boolean | ComponentPrimitive | ((
        value: Component,
        entity: Entity,
        engine: Hex
    ) => boolean);
}

interface Constructable<T> { new (...args: any[]): T }
type EventHandler = (engine: Hex, ...args: any[]) => void;
type EventHandlerPerEntity<T> = (engine: Hex, entity: Entity & WithComponents<T>, ...args: any[]) => void;
type EventHandlerForEntityGroup<T> = (engine: Hex, entities: (Entity & WithComponents<T>)[], ...args: any[]) => void;

export interface Size {
    width: number;
    height: number;
}

export interface Position {
    x: number;
    y: number;
}

export type PositionComponent = Position;

export interface Offset {
    top: number;
    left: number;
}

export type Boundaries = Size & Position;

export default class Hex {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public isRunning: boolean = false;
    public scale: number = 1;
    public size: Size = {
        width: 0,
        height: 0
    };
    public state: GameState = {
        componentsMap: {},
        currentRoomId: null,
        rooms: {},
        viewports: {},
    };

    private entities: {
        [entityId in Entity['id']]: Entity;
    } = {};
    private eventHandlers: {
        [eventName: string]: EventHandler[];
    } = {}

    public constructor(
        modules: { [moduleName: string]: Constructable<Module> } = {},
        containerElementOrSelector: Node | string,
        size: Size,
        scale: number
    ) {
        this.setupCanvas(containerElementOrSelector, size, scale);

        Object.keys(modules).forEach((moduleName): void => {
            this.registerModule(moduleName, modules[moduleName]);
        });

        this.step = this.step.bind(this);
    }

    public start(): void {
        if (!this.isRunning) {
            this.isRunning = true;
            window.requestAnimationFrame(this.step);
        }
    }

    public stop(): void {
        this.isRunning = false;
    }

    public registerModule(name: string, ModuleClass: Constructable<Module>): void {
        if (this.hasOwnProperty(name)) {
            throw new Error(`Cannot register a module under name ${name} because that's already a property of Hex.`);
        }

        this[name] = new ModuleClass(this);
    }

    private setupCanvas(
        containerElementOrSelector: Node | string = 'body',
        size: Size,
        scale: number = 1
    ): void {
        this.size = size;
        this.scale = scale;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.setAttribute('width', size.width.toString());
        this.canvas.setAttribute('height', size.height.toString());

        const canvasStyle = this.canvas.style as CSSStyleDeclarationWithImageRendering;
        canvasStyle.width = `${size.width * scale}px`;
        canvasStyle.height = `${size.height * scale}px`;
        canvasStyle.imageRendering = '-moz-crisp-edges';
        canvasStyle.imageRendering = '-webkit-crisp-edges';
        canvasStyle.imageRendering = 'pixelated';
        canvasStyle.backgroundColor = 'black';

        let container: Node;

        if (typeof containerElementOrSelector === 'string') {
            let containerSelector = containerElementOrSelector;
            container = document.querySelector(containerSelector);

            if (!container) {
                throw new Error(`Could not add canvas to container. No element found for selector ${containerSelector}.`);
            }
        } else {
            container = containerElementOrSelector;
        }

        container.appendChild(this.canvas);
    }

    private step(timeElapsed: number): void {
        this.update(timeElapsed);
        this.draw(timeElapsed);

        if (this.isRunning) {
            window.requestAnimationFrame(this.step);
        }
    }

    private update(timeElapsed: number): void {
        this.emitEvent('beforeUpdate', timeElapsed);
        this.emitEvent('update', timeElapsed);
        this.emitEvent('afterUpdate', timeElapsed);
    }

    private draw(timeElapsed: number): void {
        this.emitEvent('beforeDraw', timeElapsed);
        this.emitEvent('draw', timeElapsed);
        this.emitEvent('afterDraw', timeElapsed);
    }

    public createRoom(
        id: Room['id'] = createUuid(),
        size: Size,
        setAsCurrent: boolean = false
    ): void {
        const newRoom: Room = {
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

    public setCurrentRoom(roomId: Room['id']): void {
        if (!this.state.rooms.hasOwnProperty(roomId)) {
            throw new Error(`Room with id ${roomId} doesn't exist.`);
        }

        this.state.currentRoomId = roomId;
    }

    public get currentRoom(): Room {
        return this.state.rooms[this.state.currentRoomId];
    }

    public createLayer(
        name: string,
        depth: number = 0,
        roomId: Room['id'] = this.state.currentRoomId
    ): void {
        this.state.rooms[roomId].layers[name] = depth;
    }

    public addViewportToRoom(roomId: Room['id'], viewportId: Viewport['id']): void {
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

    public addEntityToRoom(roomId: Room['id'], entityId: Entity['id']): void {
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

    public createViewport(
        viewportOptions: Partial<Viewport> = {},
        roomId: Room['id'] = this.state.currentRoomId
    ): Viewport {
        const DEFAULT_PROPERTIES: Viewport = {
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

        const viewport: Viewport = {
            ...DEFAULT_PROPERTIES,
            ...viewportOptions,
        };

        this.state.viewports = {
            ...this.state.viewports,
            [viewport.id]: viewport,
        }

        this.addViewportToRoom(roomId, viewport.id);

        return viewport;
    }

    public getViewport(viewportId: Viewport['id']): Viewport {
        if (!this.state.viewports.hasOwnProperty(viewportId)) {
            throw new Error(`No viewport with ID ${viewportId} found.`);
        }

        return this.state.viewports[viewportId];
    }

    public getViewportsInCurrentRoom(): Viewport[] {
        if (!this.currentRoom) {
            throw new Error('There is no current room set.');
        }

        return this.currentRoom.viewports.map((viewportId): Viewport => {
            return this.getViewport(viewportId)
        });
    }

    public setEntityToFollowForViewport(entityId: Entity['id'], viewportId: Viewport['id']): void {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ID ${entityId} found.`);
        }

        const viewport = this.getViewport(viewportId);
        viewport.entityToFollow = entityId;
    }

    public createEntity(
        components: Components = {},
        roomId: Room['id'] = this.state.currentRoomId
    ): Entity {
        const entity = createEntityProxy(this);

        this.entities = {
            ...this.entities,
            [entity.id]: entity,
        }

        this.setComponentsForEntity(components, entity.id);
        this.addEntityToRoom(roomId, entity.id);

        console.log(entity.id, entity.components);
        console.log({ ...this.state.componentsMap.sprite });

        return entity;
    }

    public removeEntity(entityId: Entity['id']): void {
        this.state.rooms = Object.entries(this.state.rooms).reduce((rooms: GameState['rooms'], [roomId, room]): GameState['rooms'] => {
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

    public getEntity<T = {}>(entityId: Entity['id']): (Entity & WithComponents<T>) {
        return this.entities[entityId] as (Entity & WithComponents<T>);
    }

    public getEntities<T = {}>(entityFilter: ComponentFilter = {}): (Entity & WithComponents<T>)[] {
        if (!this.currentRoom) {
            return [];
        }

        return this.filterEntities(this.currentRoom.entities, entityFilter);
    }

    public filterEntities<T = {}>(
        entityIds: Entity['id'][],
        entityFilter: ComponentFilter
    ): (Entity & WithComponents<T>)[] {
        return Object.entries(entityFilter)
            .reduce((entityIds: Entity['id'][], [componentName, filterValue]): Entity['id'][] => {
                if (!this.state.componentsMap.hasOwnProperty(componentName)) {
                    return filterValue ? [] : entityIds;
                }

                return entityIds.filter((entityId): boolean => {
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
                        !!this.state.componentsMap[componentName][entityId];
                });
            }, entityIds).map((entityId): (Entity & WithComponents<T>) => {
                return this.getEntity(entityId) as (Entity & WithComponents<T>);
            });
    }

    public setComponentForEntity(componentName: string, value: Component, entityId: Entity['id']): void {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ${entityId} found.`);
        }

        this.state.componentsMap = {
            ...this.state.componentsMap,
            [componentName]: {
                ...this.state.componentsMap[componentName] || {},
                [entityId]: value,
            },
        }
    }

    public setComponentsForEntity(components: Components = {}, entityId: Entity['id']): void {
        this.removeComponentsFromEntity(entityId);

        Object.keys(components).forEach((componentName): void => {
            this.setComponentForEntity(
                componentName,
                components[componentName],
                entityId,
            );
        });
    }

    public removeComponentFromEntity(componentName: string, entityId: Entity['id']): void {
        if (!this.state.componentsMap.hasOwnProperty(componentName)) {
            return;
        }

        if (!this.state.componentsMap[componentName].hasOwnProperty(entityId)) {
            return;
        }

        this.state.componentsMap = {
            ...this.state.componentsMap,
            [componentName]: objectWithout(this.state.componentsMap[componentName], entityId),
        }

        if (isEmptyObject(this.state.componentsMap[componentName])) {
            this.state.componentsMap = objectWithout(this.state.componentsMap, componentName);
        }
    }

    public removeComponentsFromEntity(entityId: Entity['id']): void {
        Object.keys(this.state.componentsMap).forEach((componentName): void => {
            this.removeComponentFromEntity(componentName, entityId);
        });
    }

    public getValueOfComponentForEntity(componentName: string, entityId: Entity['id']): Component {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ${entityId} found.`);
        }

        if (
            !this.state.componentsMap.hasOwnProperty(componentName) ||
            !this.state.componentsMap[componentName].hasOwnProperty(entityId)
        ) {
            return undefined;
        }

        return this.state.componentsMap[componentName][entityId];
    }

    public getComponentsForEntity(entityId: Entity['id']): Components {
        if (!this.entities.hasOwnProperty(entityId)) {
            throw new Error(`No entity with ${entityId} found.`);
        }

        return Object.keys(this.state.componentsMap)
            .reduce((components: Components, componentName): Components => {
                if (this.state.componentsMap[componentName].hasOwnProperty(entityId)) {
                    return {
                        ...components,
                        [componentName]: this.state.componentsMap[componentName][entityId],
                    }
                }

                return components;
            }, {});
    }

    public addEventHandler(eventName: string, handler: EventHandler): void {
        this.eventHandlers = {
            ...this.eventHandlers,
            [eventName]: [
                ...this.eventHandlers[eventName] || [],
                handler,
            ],
        };
    }

    public addEventHandlerForEntities<T>(
        eventName: string,
        handler: EventHandlerPerEntity<T>,
        entityFilter: ComponentFilter = {}
    ): void {
        this.addEventHandler(eventName, (engine, ...args): void => {
            this.getEntities<T>(entityFilter).forEach((entity): void => {
                handler(engine, entity, ...args);
            });
        });
    }

    public addEventHandlerForEntityGroup<T>(
        eventName: string,
        handler: EventHandlerForEntityGroup<T>,
        entityFilter: ComponentFilter = {}
    ): void {
        this.addEventHandler(eventName, (engine, ...args): void => {
            handler(engine, this.getEntities<T>(entityFilter), ...args);
        });
    }

    public emitEvent(eventName: string, ...args: any[]): void {
        if (!this.eventHandlers.hasOwnProperty(eventName)) {
            return;
        }

        this.eventHandlers[eventName].forEach((eventHandler): void => {
            eventHandler(this, ...args);
        });
    }
}
