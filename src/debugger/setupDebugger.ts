import { createApp, ref } from 'vue';
import Debugger from './Debugger.vue';
import type { Game, GameEvents, GameState } from '../Game.js';

export function setupDebugger<
	State extends GameState,
	Events extends GameEvents,
>(game: Game<State, Events>, containerSelector: string): void {
	const heksData = ref({
		state: { ...game.state },
		time: 0,
		isRunning: game.loop.isRunning,
	});

	const debuggerApp = createApp(Debugger);
	debuggerApp.provide('heksData', heksData);
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

	debuggerApp.mount(containerSelector);

	game.eventEmitter.on('tick', (state, { time }) => {
		heksData.value.state = { ...state as any };
		heksData.value.time = time;
		heksData.value.isRunning = game.loop.isRunning;

		return state;
	});
}
