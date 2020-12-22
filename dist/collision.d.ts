declare type Vector2D = [number, number];
declare type Rectangle = [Vector2D, Vector2D];
export declare function isPointInPoint(a: Vector2D, b: Vector2D): boolean;
export declare function isPointInRectangle(point: Vector2D, rectangle: Rectangle): boolean;
export declare function isRectangleInRectangle(a: Rectangle, b: Rectangle): boolean;
export {};
