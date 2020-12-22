import { EventEmitter } from '../Events';

export interface UpdateEvents {
	tick: TickEvent;
	beforeUpdate: BeforeUpdateEvent;
	update: UpdateEvent;
	afterUpdate: AfterUpdateEvent;
}

export interface TickEvent { time: number }
export interface BeforeUpdateEvent { time: number }
export interface UpdateEvent { time: number }
export interface AfterUpdateEvent { time: number }

export interface DrawEvents {
	beforeDraw: BeforeDrawEvent;
	draw: DrawEvent;
	afterDraw: AfterDrawEvent;
}

export interface BeforeDrawEvent { time: number; context: CanvasRenderingContext2D }
export interface DrawEvent { time: number; context: CanvasRenderingContext2D }
export interface AfterDrawEvent { time: number; context: CanvasRenderingContext2D }

export function setupUpdateAndDrawEvents<
	Events extends UpdateEvents & DrawEvents,
	State
>(
	eventEmitter: EventEmitter<Events, State>,
	context: CanvasRenderingContext2D
): void {
	eventEmitter.on('tick', (state, { time }, { emit }) => {
		state = emit('beforeUpdate', state, { time });
		state = emit('update', state, { time });
		state = emit('afterUpdate', state, { time });

		state = emit('beforeDraw', state, { time, context });
		state = emit('draw', state, { time, context });
		state = emit('afterDraw', state, { time, context });

		return state;
	});
}
