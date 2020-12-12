import type { Game } from './../Game';
import arrayWithout from '@bakkerjoeri/array-without';

export type Key = string;

export interface KeyboardEvent {
	key: Key;
}

export interface KeyboardEvents {
	keyPressed: KeyboardEvent;
	keyDown: KeyboardEvent;
	keyUp: KeyboardEvent;
}

let keysPressed: Key[] = [];
let keysDown: Key[] = [];
let keysUp: Key[] = [];

export function setupKeyboardEvents(game: Game): void {
	window.addEventListener('keydown', (event) => {
		const key = event.key;

		if (!isKeyPressed(key) && !isKeyDown(key)) {
			keysPressed = [...keysPressed, key];
		}

		if (!isKeyDown(key)) {
			keysDown = [...keysDown, key];
		}
	});

	window.addEventListener('keyup', (event) => {
		const key = event.key;

		if (isKeyDown(key)) {
			keysDown = arrayWithout(keysDown, key);
		}

		if (!isKeyUp(key)) {
			keysUp = [...keysUp, key];
		}
	});

	window.addEventListener('blur', resetAllKeys);

	game.on('update', (state, updateEvent, { emit }) => {
		keysPressed.forEach((keyPressed) => {
			state = emit('keyPressed', state, { key: keyPressed });
		});

		keysDown.forEach((keyDown) => {
			state = emit('keyDown', state, { key: keyDown });
		});

		keysUp.forEach((keyUp) => {
			state = emit('keyUp', state, { key: keyUp });
		});

		return state;
	});

	game.on('afterUpdate', (state) => {
		resetKeysPressed();
		resetKeysUp();

		return state;
	});
}

function isKeyPressed(key: Key): boolean {
	return keysPressed.includes(key);
}

function isKeyDown(key: Key): boolean {
	return keysDown.includes(key);
}

function isKeyUp(key: Key): boolean {
	return keysUp.includes(key);
}

function resetKeysPressed(): void {
	keysPressed = [];
}

function resetKeysDown(): void {
	keysDown = [];
}

function resetKeysUp(): void {
	keysUp = [];
}

function resetAllKeys(): void {
	resetKeysPressed();
	resetKeysDown();
	resetKeysUp();
}
