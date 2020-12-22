export declare class Loop {
    private isRunning;
    private update;
    private rafHandle;
    constructor(update: Loop['update']);
    start(): void;
    stop(): void;
    tick(): Promise<void>;
    private scheduleNextTick;
}
