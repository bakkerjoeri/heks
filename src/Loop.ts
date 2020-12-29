export class Loop {
	public isRunning = false;
	public time = 0;
	public previousTime = 0;
	public fps = 0;

	private update: (time: number) => any;
	private rafHandle: number | undefined;

	constructor(update: Loop['update']) {
		this.update = update;
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
				this.time = time;

				if (this.time === this.previousTime) {
					this.fps = 0;
				} else {
					this.fps = 1 / ((this.time - this.previousTime) / 1000)
				}

				this.previousTime = time;
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
