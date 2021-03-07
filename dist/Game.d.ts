import { EventEmitter } from './EventEmitter.js';
import { Loop } from './Loop.js';
import type { UpdateEvents, DrawEvents } from './events/updateAndDraw.js';
import type { KeyEvents } from './events/keyboard.js';
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
export interface GameEvents extends LifeCycleEvents, UpdateEvents, DrawEvents, KeyEvents, MouseEvents {
}
export declare class Game<State = Record<string, unknown>, Events extends GameEvents = GameEvents> {
    state: State;
    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    readonly eventEmitter: EventEmitter<Events, State>;
    readonly loop: Loop;
    constructor(size: [width: number, height: number], { backgroundColor, containerSelector, initialState, showSystemCursor, }?: GameOptions<State>);
    start(): void;
    private loopCallback;
}
export {};
