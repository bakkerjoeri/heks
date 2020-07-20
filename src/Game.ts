import { Size, GameState, GameEvents } from './types';
import { start } from './tick.js';
import { setupGame } from './setupGame.js';
import arrayWithout from '@bakkerjoeri/array-without';
import objectWithout from '@bakkerjoeri/object-without';

interface GameOptions<State> {
	initialState?: State;
	containerSelector?: string;
}

export interface EventHandlerContext<
    State extends GameState,
    Events extends GameEvents
> {
	on: Game<State, Events>['on'];
	emit: Game<State, Events>['emit'];
	removeEventHandler: Game<State, Events>['removeEventHandler'];
	removeAllEventHandlers: Game<State, Events>['removeAllEventHandlers'];
}

export interface EventHandler<
    State extends GameState,
    Event,
    Events extends GameEvents
> {
	(state: State, event: Event, context: EventHandlerContext<State, Events>): State;
}

export const defaultState: GameState = {
	entities: {},
	sprites: {},
};

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
			containerSelector = 'body'
		}: GameOptions<State> = {}
	) {
		const { canvas, context } = setupGame(containerSelector, size);
		this.canvas = canvas;
		this.context = context;
		this.state = {...initialState};
	}

	public start(): void {
		this.state = this.emit('start', this.state, {});

		start((time) => {
			this.state = this.emit('beforeUpdate', this.state, { time });
			this.state = this.emit('update', this.state, { time });
			this.state = this.emit('afterUpdate', this.state, { time });
			this.state = this.emit('beforeDraw', this.state, { time, context: this.context });
			this.state = this.emit('draw', this.state, { time, context: this.context });
			this.state = this.emit('afterDraw', this.state, { time, context: this.context });
		});
    }

    public on<EventType extends keyof Events>(
		eventType: EventType,
		handler: EventHandler<State, Events[EventType], Events>
	): void {
		this.eventHandlers = {
			...this.eventHandlers,
			[eventType]: [
				...this.eventHandlers[eventType] || [],
				handler,
			]
		}
	}

    public emit<EventType extends keyof Events>(
		eventType: EventType,
		currentState: State,
		event: Events[EventType],
	): State {
		if (!this.eventHandlers.hasOwnProperty(eventType)) {
			return currentState;
		}

		const handlers = this.eventHandlers[eventType] as EventHandler<State, Events[EventType], Events>[];

		return handlers.reduce((newState: State, currentHandler) => {
			return currentHandler(newState, event, {
				on: this.on,
				emit: this.emit,
				removeEventHandler: this.removeEventHandler,
				removeAllEventHandlers: this.removeAllEventHandlers,
			});
		}, currentState);
    }

    public removeEventHandler<EventType extends keyof Events>(
		eventType: EventType,
		handler: EventHandler<State, Events[EventType], Events>
	): void {
		this.eventHandlers = {
			...this.eventHandlers,
			[eventType]: arrayWithout(this.eventHandlers[eventType], handler),
		};
	}

	public removeAllEventHandlers<EventType extends keyof Events>(eventType: EventType): void {
		this.eventHandlers = objectWithout(this.eventHandlers, eventType);
	}
}
