export declare class Loop {
    isRunning: boolean;
    time: number;
    previousTime: number;
    fps: number;
    private update;
    private rafHandle;
    constructor(update: Loop['update']);
    start(): void;
    stop(): void;
    tick(): Promise<void>;
    private scheduleNextTick;
}
