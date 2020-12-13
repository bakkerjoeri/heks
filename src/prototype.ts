import arrayWithout from '@bakkerjoeri/array-without';
import objectWithout from '@bakkerjoeri/object-without';

/**
 * Game
 */
export interface GameLoop<State>{
	(state: State, time: number): State;
}

export class Game<State> {
	private isRunning = false;
	private loop: GameLoop<State>;
	private rafHandle: number | undefined;
	private state: State;

	constructor(
		initialState: State = {} as State,
		loop: GameLoop<State> = (state: State): State => state
	) {
		this.state = initialState;
		this.loop = loop;
	}

	public start(): void {
		this.isRunning = true;
		this.scheduleNextTick();
	}

	public stop(): void {
		this.isRunning = false;

		if (this.rafHandle) {
			window.cancelAnimationFrame(this.rafHandle);
		}
	}

	public async tick(): Promise<void> {
		return new Promise(resolve => {
			this.rafHandle = window.requestAnimationFrame((time) => {
				this.state = this.loop(this.state, time);
				resolve();
			});
		})
	}

	private scheduleNextTick(): void {
		this.rafHandle = window.requestAnimationFrame((time) => {
			this.tick(time);
		});
	}
}

/**
 * Loop
 */
export class Loop {
	private update: () => any;

	constructor(update: Loop['update']) {
		this.update = update;
	}


}

/**
 * Events
 */
export interface EventHandler<State, Event, Events> {
	(state: State, event: Event, context: EventHandlerContext<State, Events>): State;
}

export interface EventHandlerContext<State, Events> {
	on: EventEmitter<State, Events>['on'];
	emit: EventEmitter<State, Events>['emit'];
	removeEventHandler: EventEmitter<State, Events>['removeEventHandler'];
	removeAllEventHandlers: EventEmitter<State, Events>['removeAllEventHandlers'];
}

export class EventEmitter<State, Events> {
	private eventHandlers: any = {};

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

/**
 * test
 */
interface MyState {something: 'any'}
interface MyEvents {
	tick: { time: number };
}

const eventEmitter = new EventEmitter<MyState, MyEvents>();

const gameLoop: GameLoop<MyState> = (state, time): MyState => {
	return eventEmitter.emit('tick', state, { time });
};

const game = new Game<MyState>({something: 'any'}, gameLoop);

game.start();
