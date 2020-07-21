import { start } from './tick.js';
import { setupGame } from './setupGame.js';
import arrayWithout from '@bakkerjoeri/array-without';
import objectWithout from '@bakkerjoeri/object-without';
import { LifecycleEvents, setupLifecycleEvents } from './events/lifecycle';
import { DrawEvents, setupDrawEvents } from './events/draw';
import { KeyboardEvents, setupKeyboardEvents } from './events/keyboard.js';
import { MouseEvents, setupMouseEvents } from './events/mouse.js';
import type { Size, GameState } from './types';

interface GameOptions<State> {
	initialState?: State;
	containerSelector?: string;
}

export const defaultState: GameState = {
	entities: {},
	sprites: {},
};

export interface GameEvents extends LifecycleEvents, DrawEvents, KeyboardEvents, MouseEvents {
	tick: { time: number };
}

export interface EventHandler<
	State extends GameState,
	Event,
	Events extends GameEvents
> {
	(state: State, event: Event, context: EventHandlerContext<State, Events>): State;
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

		this.on = this.on.bind(this);
		this.emit = this.emit.bind(this);
		this.removeEventHandler = this.removeEventHandler.bind(this);
		this.removeAllEventHandlers = this.removeAllEventHandlers.bind(this);

		setupLifecycleEvents(this);
		setupDrawEvents(this);
		setupKeyboardEvents(this);
		setupMouseEvents(this);
	}

	public start(): void {
		this.state = this.emit('start', this.state, {});

		start((time) => {
			this.state = this.emit('tick', this.state, { time });
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
