import arrayWithout from './utilities/arrayWithout.js';

export default class Keyboard {
    constructor(engine) {
        this.engine = engine;
        this.pressedKeys = [];
        this.activeKeys = [];
        this.releasedKeys = [];

        window.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();

            if (!this.isKeyPressed(key) && !this.isKeyDown(key)) {
                this.pressedKeys = [...this.pressedKeys, key];
            }

            if (!this.isKeyDown(key)) {
                this.activeKeys = [...this.activeKeys, key];
            }
        });

        window.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();

            if (this.isKeyDown(key)) {
                this.activeKeys = arrayWithout(this.activeKeys, key);
            }

            if (!this.isKeyReleased(key)) {
                this.releasedKeys = [...this.releasedKeys, key];
            }
        });

        window.addEventListener('blur', this.resetAllKeys.bind(this));

        this.engine.addEventHandler('update', (engine) => {
            this.pressedKeys.forEach((activeKey) => {
                engine.emitEvent('keyPressed', activeKey);
            });

            this.activeKeys.forEach((activeKey) => {
                engine.emitEvent('keyDown', activeKey);
            });

            this.releasedKeys.forEach((activeKey) => {
                engine.emitEvent('keyReleased', activeKey);
            });
        });

        this.engine.addEventHandler('afterUpdate', () => {
            this.resetPressedKeys();
            this.resetReleasedKeys();
        });
    }

    isKeyPressed(key) {
        return this.pressedKeys.includes(key);
    }

    isKeyDown(key) {
        return this.activeKeys.includes(key);
    }

    isKeyReleased(key) {
        return this.releasedKeys.includes(key);
    }

    resetPressedKeys() {
        this.pressedKeys = [];
    }

    resetActiveKeys() {
        this.activeKeys = [];
    }

    resetReleasedKeys() {
        this.releasedKeys = [];
    }

    resetAllKeys() {
        this.resetPressedKeys();
        this.resetActiveKeys();
        this.resetReleasedKeys();
    }
}
