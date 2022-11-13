import { calculateNewFrameIndex } from "../src/Sprite";

describe("calculateNewFrameIndex", () => {
	test("frame hasn't changed if no time has elapsed", () => {
		expect(calculateNewFrameIndex(10, 60, 0, false)).toBe(0);
	});

	test("frame hasn't changed if fps is 0, regardless of elapsed time", () => {
		expect(calculateNewFrameIndex(10, 0, 0, false)).toBe(0);
		expect(calculateNewFrameIndex(10, 0, 10, false)).toBe(0);
		expect(calculateNewFrameIndex(10, 0, 100, false)).toBe(0);
		expect(calculateNewFrameIndex(10, 0, 1000, false)).toBe(0);
		expect(calculateNewFrameIndex(10, 0, 10000, false)).toBe(0);
	});

	test("returns the appropriate frame", () => {
		expect(calculateNewFrameIndex(6, 1, 1000, false)).toBe(1);
		expect(calculateNewFrameIndex(6, 1, 2000, false)).toBe(2);
		expect(calculateNewFrameIndex(6, 1, 3000, false)).toBe(3);
		expect(calculateNewFrameIndex(6, 1, 4000, false)).toBe(4);
		expect(calculateNewFrameIndex(6, 6, 1000, false)).toBe(5);
	});

	test("loops to first frame", () => {
		expect(calculateNewFrameIndex(6, 6, 1001, true)).toBe(0);
	});
});
