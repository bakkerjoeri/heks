import arrayWithout from '@bakkerjoeri/array-without';
import objectWithout from '@bakkerjoeri/object-without';

export interface EventHandler<State, Event, Events> {
	(state: State, event: Event, context: EventHandlerContext<State, Events>): State;
}

export interface EventHandlerContext<State, Events> {
	on: EventEmitter<Events, State>['on'];
	emit: EventEmitter<Events, State>['emit'];
	removeEventHandler: EventEmitter<Events, State>['removeEventHandler'];
	removeAllEventHandlers: EventEmitter<Events, State>['removeAllEventHandlers'];
}

export class EventEmitter<Events, State> {
	private eventHandlers: any;

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
