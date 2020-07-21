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

let pressedKeys: Key[] = [];
let activeKeys: Key[] = [];
let releasedKeys: Key[] = [];

export function setupKeyboardEvents(game: Game): void {
	window.addEventListener('keydown', (event) => {
		const key = event.key.toLowerCase();

		if (!isKeyPressed(key) && !isKeyDown(key)) {
			pressedKeys = [...pressedKeys, key];
		}

		if (!isKeyDown(key)) {
			activeKeys = [...activeKeys, key];
		}
	});

	window.addEventListener('keyup', (event) => {
		const key = event.key.toLowerCase();

		if (isKeyDown(key)) {
			activeKeys = arrayWithout(activeKeys, key);
		}

		if (!isKeyReleased(key)) {
			releasedKeys = [...releasedKeys, key];
		}
	});

	window.addEventListener('blur', resetAllKeys);

	game.on('update', (state, updateEvent, { emit }) => {
		pressedKeys.forEach((activeKey) => {
			state = emit('keyPressed', state, { key: activeKey });
		});

		activeKeys.forEach((activeKey) => {
			state = emit('keyDown', state, { key: activeKey });
		});

		releasedKeys.forEach((activeKey) => {
			state = emit('keyUp', state, { key: activeKey });
		});

		return state;
	});

	game.on('afterUpdate', (state) => {
		resetPressedKeys();
		resetReleasedKeys();

		return state;
	});
}

function isKeyPressed(key: Key): boolean {
	return pressedKeys.includes(key);
}

function isKeyDown(key: Key): boolean {
	return activeKeys.includes(key);
}

function isKeyReleased(key: Key): boolean {
	return releasedKeys.includes(key);
}

function resetPressedKeys(): void {
	pressedKeys = [];
}

function resetActiveKeys(): void {
	activeKeys = [];
}

function resetReleasedKeys(): void {
	releasedKeys = [];
}

function resetAllKeys(): void {
	resetPressedKeys();
	resetActiveKeys();
	resetReleasedKeys();
}
