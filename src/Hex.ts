import { Entity, createEntityProxy } from './Entity.js';
import { Components, Component, ComponentPrimitive, ComponentObject } from './Component.js';
import { Modules, ConstructableModules } from './Module.js';
import createUuid from './utilities/createUuid.js';
import isEmptyObject from './utilities/isEmptyObject.js';
import findElementOrSelector from './utilities/findElementOrSelector.js';
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

export interface ComponentsEntityMap {
    [componentName: string]: {
        [entityId in Entity['id']]: Component;
    };
}

export interface ComponentFilter {
    [componentName: string]: boolean | ComponentPrimitive | ((
        value: Component,
        entity: Entity,
        engine: Hex
    ) => boolean);
}

export interface Constructable<T> {
    new (...args: any[]): T;
}

export type EventHandler = (engine: Hex, ...args: any[]) => void;

export type EventHandlerPerEntity<TComponents extends Components> = (engine: Hex, entity: Entity<TComponents>, ...args: any[]) => void;

export type EventHandlerForEntityGroup<TComponents extends Components> = (engine: Hex, entities: (Entity<TComponents>)[], ...args: any[]) => void;

export interface Size {
    width: number;
    height: number;
}

export interface Position extends ComponentObject {
    x: number;
    y: number;
}

export type PositionComponent = Position & ComponentObject;
export type SizeComponent = Size & ComponentObject;

export interface Offset {
    top: number;
    left: number;
}

export type Boundaries = Size & Position;

interface CSSStyleDeclarationWithImageRendering extends CSSStyleDeclaration {
    imageRendering: string;
}

export default class Hex<TModules extends Modules = {}> {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public isRunning: boolean = false;
    public scale: number;
    public size: Size;
    public state: GameState = {
        componentsMap: {},
        currentRoomId: null,
        rooms: {},
        viewports: {},
    };
    public modules: TModules;

    private entities: {
        [entityId in Entity['id']]: Entity;
    } = {};
    private eventHandlers: {
        [eventName: string]: EventHandler[];
    } = {}

    public constructor(
        modules: ConstructableModules<TModules>,
        containerElementOrSelector: Element | string,
        size: Size = { width: 0, height: 0 },
        scale: number = 1
    ) {
        this.modules = Object.keys(modules).reduce((
            allModules: TModules,
            moduleName: string
        ): TModules => {
            return Object.assign({}, allModules, {
                [moduleName]: modules[moduleName],
            });
        }, {} as TModules);

        this.size = size;
        this.scale = scale;
        this.canvas = document.createElement('canvas');
        const context = this.canvas.getContext('2d');

        if (!context) {
            throw new Error('Could not create context 2D on canvas.');
        }

        this.context = context;
        this.setupCanvas(this.canvas, containerElementOrSelector);
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

    private setupCanvas(
        canvas: HTMLCanvasElement,
        containerElementOrSelector: Element | string = 'body',
    ): void {
        canvas.setAttribute('width', this.size.width.toString());
        canvas.setAttribute('height', this.size.height.toString());

        const canvasStyle = canvas.style as CSSStyleDeclarationWithImageRendering;
        canvasStyle.width = `${this.size.width * this.scale}px`;
        canvasStyle.height = `${this.size.height * this.scale}px`;
        canvasStyle.imageRendering = '-moz-crisp-edges';
        canvasStyle.imageRendering = '-webkit-crisp-edges';
        canvasStyle.imageRendering = 'pixelated';
        canvasStyle.backgroundColor = 'black';

        let container = findElementOrSelector(containerElementOrSelector);

        if (!container) {
            throw new Error(`Unable to find container for canvas ${container}.`);
        }

        container.appendChild(canvas);
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
        size: Size = this.size,
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
        if (!this.state.currentRoomId) {
            throw new Error('There is no current room. Please set one before expecting it.');
        }

        return this.state.rooms[this.state.currentRoomId];
    }

    public createLayer(
        name: string,
        depth: number = 0,
        roomId: Room['id'] = this.state.currentRoomId as string
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
        roomId: Room['id'] = this.state.currentRoomId as string
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
        roomId: Room['id'] = this.state.currentRoomId as string
    ): Entity {
        const entity = createEntityProxy(this);

        this.entities = {
            ...this.entities,
            [entity.id]: entity,
        }

        this.setComponentsForEntity(components, entity.id);
        this.addEntityToRoom(roomId, entity.id);

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

    public getEntity<TComponents extends Components = {}>(entityId: Entity['id']): (Entity<TComponents>) {
        return this.entities[entityId] as (Entity<TComponents>);
    }

    public getEntities<TComponents extends Components = {}>(
        entityFilter: ComponentFilter = {}
    ): (Entity<TComponents>)[] {
        if (!this.currentRoom) {
            return [];
        }

        return this.filterEntities<TComponents>(this.currentRoom.entities, entityFilter);
    }

    public filterEntities<TComponents extends Components = {}>(
        entityIds: Entity['id'][],
        entityFilter: ComponentFilter
    ): (Entity<TComponents>)[] {
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
            }, entityIds).map((entityId): (Entity<TComponents>) => {
                return this.getEntity(entityId) as (Entity<TComponents>);
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

    public addEventHandlerForEntities<T extends Components>(
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

    public addEventHandlerForEntityGroup<T extends Components>(
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
