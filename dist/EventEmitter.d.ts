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
    private eventHandlers;
    constructor();
    on<EventType extends keyof Events, State>(eventType: EventType, handler: EventHandler<State, Events[EventType], Events>): void;
    remove<EventType extends keyof Events, State>(eventType: EventType, handler: EventHandler<State, Events[EventType], Events>): void;
    removeAll<EventType extends keyof Events>(eventType: EventType): void;
    emit<EventType extends keyof Events, State>(eventType: EventType, initialState: State, event: Events[EventType]): State;
}
