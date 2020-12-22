import { EventEmitter } from '../EventEmitter';
import { UpdateEvents } from './updateAndDraw';
import arrayWithout from '@bakkerjoeri/array-without';

export type MouseButton = 'left' | 'middle' | 'right' | 'back' | 'forward';
export type MousePosition = [x: number, y: number];

export interface MouseMoveEvent { position: MousePosition }
export interface MouseButtonEvent { button: MouseButton, position: MousePosition }

export interface MouseEvents {
	mouseMove: MouseMoveEvent;
	mouseDown: MouseButtonEvent;
	mousePressed: MouseButtonEvent;
	mouseUp: MouseButtonEvent;
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
let mousePosition: MousePosition = [0, 0];
let previousMousePosition = mousePosition;

export function setupMouseEvents<
	Events extends MouseEvents & UpdateEvents,
	State
>(
	eventEmitter: EventEmitter<Events, State>,
	canvas: HTMLCanvasElement
): void {
	window.addEventListener('mousedown', (event) => {
		if (!mouseButtonMap.hasOwnProperty(event.button)) {
			return;
		}

		const mouseButton = mouseButtonMap[event.button];

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

		if (isMouseButtonPressed(mouseButton)) {
			mouseButtonsPressed = arrayWithout(mouseButtonsPressed, mouseButton);
		}

		if (!isMouseButtonUp(mouseButton)) {
			mouseButtonsUp = [...mouseButtonsUp, mouseButton];
		}
	});

	window.addEventListener('blur', resetAllMouseButtons);

	window.addEventListener('mousemove', (event) => {
		const canvasBoundaries = canvas.getBoundingClientRect();
		const horizontalScale = canvasBoundaries.width / canvas.width;
		const verticalScale = canvasBoundaries.height / canvas.height;

		const positionInScale = [
			(event.clientX - canvasBoundaries.left) / horizontalScale,
			(event.clientY - canvasBoundaries.top) / verticalScale,
		];

		const x = Math.round(Math.min(Math.max(positionInScale[0], 0), canvas.width));
		const y = Math.round(Math.min(Math.max(positionInScale[1], 0), canvas.height));

		mousePosition = [x, y];
	});

	eventEmitter.on('update', (state, updateEvent, { emit }) => {
		if (mousePosition[0] !== previousMousePosition[0] || mousePosition[1] !== previousMousePosition[1]) {
			state = emit('mouseMove', state, { position: mousePosition });
		}

		mouseButtonsDown.forEach((button) => {
			state = emit('mouseDown', state, { button, position: mousePosition });
		});

		mouseButtonsPressed.forEach((button) => {
			state = emit('mousePressed', state, { button, position: mousePosition });
		});

		mouseButtonsUp.forEach((button) => {
			state = emit('mouseUp', state, { button, position: mousePosition });
		});

		return state;
	});

	eventEmitter.on('afterUpdate', (state) => {
		previousMousePosition = mousePosition;
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
