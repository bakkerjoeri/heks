import { Size, GameState, GameEvents } from './types';
import EventEmitter from './EventEmitter.js';
interface GameOptions<State> {
    initialState?: State;
    scale?: number;
    containerSelector?: string;
}
export declare const defaultState: GameState;
export default class Game<State extends GameState = GameState, Events extends GameEvents = GameEvents> {
    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;
    readonly scale: number;
    private state;
    private readonly eventEmitter;
    constructor(size: Size, eventEmitter: EventEmitter<Events>, { initialState, scale, containerSelector }?: GameOptions<State>);
    start(): void;
}
export {};
