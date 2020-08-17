import type { Game } from './../Game';
export declare type Key = string;
export interface KeyboardEvent {
    key: Key;
}
export interface KeyboardEvents {
    keyPressed: KeyboardEvent;
    keyDown: KeyboardEvent;
    keyUp: KeyboardEvent;
}
export declare function setupKeyboardEvents(game: Game): void;
