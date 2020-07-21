import type { Game } from './../Game';
import arrayWithout from '@bakkerjoeri/array-without';

export type MouseButton = 'left' | 'middle' | 'right' | 'back' | 'forward';

export interface MouseEvents {
    mousePressed: { button: MouseButton };
    mouseDown: { button: MouseButton };
    mouseUp: { button: MouseButton };
}

const mouseButtonMap: { [mouseButtonIndex: number]: MouseButton} = {
    0: 'left',
    1: 'middle',
    2: 'right',
    3: 'back',
    4: 'forward',
}

let mouseButtonsPressed: MouseButton[] = [];
let mouseButtonsDown: MouseButton[] = [];
let mouseButtonsUp: MouseButton[] = [];

export function setupMouseEvents(game: Game): void {
    window.addEventListener('mousedown', (event) => {
        if (!mouseButtonMap.hasOwnProperty(event.button)) {
            return;
        }

		const mouseButton = mouseButtonMap[event.button];

		if (!isMouseButtonPressed(mouseButton) && !isMouseButtonDown(mouseButton)) {
			mouseButtonsPressed = [...mouseButtonsPressed, mouseButton];
		}

		if (!isMouseButtonDown(mouseButton)) {
			mouseButtonsDown = [...mouseButtonsDown, mouseButton];
		}
	});

	window.addEventListener('mouseup', (event) => {
        if (!mouseButtonMap.hasOwnProperty(event.button)) {
            return;
        }

		const mouseButton = mouseButtonMap[event.button];

		if (isMouseButtonDown(mouseButton)) {
			mouseButtonsDown = arrayWithout(mouseButtonsDown, mouseButton);
		}

		if (!isMouseButtonUp(mouseButton)) {
			mouseButtonsUp = [...mouseButtonsUp, mouseButton];
		}
	});

    window.addEventListener('blur', resetAllMouseButtons);

    game.on('update', (state, updateEvent, { emit }) => {
		mouseButtonsPressed.forEach((button) => {
			state = emit('mousePressed', state, { button });
		});

		mouseButtonsDown.forEach((button) => {
			state = emit('mouseDown', state, { button });
		});

		mouseButtonsUp.forEach((button) => {
			state = emit('mouseUp', state, { button });
		});

		return state;
	});

	game.on('afterUpdate', (state) => {
		resetMouseButtonsPressed();
		resetMouseButtonsUp();

		return state;
	});
}

function isMouseButtonPressed(mouseButton: MouseButton): boolean {
	return mouseButtonsPressed.includes(mouseButton);
}

function isMouseButtonDown(mouseButton: MouseButton): boolean {
	return mouseButtonsDown.includes(mouseButton);
}

function isMouseButtonUp(mouseButton: MouseButton): boolean {
	return mouseButtonsUp.includes(mouseButton);
}

function resetMouseButtonsPressed(): void {
	mouseButtonsPressed = [];
}

function resetMouseButtonsDown(): void {
	mouseButtonsDown = [];
}

function resetMouseButtonsUp(): void {
	mouseButtonsUp = [];
}

function resetAllMouseButtons(): void {
	resetMouseButtonsPressed();
	resetMouseButtonsDown();
	resetMouseButtonsUp();
}
