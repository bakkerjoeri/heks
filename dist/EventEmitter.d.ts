export interface EventHandler<Event, Events, State> {
    (state: State, event: Event, context: EventHandlerContext<Events, State>): State;
}
export interface EventHandlerContext<Events, State> {
    on: EventEmitter<Events, State>['on'];
    emit: EventEmitter<Events, State>['emit'];
    removeEventHandler: EventEmitter<Events, State>['removeEventHandler'];
    removeAllEventHandlers: EventEmitter<Events, State>['removeAllEventHandlers'];
}
export declare class EventEmitter<Events, State> {
    private eventHandlers;
    constructor();
    on<EventType extends keyof Events>(eventType: EventType, handler: EventHandler<Events[EventType], Events, State>): void;
    emit<EventType extends keyof Events>(eventType: EventType, currentState: State, event: Events[EventType]): State;
    removeEventHandler<EventType extends keyof Events>(eventType: EventType, handler: EventHandler<Events[EventType], Events, State>): void;
    removeAllEventHandlers<EventType extends keyof Events>(eventType: EventType): void;
}
