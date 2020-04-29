import arrayWithout from '@bakkerjoeri/array-without';
import objectWithout from '@bakkerjoeri/object-without';

export interface EventHandlerContext<Events> {
    on: EventEmitter<Events>['on'];
    emit: EventEmitter<Events>['emit'];
    remove: EventEmitter<Events>['remove'];
    removeAll: EventEmitter<Events>['on'];
}

export interface EventHandler<State, Event, Events> {
    (state: State, event: Event, context: EventHandlerContext<Events>): State;
}

export default class EventEmitter<Events> {
	private eventHandlers: any = {};

    public on<EventType extends keyof Events, State>(
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

	public remove<EventType extends keyof Events, State>(
		eventType: EventType,
		handler: EventHandler<State, Events[EventType], Events>
	): void {
		this.eventHandlers = {
			...this.eventHandlers,
			[eventType]: arrayWithout(this.eventHandlers[eventType], handler),
		};
	}

	public removeAll<EventType extends keyof Events>(eventType: EventType): void {
		this.eventHandlers = objectWithout(this.eventHandlers, eventType);
	}

    public emit<EventType extends keyof Events, State>(
		eventType: EventType,
		initialState: State,
        event: Events[EventType],
    ): State {
        if (!this.eventHandlers.hasOwnProperty(eventType)) {
            return initialState;
        }

		const handlers = this.eventHandlers[eventType] as EventHandler<State, Events[EventType], Events>[];

		return handlers.reduce((newState: State, currentHandler) => {
			return currentHandler(newState, event, {
                on: this.on,
                emit: this.emit,
                remove: this.remove,
                removeAll: this.removeAll,
            });
		}, initialState);
	}
}
