import { createApp, ref } from 'vue';
import Debugger from './Debugger.vue';
import type { Game, GameEvents } from '../Game.js';

export function setupDebugger<
	State,
	Events extends GameEvents,
>(game: Game<State, Events>): void {
	const heksData = ref({
		state: { ...game.state },
		time: 0,
		isRunning: game.loop.isRunning,
	});

	const debuggerApp = createApp(Debugger, {
		isRunning: heksData.value.isRunning,
	});
	debuggerApp.provide('heksData', heksData);
	debuggerApp.config.globalProperties.$canvas = game.canvas;
	debuggerApp.config.globalProperties.$startGame = () => {
		game.loop.start();
		heksData.value.isRunning = game.loop.isRunning;
	}

	debuggerApp.config.globalProperties.$stopGame = () => {
		game.loop.stop();
		heksData.value.isRunning = game.loop.isRunning;
	}

	debuggerApp.config.globalProperties.$tickGame = () => {
		game.loop.tick();
		heksData.value.isRunning = game.loop.isRunning;
	}

	debuggerApp.config.globalProperties.$updateState = (state: State, time: number) => {
		game.state = state;
		game.loop.time = time;
		heksData.value.state = { ...state as any };
		heksData.value.time = time;

		if (!game.loop.isRunning) {
			game.eventEmitter.emit('beforeDraw', state, { time: game.loop.time, canvas: game.canvas, context: game.context })
			game.eventEmitter.emit('draw', state, { time: game.loop.time, canvas: game.canvas, context: game.context})
			game.eventEmitter.emit('afterDraw', state, { time: game.loop.time, canvas: game.canvas, context: game.context })
		}
	}

	const debuggerContainer = document.createElement('div');
	game.canvas.parentElement?.appendChild(debuggerContainer);
	debuggerApp.mount(debuggerContainer);

	game.eventEmitter.on('tick', (state, { time }) => {
		heksData.value.state = { ...state as any };
		heksData.value.time = time;
		heksData.value.isRunning = game.loop.isRunning;

		return state;
	});
}
