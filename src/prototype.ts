import { EventHandler } from './EventEmitter';
import { MouseMoveEvent } from './events/mouse';
import { UpdateEvent, DrawEvent } from './events/updateAndDraw';
import { defaultState, Game, GameEvents, GameState } from './Game';

interface State extends GameState {
	player: { position: [x: number, y: number] };
	mouse: { position: [x: number, y: number] };
}

type MyHandler<Event> = EventHandler<Event, GameEvents, State>;

let state: State = {
	...defaultState,
	player: { position: [180, 60]},
	mouse: { position: [0, 0]},
};

const stateHistory: Array<
	{ time: number, state: State }
> = [];

const game = new Game<State>([320, 180], {
	containerSelector: '.Game',
	initialState: state,
	showSystemCursor: false,
});

const startButton = document.querySelector('[data-hook="startButton"]')!;
const pauseButton = document.querySelector('[data-hook="pauseButton"]')!;
const tickButton = document.querySelector('[data-hook="tickButton"]')!;
const stateHistorySlider = document.querySelector('[data-hook="stateHistorySlider"')! as HTMLInputElement;

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

game.eventEmitter.on('tick', (state, { time }) => {
	stateHistory.push({ time, state });
	stateHistorySlider.setAttribute('max', (stateHistory.length - 1).toString());
	stateHistorySlider.value = (stateHistory.length - 1).toString();

	return state;
});

game.eventEmitter.on('update', movePlayer);
game.eventEmitter.on('mouseMove', updateMousePosition);
game.eventEmitter.on('draw', drawPlayer);
game.eventEmitter.on('draw', drawCursor);

startButton.addEventListener('click', () => game.loop.start());
pauseButton.addEventListener('click', () => game.loop.stop());
tickButton.addEventListener('click', () => game.loop.tick());

stateHistorySlider.addEventListener('input', () => {
	const historyItem = stateHistory[parseInt(stateHistorySlider.value, 10)]
	state = historyItem.state;
	game.eventEmitter.emit('beforeDraw', state, { time: historyItem.time, context: game.context, canvas: game.canvas });
	game.eventEmitter.emit('draw', state, { time: historyItem.time, context: game.context, canvas: game.canvas });
});

game.start();
