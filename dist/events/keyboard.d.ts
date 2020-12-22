import { EventEmitter } from '../EventEmitter';
import { UpdateEvents } from './updateAndDraw';
export declare type Key = string;
export interface KeyboardEvent {
    key: Key;
}
export interface KeyboardEvents {
    keyPressed: KeyboardEvent;
    keyDown: KeyboardEvent;
    keyUp: KeyboardEvent;
}
export declare function setupKeyboardEvents<Events extends KeyboardEvents & UpdateEvents, State>(eventEmitter: EventEmitter<Events, State>): void;
