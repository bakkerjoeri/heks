import type { Game } from './../Game';

export interface LifecycleEvents {
    start: StartEvent;
    beforeUpdate: BeforeUpdateEvent;
    update: UpdateEvent;
    afterUpdate: AfterUpdateEvent;
}

export type StartEvent = {}
export interface BeforeUpdateEvent { time: number }
export interface UpdateEvent { time: number }
export interface AfterUpdateEvent { time: number }

export function setupLifecycleEvents(game: Game): void {
	game.on('tick', (state, { time }, { emit }) => {
        state = emit('beforeUpdate', state, { time });
        state = emit('update', state, { time });
        state = emit('afterUpdate', state, { time });

        return state;
    });
}
