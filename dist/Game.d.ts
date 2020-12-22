import { EventEmitter } from './EventEmitter.js';
import { Loop } from './Loop.js';
import type { EntityState } from './entities.js';
import type { SpriteState } from './sprites.js';
import type { UpdateEvents, DrawEvents } from './events/updateAndDraw.js';
import type { KeyboardEvents } from './events/keyboard.js';
import type { MouseEvents } from './events/mouse.js';
interface GameOptions<State> {
    backgroundColor?: string;
    containerSelector?: string;
    initialState?: State;
    showSystemCursor?: boolean;
}
export interface TickEvent {
    time: number;
}
export interface LifeCycleEvents {
    start: Record<string, never>;
    tick: TickEvent;
}
export interface GameState extends EntityState, SpriteState {
}
export interface GameEvents extends LifeCycleEvents, UpdateEvents, DrawEvents, KeyboardEvents, MouseEvents {
}
export declare const defaultState: GameState;
export declare class Game<State extends GameState = GameState, Events extends GameEvents = GameEvents> {
    private state;
    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    readonly eventEmitter: EventEmitter<Events, State>;
    readonly loop: Loop;
    constructor(size: [width: number, height: number], { backgroundColor, containerSelector, initialState, showSystemCursor, }?: GameOptions<State>);
    start(): void;
    private loopCallback;
}
export {};
