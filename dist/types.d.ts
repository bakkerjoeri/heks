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
