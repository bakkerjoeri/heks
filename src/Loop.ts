export class Loop {
	public isRunning = false;
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

	public async tick(): Promise<void> {
		return new Promise(resolve => {
			this.rafHandle = window.requestAnimationFrame((time) => {
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
