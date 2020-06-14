import { Size, GameState, GameEvents } from './types';
import { start } from './tick.js';
import { setupGame } from './setupGame.js';
import EventEmitter from './EventEmitter.js';

interface GameOptions<State> {
	initialState?: State;
	scale?: number;
	containerSelector?: string;
}

export const defaultState: GameState = {
	entities: {},
	sprites: {},
};

export default class Game<
	State extends GameState = GameState,
	Events extends GameEvents = GameEvents
> {
	public readonly canvas: HTMLCanvasElement;
	public readonly context: CanvasRenderingContext2D;

	private state: State;
	private readonly eventEmitter: EventEmitter<Events>;

	constructor(
		size: Size,
		eventEmitter: EventEmitter<Events>,
		{
			initialState = defaultState as State,
			containerSelector = 'body'
		}: GameOptions<State> = {}
	) {
		this.eventEmitter = eventEmitter;
		const { canvas, context } = setupGame(containerSelector, size);
		this.canvas = canvas;
		this.context = context;
		this.state = {...initialState};
	}

	public start(): void {
		this.state = this.eventEmitter.emit('start', this.state, {});

		start((time) => {
			this.state = this.eventEmitter.emit('beforeUpdate', this.state, { time });
			this.state = this.eventEmitter.emit('update', this.state, { time });
			this.state = this.eventEmitter.emit('afterUpdate', this.state, { time });
			this.state = this.eventEmitter.emit('beforeDraw', this.state, { time, context: this.context });
			this.state = this.eventEmitter.emit('draw', this.state, { time, context: this.context });
			this.state = this.eventEmitter.emit('afterDraw', this.state, { time, context: this.context });
		});
	}
}
