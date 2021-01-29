export declare class Loop {
    isRunning: boolean;
    time: number;
    private previousTime;
    private readonly update;
    private rafHandle;
    constructor(update: Loop['update']);
    get fps(): number;
    start(): void;
    stop(): void;
    tick(): Promise<void>;
    private scheduleNextTick;
}
