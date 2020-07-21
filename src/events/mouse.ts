import type { Game } from './../Game';
import arrayWithout from '@bakkerjoeri/array-without';

export type MouseButton = 'left' | 'middle' | 'right' | 'back' | 'forward';

export interface MouseEvents {
	mouseDown: { button: MouseButton };
	mousePressed: { button: MouseButton };
	mouseUp: { button: MouseButton };
}

const mouseButtonMap: { [mouseButtonIndex: number]: MouseButton} = {
	0: 'left',
	1: 'middle',
	2: 'right',
	3: 'back',
	4: 'forward',
}

let mouseButtonsDown: MouseButton[] = [];
let mouseButtonsPressed: MouseButton[] = [];
let mouseButtonsUp: MouseButton[] = [];

export function setupMouseEvents(game: Game): void {
	window.addEventListener('mousedown', (event) => {
		if (!mouseButtonMap.hasOwnProperty(event.button)) {
			return;
		}

		const mouseButton = mouseButtonMap[event.button];

		console.log('native down', mouseButton);

		if (!isMouseButtonDown(mouseButton) && !isMouseButtonPressed(mouseButton)) {
			mouseButtonsDown = [...mouseButtonsDown, mouseButton];
		}

		if (!isMouseButtonPressed(mouseButton)) {
			mouseButtonsPressed = [...mouseButtonsPressed, mouseButton];
		}
	});

	window.addEventListener('mouseup', (event) => {
		if (!mouseButtonMap.hasOwnProperty(event.button)) {
			return;
		}

		const mouseButton = mouseButtonMap[event.button];

		console.log('native up', mouseButton);

		if (isMouseButtonPressed(mouseButton)) {
			mouseButtonsPressed = arrayWithout(mouseButtonsPressed, mouseButton);
		}

		if (!isMouseButtonUp(mouseButton)) {
			mouseButtonsUp = [...mouseButtonsUp, mouseButton];
		}
	});

	window.addEventListener('blur', resetAllMouseButtons);

	game.on('update', (state, updateEvent, { emit }) => {
		mouseButtonsDown.forEach((button) => {
			state = emit('mouseDown', state, { button });
		});

		mouseButtonsPressed.forEach((button) => {
			state = emit('mousePressed', state, { button });
		});

		mouseButtonsUp.forEach((button) => {
			state = emit('mouseUp', state, { button });
		});

		return state;
	});

	game.on('afterUpdate', (state) => {
		resetMouseButtonsDown();
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
