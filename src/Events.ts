import arrayWithout from '@bakkerjoeri/array-without';
import objectWithout from '@bakkerjoeri/object-without';

export type EventMap = any;

export interface EventHandler<Event, Events, State> {
	(state: State, event: Event, context: EventHandlerContext<Events, State>): State;
}

export interface EventHandlerContext<Events, State> {
	on: EventEmitter<Events, State>['on'];
	emit: EventEmitter<Events, State>['emit'];
	removeEventHandler: EventEmitter<Events, State>['removeEventHandler'];
	removeAllEventHandlers: EventEmitter<Events, State>['removeAllEventHandlers'];
}

export class EventEmitter<Events, State> {
	private eventHandlers: any = {};

	public constructor() {
		this.on = this.on.bind(this);
		this.emit = this.emit.bind(this);
		this.removeEventHandler = this.removeEventHandler.bind(this);
		this.removeAllEventHandlers = this.removeAllEventHandlers.bind(this);
	}

	public registerEvents(eventMap: EventMap): void {
		Object.entries(eventMap).forEach(([eventType, handlerOrHandlers]) => {
			if (Array.isArray(handlerOrHandlers)) {
				handlerOrHandlers.forEach(handler => this.on(eventType as keyof Events, handler));
			} else {
				this.on(
					eventType as keyof Events,
					handlerOrHandlers as EventHandler<Events[keyof Events], Events, State>
				);
			}
		});
	}

	public on<EventType extends keyof Events>(
		eventType: EventType,
		handler: EventHandler<Events[EventType], Events, State>
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

		const handlers = this.eventHandlers[eventType] as EventHandler<Events[EventType], Events, State>[];

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
		handler: EventHandler<Events[EventType], Events, State>
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
