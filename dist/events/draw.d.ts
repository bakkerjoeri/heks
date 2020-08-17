import type { Game } from './../Game';
export interface DrawEvents {
    beforeDraw: BeforeDrawEvent;
    draw: DrawEvent;
    afterDraw: AfterDrawEvent;
}
export interface BeforeDrawEvent {
    time: number;
    context: CanvasRenderingContext2D;
}
export interface DrawEvent {
    time: number;
    context: CanvasRenderingContext2D;
}
export interface AfterDrawEvent {
    time: number;
    context: CanvasRenderingContext2D;
}
export declare function setupDrawEvents(game: Game): void;
