export declare type gameLoop = (time?: DOMHighResTimeStamp) => any;
export declare function start(callback: gameLoop): void;
export declare function scheduleNextTick(callback: gameLoop): void;
export declare function tick(callback: gameLoop, time: number): void;
