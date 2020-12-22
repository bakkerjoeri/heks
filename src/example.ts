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

const state: State = {
	...defaultState,
	player: { position: [180, 60]},
	mouse: { position: [0, 0]},
};

const game = new Game<State>([320, 180], {
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
				Math.min(320, Math.max(0, state.player.position[0] + Math.round(1 - (Math.random() * 2)))),
				Math.min(180, Math.max(0, state.player.position[1] + Math.round(1 - (Math.random() * 2)))),
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

setupDebugger(game, '.Debugger');

game.start();
