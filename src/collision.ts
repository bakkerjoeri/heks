type Point = [x: number, y: number];
type Rectangle = [[left: number, top: number], [right: number, bottom: number]];

export function isPointInPoint(
	[aLeft, aTop]: Point,
	[bLeft, bTop]: Point
): boolean {
	return aLeft === bLeft && aTop === bTop;
}

export function isPointInRectangle(
	[pointLeft, pointTop]: Point,
	[
		[rectangleLeft, rectangleTop],
		[rectangleRight, rectangleBottom],
	]: Rectangle
): boolean {
	return (
		pointLeft >= rectangleLeft &&
		pointTop >= rectangleTop &&
		pointLeft < rectangleRight &&
		pointTop < rectangleBottom
	);
}

export function isRectangleInRectangle(
	[[aLeft, aTop], [aRight, aBottom]]: Rectangle,
	[[bLeft, bTop], [bRight, bBottom]]: Rectangle
): boolean {
	return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}

// export function isRayInRectangle(ray: any, rectangle: Rectangle): boolean {}
