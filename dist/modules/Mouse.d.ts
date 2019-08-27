import Heks, { Position } from './../Heks.js';
import Entity from './../Entity.js';
import Module from './../Module.js';
declare type MouseButton = 'left' | 'middle' | 'right' | 'back' | 'forward';
export default class Mouse implements Module {
    engine: Heks;
    positionInRoom: Position;
    positionInViewport: Position;
    pressedButtons: (MouseButton)[];
    activeButtons: (MouseButton)[];
    releasedButtons: (MouseButton)[];
    entitiesUnderMouse: Entity['id'][];
    constructor(engine: Heks);
    isButtonPressed(button: MouseButton): boolean;
    isButtonDown(button: MouseButton): boolean;
    isButtonReleased(button: MouseButton): boolean;
    resetPressedButtons(): void;
    resetActiveButtons(): void;
    resetReleasedButtons(): void;
    resetAllButtons(): void;
}
export {};
