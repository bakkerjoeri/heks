interface EventHandler<State, Event> {
    (state: State, event: Event): State;
}
export default class EventEmitter<Events> {
    private eventHandlers;
    on<EventType extends keyof Events, State>(eventType: EventType, handler: EventHandler<State, Events[EventType]>): void;
    remove<EventType extends keyof Events, State>(eventType: EventType, handler: EventHandler<State, Events[EventType]>): void;
    removeEventType<EventType extends keyof Events>(eventType: EventType): void;
    emit<EventType extends keyof Events, State>(eventType: EventType, initialState: State, event: Events[EventType]): State;
}
export {};
