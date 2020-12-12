import { start } from './tick.js';
import { setupCanvas } from './setupCanvas.js';
import { LifecycleEvents, setupLifecycleEvents } from './events/lifecycle';
import { DrawEvents, setupDrawEvents } from './events/draw';
import { KeyboardEvents, setupKeyboardEvents } from './events/keyboard.js';
import { MouseEvents, setupMouseEvents } from './events/mouse.js';
import type { Size, GameState } from './types';

interface GameOptions<State> {
	initialState?: State;
	containerSelector?: string;
	showSystemCursor?: boolean;
}

export const defaultState: GameState = {
	entities: {},
	sprites: {},
};

export interface GameEvents extends LifecycleEvents, DrawEvents, KeyboardEvents, MouseEvents {
	tick: { time: number };
}

export class Game<
	State extends GameState = GameState,
	Events extends GameEvents = GameEvents
> {
	public readonly canvas: HTMLCanvasElement;
	public readonly context: CanvasRenderingContext2D;

	private state: State;
	private eventHandlers: any = {};

	constructor(
		size: Size,
		{
			initialState = defaultState as State,
			containerSelector = 'body',
			showSystemCursor,
		}: GameOptions<State> = {}
	) {
        const { canvas, context } = setupCanvas(containerSelector, size, showSystemCursor);
		this.canvas = canvas;
        this.context = context;
        this.state = {...initialState};

        setupLifecycleEvents(this);
        setupDrawEvents(this, this.context);
		setupKeyboardEvents(this);
		setupMouseEvents(this, this.canvas);
	}

	public start(): void {
		this.state = this.emit('start', this.state, {});

		start((time) => {
			this.state = this.emit('tick', this.state, { time });
		});
	}
}
