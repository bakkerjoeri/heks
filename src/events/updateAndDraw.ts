import type { EventEmitter } from '../EventEmitter.js';
import type { LifeCycleEvents } from '../Game.js';

export interface UpdateEvents {
	beforeUpdate: BeforeUpdateEvent;
	update: UpdateEvent;
	afterUpdate: AfterUpdateEvent;
}

export interface BeforeUpdateEvent { time: number }
export interface UpdateEvent { time: number }
export interface AfterUpdateEvent { time: number }

export interface DrawEvents {
	beforeDraw: BeforeDrawEvent;
	draw: DrawEvent;
	afterDraw: AfterDrawEvent;
}

export interface BeforeDrawEvent { time: number; context: CanvasRenderingContext2D, canvas: HTMLCanvasElement }
export interface DrawEvent { time: number; context: CanvasRenderingContext2D, canvas: HTMLCanvasElement }
export interface AfterDrawEvent { time: number; context: CanvasRenderingContext2D, canvas: HTMLCanvasElement }

export function setupUpdateAndDrawEvents<
	Events extends LifeCycleEvents & UpdateEvents & DrawEvents,
	State
>(
	eventEmitter: EventEmitter<Events, State>,
	canvas: HTMLCanvasElement,
	context: CanvasRenderingContext2D,
): void {
	eventEmitter.on('tick', (state, { time }, { emit }) => {
		state = emit('beforeUpdate', state, { time });
		state = emit('update', state, { time });
		state = emit('afterUpdate', state, { time });

		state = emit('beforeDraw', state, { time, context, canvas });
		state = emit('draw', state, { time, context, canvas });
		state = emit('afterDraw', state, { time, context, canvas });

		return state;
	});
}
