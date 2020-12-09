import type { Game } from './../Game';
export interface LifecycleEvents {
    start: StartEvent;
    beforeUpdate: BeforeUpdateEvent;
    update: UpdateEvent;
    afterUpdate: AfterUpdateEvent;
}
export declare type StartEvent = {};
export interface BeforeUpdateEvent {
    time: number;
}
export interface UpdateEvent {
    time: number;
}
export interface AfterUpdateEvent {
    time: number;
}
export declare function setupLifecycleEvents(game: Game): void;
