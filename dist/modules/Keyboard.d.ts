import Heks from './../Heks.js';
import Module from './../Module.js';
export declare type Key = string;
export default class Keyboard implements Module {
    engine: Heks;
    pressedKeys: Key[];
    activeKeys: Key[];
    releasedKeys: Key[];
    constructor(engine: Heks);
    isKeyPressed(key: Key): boolean;
    isKeyDown(key: Key): boolean;
    isKeyReleased(key: Key): boolean;
    resetPressedKeys(): void;
    resetActiveKeys(): void;
    resetReleasedKeys(): void;
    resetAllKeys(): void;
}
