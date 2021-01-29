export class Loop {
	public isRunning = false;
	public time = 0;

	private previousTime = 0;
	private readonly update: (time: number) => any;
	private rafHandle: number | undefined;

	constructor(update: Loop['update']) {
		this.update = update;
	}

	get fps(): number {
		if (this.time === this.previousTime) {
			return 0;
		}

		return 1 / ((this.time - this.previousTime) / 1000);
	}

	public start(): void {
		if (this.isRunning) {
			return;
		}

		this.isRunning = true;
		this.scheduleNextTick();
	}

	public stop(): void {
		if (this.rafHandle) {
			window.cancelAnimationFrame(this.rafHandle);
		}

		this.isRunning = false;
	}

	public tick(): Promise<void> {
		return new Promise(resolve => {
			this.rafHandle = window.requestAnimationFrame((time) => {
				this.previousTime = this.time;
				this.time = time;
				this.update(time);
				resolve();
			});
		});
	}

	private async scheduleNextTick(): Promise<void> {
		if (!this.isRunning) {
			return;
		}

		await this.tick();
		this.scheduleNextTick();
	}
}
