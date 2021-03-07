import { EventEmitter } from '../EventEmitter';
import { UpdateEvents } from './updateAndDraw';
export declare type Key = string;
export interface KeyEvent {
    key: Key;
}
export interface KeyEvents {
    keyPressed: KeyEvent;
    keyDown: KeyEvent;
    keyUp: KeyEvent;
}
export declare function setupKeyboardEvents<Events extends KeyEvent & UpdateEvents, State>(eventEmitter: EventEmitter<Events, State>): void;
