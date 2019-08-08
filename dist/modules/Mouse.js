import arrayWithout from './../utilities/arrayWithout.js';
import { findEntitiesAtPosition } from './Renderer.js';
const MouseButtonMap = {
    0: 'left',
    1: 'middle',
    2: 'right',
    3: 'back',
    4: 'forward',
};
export default class Mouse {
    constructor(engine) {
        this.positionInRoom = { x: 0, y: 0 };
        this.positionInViewport = { x: 0, y: 0 };
        this.pressedButtons = [];
        this.activeButtons = [];
        this.releasedButtons = [];
        this.entitiesUnderMouse = [];
        this.engine = engine;
        this.resetAllButtons = this.resetAllButtons.bind(this);
        engine.addEventHandler('beforeUpdate', () => {
            this.entitiesUnderMouse = findEntitiesAtPosition(engine, this.positionInRoom)
                .map((entity) => entity.id);
        });
        window.addEventListener('mousemove', (event) => {
            const viewports = engine.getViewportsInCurrentRoom();
            const canvasBounds = engine.canvas.getBoundingClientRect();
            const positionInViewport = {
                x: Math.round(Math.min(Math.max(event.clientX - canvasBounds.left, 0), canvasBounds.width) / engine.scale),
                y: Math.round(Math.min(Math.max(event.clientY - canvasBounds.top, 0), canvasBounds.height) / engine.scale),
            };
            let viewportWithFocus = viewports.find((viewport) => {
                return positionInViewport.x >= viewport.origin.x &&
                    positionInViewport.x <= viewport.origin.x + viewport.size.width &&
                    positionInViewport.y >= viewport.origin.y &&
                    positionInViewport.y <= viewport.origin.y + viewport.size.height;
            }) || viewports[0];
            const positionInRoom = {
                x: Math.min(Math.max((positionInViewport.x + viewportWithFocus.position.x - viewportWithFocus.origin.x), viewportWithFocus.position.x), viewportWithFocus.position.x + viewportWithFocus.size.width),
                y: Math.min(Math.max((positionInViewport.y + viewportWithFocus.position.y - viewportWithFocus.origin.y), viewportWithFocus.position.y), viewportWithFocus.position.y + viewportWithFocus.size.height),
            };
            this.positionInViewport = positionInViewport;
            this.positionInRoom = positionInRoom;
            engine.emitEvent('mouseMove', this.positionInRoom, this.positionInViewport, this.entitiesUnderMouse);
        });
        window.addEventListener('mousedown', (event) => {
            const button = MouseButtonMap[event.button];
            if (!this.isButtonPressed(button) && !this.isButtonDown(button)) {
                this.pressedButtons = [...this.pressedButtons, button];
            }
            if (!this.isButtonDown(button)) {
                this.activeButtons = [...this.activeButtons, button];
            }
        });
        window.addEventListener('mouseup', (event) => {
            const button = MouseButtonMap[event.button];
            if (this.isButtonDown(button)) {
                this.activeButtons = arrayWithout(this.activeButtons, button);
            }
            if (!this.isButtonReleased(button)) {
                this.releasedButtons = [...this.releasedButtons, button];
            }
        });
        window.addEventListener('blur', this.resetAllButtons.bind(this));
        this.engine.addEventHandler('update', (engine) => {
            this.pressedButtons.forEach((activeButton) => {
                engine.emitEvent('mouseButtonPressed', activeButton, this.positionInRoom, this.positionInViewport, this.entitiesUnderMouse);
            });
            this.activeButtons.forEach((activeButton) => {
                engine.emitEvent('mouseButtonActive', activeButton, this.positionInRoom, this.positionInViewport, this.entitiesUnderMouse);
            });
            this.releasedButtons.forEach((activeButton) => {
                engine.emitEvent('mouseButtonUp', activeButton, this.positionInRoom, this.positionInViewport, this.entitiesUnderMouse);
            });
        });
        this.engine.addEventHandler('afterUpdate', () => {
            this.resetPressedButtons();
            this.resetReleasedButtons();
        });
    }
    isButtonPressed(button) {
        return this.pressedButtons.includes(button);
    }
    isButtonDown(button) {
        return this.activeButtons.includes(button);
    }
    isButtonReleased(button) {
        return this.releasedButtons.includes(button);
    }
    resetPressedButtons() {
        this.pressedButtons = [];
    }
    resetActiveButtons() {
        this.activeButtons = [];
    }
    resetReleasedButtons() {
        this.releasedButtons = [];
    }
    resetAllButtons() {
        this.resetPressedButtons();
        this.resetActiveButtons();
        this.resetReleasedButtons();
    }
}
