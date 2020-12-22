import { clearCanvas, setupCanvas } from './canvas.js';
import { EventEmitter } from './EventEmitter.js';
import { Loop } from './Loop.js';
import { setupUpdateAndDrawEvents } from './events/updateAndDraw.js';
import { setupKeyboardEvents } from './events/keyboard.js';
import { setupMouseEvents } from './events/mouse.js';

import type { EntityState } from './entities.js';
import type { SpriteState } from './sprites.js';
import type { UpdateEvents, DrawEvents } from './events/updateAndDraw.js';
import type { KeyboardEvents } from './events/keyboard.js';
import type { MouseEvents } from './events/mouse.js';

interface GameOptions<State> {
	backgroundColor?: string;
	containerSelector?: string;
	initialState?: State;
	showSystemCursor?: boolean;
}

export interface TickEvent { time: number }

export interface LifeCycleEvents {
	start: Record<string, never>;
	tick: TickEvent;
}

export interface GameState extends EntityState, SpriteState {}
export interface GameEvents extends LifeCycleEvents, UpdateEvents, DrawEvents, KeyboardEvents, MouseEvents {}

export const defaultState: GameState = {
	entities: {},
	sprites: {},
};

export class Game<
	State extends GameState = GameState,
	Events extends GameEvents = GameEvents
> {
	private state: State;

	public readonly canvas: HTMLCanvasElement;
	public readonly context: CanvasRenderingContext2D;
	public readonly eventEmitter: EventEmitter<Events, State>;
	public readonly loop: Loop;

	constructor(
		size: [width: number, height: number],
		{
			backgroundColor,
			containerSelector = 'body',
			initialState = defaultState as State,
			showSystemCursor,
		}: GameOptions<State> = {}
	) {
		const { canvas, context } = setupCanvas(containerSelector, size, showSystemCursor);
		this.canvas = canvas;
		this.context = context;
		this.state = {...initialState};
		this.eventEmitter = new EventEmitter<Events, State>();
		this.loop = new Loop(this.loopCallback.bind(this));

		setupUpdateAndDrawEvents(this.eventEmitter, this.canvas, this.context);
		setupKeyboardEvents(this.eventEmitter);
		setupMouseEvents(this.eventEmitter, this.canvas);

		this.eventEmitter.on('beforeDraw', (state, { canvas, context }) => {
			clearCanvas(canvas, context, backgroundColor);
			return state;
		});
	}

	public start(): void {
		this.state = this.eventEmitter.emit('start', this.state, {});
		this.loop.start();
	}

	private loopCallback(time: number) {
		this.state = this.eventEmitter.emit('tick', this.state, { time });
	}
}
