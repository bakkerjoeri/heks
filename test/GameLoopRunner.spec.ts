import { jest } from "@jest/globals";
import {
	GameLoopRunner,
	calculateFramesPerSecond,
} from "../src/GameLoopRunner";

describe("Loop", () => {
	describe("fps", () => {
		test("is a number", () => {
			const loop = new GameLoopRunner(() => {});
			expect(typeof loop.fps).toBe("number");
			expect(loop.fps).not.toBeNaN();
		});
		test("returns 0 when loop is not running", async () => {
			const loop = new GameLoopRunner(() => {});
			expect(loop.fps).toBe(0);

			await loop.start();
			loop.stop();
			expect(loop.fps).toBe(0);
		});
	});
	describe("start", () => {
		test("causes isRunning to become true", () => {
			const loop = new GameLoopRunner(() => {});
			loop.start();
			expect(loop.isRunning).toBe(true);
		});
		test("calls tick", () => {
			const loop = new GameLoopRunner(() => {});
			const mockedTick = jest.spyOn(loop, "tick");
			loop.start();
			expect(mockedTick).toBeCalled();
			expect(mockedTick).toBeCalledTimes(1);
		});
		test("doesn't start multiple loops when called multiple times", () => {
			const loop = new GameLoopRunner(() => {});
			const mockedTick = jest.spyOn(loop, "tick");
			loop.start();
			expect(mockedTick).toBeCalledTimes(1);
			loop.start();
			loop.start();
			expect(mockedTick).toBeCalledTimes(1);
		});
	});
	describe("stop", () => {
		test("causes isRunning to become false", () => {
			const loop = new GameLoopRunner(() => {});
			loop.start();
			loop.stop();
			expect(loop.isRunning).toBe(false);
		});
		test("stops the next tick from being called", async () => {
			const loop = new GameLoopRunner(() => {});
			const mockedTick = jest.spyOn(loop, "tick");
			loop.start();
			expect(mockedTick).toBeCalledTimes(1);
			loop.stop();
			await new Promise((r) => setTimeout(r, 100));
			expect(mockedTick).toBeCalledTimes(1);
		});
	});
	describe("tick", () => {
		test("calls update", async () => {
			const update = jest.fn();
			const loop = new GameLoopRunner(update);
			await loop.tick();
			expect(update).toBeCalledTimes(1);
		});
		test("increases steps by 1", async () => {
			const loop = new GameLoopRunner(() => {});
			const currentSteps = loop.steps;
			await loop.tick();
			expect(loop.steps).toBe(currentSteps + 1);
		});
	});
});

describe("calculateFramesPerSecond", () => {
	test("fps is calculated correctly", () => {
		expect(calculateFramesPerSecond(1000 / 60, 0)).toBe(60);
		expect(calculateFramesPerSecond(1000 / 30, 0)).toBe(30);
	});

	test("fps is 0 when current and previous timestamp are the same", () => {
		expect(calculateFramesPerSecond(3133, 3133)).toBe(0);
	});
});
