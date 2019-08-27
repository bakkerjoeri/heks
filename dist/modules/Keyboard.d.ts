import Hex from './../Hex.js';
import Module from './../Module.js';
export declare type Key = string;
export default class Keyboard implements Module {
    engine: Hex;
    pressedKeys: Key[];
    activeKeys: Key[];
    releasedKeys: Key[];
    constructor(engine: Hex);
    isKeyPressed(key: Key): boolean;
    isKeyDown(key: Key): boolean;
    isKeyReleased(key: Key): boolean;
    resetPressedKeys(): void;
    resetActiveKeys(): void;
    resetReleasedKeys(): void;
    resetAllKeys(): void;
}
