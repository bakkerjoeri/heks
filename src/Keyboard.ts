type Key = string;

export class Keyboard {
	private keysPressed: Key[] = [];
	private keysDown: Key[] = [];
	private keysUp: Key[] = [];

	constructor() {
		window.addEventListener("keydown", (event) => {
			const key = event.key;

			if (!this.isKeyPressed(key) && !this.isKeyDown(key)) {
				this.keysPressed = [...this.keysPressed, key];
			}

			if (!this.isKeyDown(key)) {
				this.keysDown = [...this.keysDown, key];
			}
		});

		window.addEventListener("keyup", (event) => {
			const key = event.key;

			if (this.isKeyDown(key)) {
				this.keysDown = this.keysDown.filter(
					(keyDown) => keyDown !== key
				);
			}

			if (!this.isKeyUp(key)) {
				this.keysUp = [...this.keysUp, key];
			}
		});

		window.addEventListener("blur", this.resetAllKeys.bind(this));
	}

	public afterUpdate() {
		this.keysPressed = [];
		this.keysUp = [];
	}

	/**
	 * Returns whether a key was pressed this frame.
	 */
	public isKeyPressed(key: Key): boolean {
		return this.keysPressed.includes(key);
	}

	/**
	 * Returns whether a key is being held down.
	 */
	public isKeyDown(key: Key): boolean {
		return this.keysDown.includes(key);
	}

	/**
	 * Returns whether a key was released this frame.
	 */
	public isKeyUp(key: Key): boolean {
		return this.keysUp.includes(key);
	}

	private resetAllKeys(): void {
		this.keysPressed = [];
		this.keysDown = [];
		this.keysUp = [];
	}
}

export const keyboard = new Keyboard();
