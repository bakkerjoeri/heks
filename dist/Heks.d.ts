import Entity from './Entity.js';
import { Components, Component, ComponentPrimitive, ComponentObject } from './Component.js';
import { Modules, ConstructableModules } from './Module.js';
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
    [componentName: string]: boolean | ComponentPrimitive | ((value: Component, entity: Entity, engine: Heks) => boolean);
}
export interface Constructable<TClass> {
    new (...args: any[]): TClass;
}
export declare type EventHandler = (engine: Heks, ...args: any[]) => void;
export declare type EventHandlerPerEntity<TComponents extends Components = {}> = (engine: Heks, entity: Entity<TComponents>, ...args: any[]) => void;
export declare type EventHandlerForEntityGroup<TComponents extends Components = {}> = (engine: Heks, entities: (Entity<TComponents>)[], ...args: any[]) => void;
export interface Size {
    width: number;
    height: number;
}
export interface Position extends ComponentObject {
    x: number;
    y: number;
}
export declare type PositionComponent = Position & ComponentObject;
export declare type SizeComponent = Size & ComponentObject;
export interface Offset {
    top: number;
    left: number;
}
export declare type Boundaries = Size & Position;
interface HeksOptions {
    modules?: ConstructableModules;
    container?: Element | string;
    size?: Size;
    scale?: number;
}
export default class Heks {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    isRunning: boolean;
    modules: Modules;
    scale: number;
    size: Size;
    state: GameState;
    private entities;
    private eventHandlers;
    constructor({ modules, size, container, scale, }?: HeksOptions);
    start(): void;
    stop(): void;
    private setupCanvas;
    private step;
    private update;
    private draw;
    createRoom(id?: Room['id'], size?: Size, setAsCurrent?: boolean): Room['id'];
    setCurrentRoom(roomId: Room['id']): void;
    readonly currentRoom: Room;
    createLayer(name: string, depth?: number, roomId?: Room['id']): void;
    addViewportToRoom(roomId: Room['id'], viewportId: Viewport['id']): void;
    addEntityToRoom(roomId: Room['id'], entityId: Entity['id']): void;
    createViewport(viewportOptions?: Partial<Viewport>, roomId?: Room['id']): Viewport;
    getViewport(viewportId: Viewport['id']): Viewport;
    getViewportsInCurrentRoom(): Viewport[];
    setEntityToFollowForViewport(entityId: Entity['id'], viewportId: Viewport['id']): void;
    createEntity(components?: Components, roomId?: Room['id']): Entity;
    removeEntity(entityId: Entity['id']): void;
    getEntity<TComponents extends Components = {}>(entityId: Entity['id']): (Entity<TComponents>);
    getEntities<TComponents extends Components = {}>(entityFilter?: ComponentFilter): (Entity<TComponents>)[];
    filterEntities<TComponents extends Components = {}>(entityIds: Entity['id'][], entityFilter: ComponentFilter): (Entity<TComponents>)[];
    setComponentForEntity(componentName: string, value: Component, entityId: Entity['id']): void;
    setComponentsForEntity(components: Components | undefined, entityId: Entity['id']): void;
    removeComponentFromEntity(componentName: string, entityId: Entity['id']): void;
    removeComponentsFromEntity(entityId: Entity['id']): void;
    getValueOfComponentForEntity(componentName: string, entityId: Entity['id']): Component;
    getComponentsForEntity<TComponents extends Components = {}>(entityId: Entity['id']): TComponents;
    addEventHandler(eventName: string, handler: EventHandler): void;
    addEventHandlerForEntities<TComponents extends Components>(eventName: string, handler: EventHandlerPerEntity<TComponents>, entityFilter?: ComponentFilter): void;
    addEventHandlerForEntityGroup<TComponents extends Components>(eventName: string, handler: EventHandlerForEntityGroup<TComponents>, entityFilter?: ComponentFilter): void;
    emitEvent(eventName: string, ...args: any[]): void;
}
export {};
