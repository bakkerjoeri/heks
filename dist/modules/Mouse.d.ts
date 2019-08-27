import Hex, { Position } from './../Hex.js';
import Entity from './../Entity.js';
import Module from './../Module.js';
declare type MouseButton = 'left' | 'middle' | 'right' | 'back' | 'forward';
export default class Mouse implements Module {
    engine: Hex;
    positionInRoom: Position;
    positionInViewport: Position;
    pressedButtons: (MouseButton)[];
    activeButtons: (MouseButton)[];
    releasedButtons: (MouseButton)[];
    entitiesUnderMouse: Entity['id'][];
    constructor(engine: Hex);
    isButtonPressed(button: MouseButton): boolean;
    isButtonDown(button: MouseButton): boolean;
    isButtonReleased(button: MouseButton): boolean;
    resetPressedButtons(): void;
    resetActiveButtons(): void;
    resetReleasedButtons(): void;
    resetAllButtons(): void;
}
export {};
