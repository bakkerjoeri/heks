interface Options {
	requestAnimationFrame: (callback: FrameRequestCallback) => number;
	cancelAnimationFrame: (handle: number) => void;
}

export class GameLoopRunner {
	public steps = 0;
	public time = 0;
	public previousTime = 0;

	private rafHandle: number | undefined;
	private readonly gameLoop: (time: number, elapsed: number) => void;
	private readonly requestAnimationFrame: (
		callback: FrameRequestCallback
	) => number;
	private readonly cancelAnimationFrame: (handle: number) => void;

	constructor(
		gameLoop: GameLoopRunner["gameLoop"],
		{
			requestAnimationFrame = window.requestAnimationFrame,
			cancelAnimationFrame = window.cancelAnimationFrame,
		}: Partial<Options> = {}
	) {
		this.gameLoop = gameLoop;
		this.requestAnimationFrame = requestAnimationFrame;
		this.cancelAnimationFrame = cancelAnimationFrame;
	}

	public get fps(): number {
		return calculateFramesPerSecond(this.time, this.previousTime);
	}

	public get isRunning(): boolean {
		return this.rafHandle !== undefined;
	}

	public async start(): Promise<void> {
		if (this.isRunning) {
			return;
		}

		this.loopTick();
	}

	public stop(): void {
		if (this.rafHandle !== undefined) {
			this.cancelAnimationFrame(this.rafHandle);
			delete this.rafHandle;
		}
	}

	public tick(): Promise<void> {
		return new Promise((resolve) => {
			this.rafHandle = this.requestAnimationFrame((time) => {
				this.steps += 1;
				this.previousTime = this.time;
				this.time = time;
				const elapsed = this.time - this.previousTime;
				this.gameLoop(time, elapsed);
				resolve();
			});
		});
	}

	private async loopTick() {
		await this.tick();
		this.loopTick();
	}
}

/**
 * @param currentTime time at which current frame occurs in milliseconds
 * @param previousTime time at which previous frame occurred in milliseconds
 * @returns amount of frames per second
 */
export function calculateFramesPerSecond(
	currentTime: number,
	previousTime: number
) {
	if (currentTime === previousTime) {
		return 0;
	}

	return 1 / ((currentTime - previousTime) / 1000);
}
