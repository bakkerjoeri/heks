import { Entity } from './entities.js';
import { Sprite } from './sprites.js';
export interface Size {
    width: number;
    height: number;
}
export interface Position {
    x: number;
    y: number;
}
export interface GameState {
    entities: {
        [entityId: string]: Entity;
    };
    sprites: {
        [spriteName: string]: Sprite;
    };
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
