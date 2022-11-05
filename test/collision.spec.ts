import {
	isPointInPoint,
	isPointInRectangle,
	isRectangleInRectangle,
} from "../src/collision";

describe("isPointInPoint", () => {
	test("returns true when the points have the same coordinates", () => {
		expect(isPointInPoint([1, 3], [1, 3])).toBe(true);
		expect(isPointInPoint([-1, -24], [-1, -24])).toBe(true);
	});

	test("returns false when the points don't match", () => {
		expect(isPointInPoint([23, 3], [0, 3])).toBe(false);
		expect(isPointInPoint([23, 3], [23, 2])).toBe(false);
		expect(isPointInPoint([23, 3], [-23, 3])).toBe(false);
	});
});

describe("isPointInRectangle", () => {
	test("returns true when the point is within the rectangle", () => {
		expect(
			isPointInRectangle(
				[13, 3],
				[
					[10, 1],
					[20, 5],
				]
			)
		).toBe(true);
		expect(
			isPointInRectangle(
				[2, 3],
				[
					[1, 1],
					[3, 3],
				]
			)
		).toBe(true);
	});

	test("returns false when the point is not within the rectangle", () => {
		expect(
			isPointInRectangle(
				[8, -1],
				[
					[10, 1],
					[20, 5],
				]
			)
		).toBe(false);
		expect(
			isPointInRectangle(
				[8, 3],
				[
					[10, 1],
					[20, 5],
				]
			)
		).toBe(false);
		expect(
			isPointInRectangle(
				[15, -3],
				[
					[10, 1],
					[20, 5],
				]
			)
		).toBe(false);
		expect(
			isPointInRectangle(
				[15, 6],
				[
					[10, 1],
					[20, 5],
				]
			)
		).toBe(false);
		expect(
			isPointInRectangle(
				[22, 3],
				[
					[10, 1],
					[20, 5],
				]
			)
		).toBe(false);
		expect(
			isPointInRectangle(
				[24, 6],
				[
					[10, 1],
					[20, 5],
				]
			)
		).toBe(false);
	});
});

describe("isRectangleInRectangle", () => {
	test("returns true when the rectangles overlap", () => {
		expect(
			isRectangleInRectangle(
				[
					[0, 0],
					[10, 10],
				],
				[
					[0, 0],
					[10, 10],
				]
			)
		).toBe(true);
		expect(
			isRectangleInRectangle(
				[
					[0, 0],
					[10, 10],
				],
				[
					[3, 6],
					[3, 6],
				]
			)
		).toBe(true);
		expect(
			isRectangleInRectangle(
				[
					[1, 3],
					[10, 8],
				],
				[
					[9, 7],
					[14, 18],
				]
			)
		).toBe(true);
	});

	test("returns false when the rectangles do not overlap", () => {
		expect(
			isRectangleInRectangle(
				[
					[-1, -3],
					[-10, -8],
				],
				[
					[9, 7],
					[14, 18],
				]
			)
		).toBe(false);
		expect(
			isRectangleInRectangle(
				[
					[0, 0],
					[10, 10],
				],
				[
					[12, 12],
					[13, 13],
				]
			)
		).toBe(false);
	});

	test("returns false when edges touch but do not overlap", () => {
		// Top edge of a is touching bottom edge of b
		expect(
			isRectangleInRectangle(
				[
					[1, 1],
					[3, 3],
				],
				[
					[1, 0],
					[3, 1],
				]
			)
		).toBe(false);

		// Right edge of a is touching left edge of b
		expect(
			isRectangleInRectangle(
				[
					[1, 1],
					[3, 3],
				],
				[
					[3, 1],
					[4, 3],
				]
			)
		).toBe(false);

		// Bottom edge of a is touching top edge of b
		expect(
			isRectangleInRectangle(
				[
					[1, 1],
					[3, 3],
				],
				[
					[1, 3],
					[3, 4],
				]
			)
		).toBe(false);

		// Bottom edge of a is touching top edge of b
		expect(
			isRectangleInRectangle(
				[
					[1, 1],
					[3, 3],
				],
				[
					[0, 1],
					[1, 3],
				]
			)
		).toBe(false);
	});
});
