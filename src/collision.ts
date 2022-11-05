type Point = [x: number, y: number];
type Rectangle = [[left: number, top: number], [right: number, bottom: number]];

export function isPointInPoint(a: Point, b: Point): boolean {
	return a[0] === b[0] && a[1] === b[1];
}

/*
 * Figuring out rectangles in my head gives me a head ache, so it's comment time.
 * When given rectangle r = [[left, top], [right, bottom]], this is how you find each corner:
 *
 * top 		=> r[0][1]
 * right 	=> r[1][0]
 * bottom 	=> r[1][1]
 * left 	=> r[0][0]
 */

export function isPointInRectangle(
	point: Point,
	rectangle: Rectangle
): boolean {
	return (
		point[0] >= rectangle[0][0] &&
		point[1] >= rectangle[0][1] &&
		point[0] <= rectangle[1][0] &&
		point[1] <= rectangle[1][1]
	);
}

export function isRectangleInRectangle(a: Rectangle, b: Rectangle): boolean {
	return (
		a[0][0] < b[1][0] &&
		a[1][0] > b[0][0] &&
		a[0][1] < b[1][1] &&
		a[1][1] > b[0][1]
	);
}
