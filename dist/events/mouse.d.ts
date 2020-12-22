import { EventEmitter } from '../EventEmitter';
import { UpdateEvents } from './updateAndDraw';
export declare type MouseButton = 'left' | 'middle' | 'right' | 'back' | 'forward';
export declare type MousePosition = [x: number, y: number];
export interface MouseMoveEvent {
    position: MousePosition;
}
export interface MouseButtonEvent {
    button: MouseButton;
    position: MousePosition;
}
export interface MouseEvents {
    mouseMove: MouseMoveEvent;
    mouseDown: MouseButtonEvent;
    mousePressed: MouseButtonEvent;
    mouseUp: MouseButtonEvent;
}
export declare function setupMouseEvents<Events extends MouseEvents & UpdateEvents, State>(eventEmitter: EventEmitter<Events, State>, canvas: HTMLCanvasElement): void;
