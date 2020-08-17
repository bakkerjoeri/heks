import { LifecycleEvents } from './events/lifecycle';
import { DrawEvents } from './events/draw';
import { KeyboardEvents } from './events/keyboard.js';
import type { Size, GameState } from './types';
interface GameOptions<State> {
    initialState?: State;
    containerSelector?: string;
}
export declare const defaultState: GameState;
export interface GameEvents extends LifecycleEvents, DrawEvents, KeyboardEvents {
    tick: {
        time: number;
    };
}
export interface EventHandler<State extends GameState, Event, Events extends GameEvents> {
    (state: State, event: Event, context: EventHandlerContext<State, Events>): State;
}
export interface EventHandlerContext<State extends GameState, Events extends GameEvents> {
    on: Game<State, Events>['on'];
    emit: Game<State, Events>['emit'];
    removeEventHandler: Game<State, Events>['removeEventHandler'];
    removeAllEventHandlers: Game<State, Events>['removeAllEventHandlers'];
}
export declare class Game<State extends GameState = GameState, Events extends GameEvents = GameEvents> {
    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    private state;
    private eventHandlers;
    constructor(size: Size, { initialState, containerSelector }?: GameOptions<State>);
    start(): void;
    on<EventType extends keyof Events>(eventType: EventType, handler: EventHandler<State, Events[EventType], Events>): void;
    emit<EventType extends keyof Events>(eventType: EventType, currentState: State, event: Events[EventType]): State;
    removeEventHandler<EventType extends keyof Events>(eventType: EventType, handler: EventHandler<State, Events[EventType], Events>): void;
    removeAllEventHandlers<EventType extends keyof Events>(eventType: EventType): void;
}
export {};
