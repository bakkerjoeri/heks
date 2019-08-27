import Hex from './../Hex.js';
import Module from './../Module.js';
import arrayWithout from './../utilities/arrayWithout.js';

export type Key = string;

export default class Keyboard implements Module {
    public engine: Hex;
    public pressedKeys: Key[] = [];
    public activeKeys: Key[] = [];
    public releasedKeys: Key[] = [];

    public constructor(engine: Hex) {
        this.engine = engine;

        window.addEventListener('keydown', (event: KeyboardEvent): void => {
            const key = event.key.toLowerCase();

            if (!this.isKeyPressed(key) && !this.isKeyDown(key)) {
                this.pressedKeys = [...this.pressedKeys, key];
            }

            if (!this.isKeyDown(key)) {
                this.activeKeys = [...this.activeKeys, key];
            }
        });

        window.addEventListener('keyup', (event: KeyboardEvent): void => {
            const key = event.key.toLowerCase();

            if (this.isKeyDown(key)) {
                this.activeKeys = arrayWithout(this.activeKeys, key);
            }

            if (!this.isKeyReleased(key)) {
                this.releasedKeys = [...this.releasedKeys, key];
            }
        });

        window.addEventListener('blur', this.resetAllKeys.bind(this));

        this.engine.addEventHandler('update', (engine): void => {
            this.pressedKeys.forEach((activeKey): void => {
                engine.emitEvent('keyPressed', activeKey);
            });

            this.activeKeys.forEach((activeKey): void => {
                engine.emitEvent('keyActive', activeKey);
            });

            this.releasedKeys.forEach((activeKey): void => {
                engine.emitEvent('keyUp', activeKey);
            });
        });

        this.engine.addEventHandler('afterUpdate', (): void => {
            this.resetPressedKeys();
            this.resetReleasedKeys();
        });
    }

    public isKeyPressed(key: Key): boolean {
        return this.pressedKeys.includes(key);
    }

    public isKeyDown(key: Key): boolean {
        return this.activeKeys.includes(key);
    }

    public isKeyReleased(key: Key): boolean {
        return this.releasedKeys.includes(key);
    }

    public resetPressedKeys(): void {
        this.pressedKeys = [];
    }

    public resetActiveKeys(): void {
        this.activeKeys = [];
    }

    public resetReleasedKeys(): void {
        this.releasedKeys = [];
    }

    public resetAllKeys(): void {
        this.resetPressedKeys();
        this.resetActiveKeys();
        this.resetReleasedKeys();
    }
}
