import Hex, { Position, WithModules } from './../Hex.js';
import { Entity } from './../Entity.js';
import SpriteManager from './SpriteManager.js';
import Module from './../Module.js';
import arrayWithout from './../utilities/arrayWithout.js';
import { findEntitiesAtPosition } from './Renderer.js';

type MouseButton = 'left' | 'middle' | 'right' | 'back' | 'forward';
const MouseButtonMap: { [eventValue: number]: MouseButton } = {
    0: 'left',
    1: 'middle',
    2: 'right',
    3: 'back',
    4: 'forward',
};

export default class Mouse implements Module {
    public engine: Hex & WithModules<{ Mouse: Mouse; SpriteManager: SpriteManager}>;
    public positionInRoom: Position = {x: 0, y: 0};
    public positionInViewport: Position = {x: 0, y: 0};
    public pressedButtons: (MouseButton)[] = [];
    public activeButtons: (MouseButton)[] = [];
    public releasedButtons: (MouseButton)[] = [];
    public entitiesUnderMouse: Entity['id'][] = [];

    public constructor(engine: Hex & WithModules<{ Mouse: Mouse; SpriteManager: SpriteManager }>) {
        this.engine = engine;

        this.resetAllButtons = this.resetAllButtons.bind(this);

        engine.addEventHandler('beforeUpdate', (): void => {
            this.entitiesUnderMouse = findEntitiesAtPosition(engine, this.positionInRoom)
                .map((entity): Entity['id'] => entity.id);
        })

        window.addEventListener('mousemove', (event): void => {
            const viewports = engine.getViewportsInCurrentRoom();
            const canvasBounds = engine.canvas.getBoundingClientRect();
            const positionInViewport = {
                x: Math.round(Math.min(Math.max(event.clientX - canvasBounds.left, 0), canvasBounds.width) / engine.scale),
                y: Math.round(Math.min(Math.max(event.clientY - canvasBounds.top, 0), canvasBounds.height) / engine.scale),
            };

            let viewportWithFocus = viewports.find((viewport): boolean => {
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

        window.addEventListener('mousedown', (event): void => {
            const button = MouseButtonMap[event.button];

            if (!this.isButtonPressed(button) && !this.isButtonDown(button)) {
                this.pressedButtons = [...this.pressedButtons, button];
            }

            if (!this.isButtonDown(button)) {
                this.activeButtons = [...this.activeButtons, button];
            }
        });

        window.addEventListener('mouseup', (event): void => {
            const button = MouseButtonMap[event.button];

            if (this.isButtonDown(button)) {
                this.activeButtons = arrayWithout(this.activeButtons, button);
            }

            if (!this.isButtonReleased(button)) {
                this.releasedButtons = [...this.releasedButtons, button];
            }
        });

        window.addEventListener('blur', this.resetAllButtons.bind(this));

        this.engine.addEventHandler('update', (engine): void => {
            this.pressedButtons.forEach((activeButton): void => {
                engine.emitEvent('mouseButtonPressed', activeButton, this.positionInRoom, this.positionInViewport, this.entitiesUnderMouse);
            });

            this.activeButtons.forEach((activeButton): void => {
                engine.emitEvent('mouseButtonActive', activeButton, this.positionInRoom, this.positionInViewport, this.entitiesUnderMouse);
            });

            this.releasedButtons.forEach((activeButton): void => {
                engine.emitEvent('mouseButtonUp', activeButton, this.positionInRoom, this.positionInViewport, this.entitiesUnderMouse);
            });
        });

        this.engine.addEventHandler('afterUpdate', (): void => {
            this.resetPressedButtons();
            this.resetReleasedButtons();
        });
    }

    public isButtonPressed(button: MouseButton): boolean {
        return this.pressedButtons.includes(button);
    }

    public isButtonDown(button: MouseButton): boolean {
        return this.activeButtons.includes(button);
    }

    public isButtonReleased(button: MouseButton): boolean {
        return this.releasedButtons.includes(button);
    }

    public resetPressedButtons(): void {
        this.pressedButtons = [];
    }

    public resetActiveButtons(): void {
        this.activeButtons = [];
    }

    public resetReleasedButtons(): void {
        this.releasedButtons = [];
    }

    public resetAllButtons(): void {
        this.resetPressedButtons();
        this.resetActiveButtons();
        this.resetReleasedButtons();
    }
}
