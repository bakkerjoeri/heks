export class Loop {
	private update: (time: number) => any;
	private rafHandle: number | undefined;

	constructor(update: Loop['update']) {
		this.update = update;
	}

	public start(): void {
		this.scheduleNextTick();
	}

	public stop(): void {
		if (this.rafHandle) {
			window.cancelAnimationFrame(this.rafHandle);
		}
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
		await this.tick();
		this.scheduleNextTick();
	}
}
