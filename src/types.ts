import { Entity } from './entities.js';
import { Sprite } from './sprites.js';

export interface GameState {
	entities: {
		[entityId: string]: Entity;
	};
	sprites: {
		[spriteName: string]: Sprite;
	};
}

