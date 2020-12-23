import { EventHandler } from './EventEmitter';
import { MouseMoveEvent } from './events/mouse';
import { UpdateEvent, DrawEvent } from './events/updateAndDraw';
import { defaultState, Game, GameEvents, GameState } from './Game';
import { setupDebugger } from './debugger/setupDebugger.js';

interface State extends GameState {
	player: { position: [x: number, y: number] };
	mouse: { position: [x: number, y: number] };
}

type MyHandler<Event> = EventHandler<Event, GameEvents, State>;

const size = [32, 18] as [number, number];

const state: State = {
	...defaultState,
	player: { position: [Math.round(size[0] / 2), Math.round(size[1] / 2)]},
	mouse: { position: [0, 0]},
};

const game = new Game<State>(size, {
	containerSelector: '.Game',
	initialState: state,
	showSystemCursor: false,
});

const updateMousePosition: MyHandler<MouseMoveEvent> = (state, { position }) => {
	return {
		...state,
		mouse: {
			...state.mouse,
			position,
		},
	};
}

const movePlayer: MyHandler<UpdateEvent> = (state) => {
	return {
		...state,
		player: {
			...state.player,
			position: [
				Math.min(size[0] - 1, Math.max(0, state.player.position[0] + Math.round(1 - (Math.random() * 2)))),
				Math.min(size[1] - 1, Math.max(0, state.player.position[1] + Math.round(1 - (Math.random() * 2)))),
			],
		},
	};
}

const drawPlayer: MyHandler<DrawEvent> = (state, { context }) => {
	context.fillStyle = 'red';
	context.fillRect(state.player.position[0], state.player.position[1], 1, 1);

	return state;
}

const drawCursor: MyHandler<DrawEvent> = (state, { context }) => {
	context.fillStyle = 'green';
	context.fillRect(state.mouse.position[0], state.mouse.position[1], 1, 1);

	return state;
}

game.eventEmitter.on('update', movePlayer);
game.eventEmitter.on('mouseMove', updateMousePosition);
game.eventEmitter.on('draw', drawPlayer);
game.eventEmitter.on('draw', drawCursor);

setupDebugger(game);

game.start();
