import { multiplyByComponents } from "dotspace";
import { Position, Size } from "./types";
import { getImage } from "./assets";

export interface SpriteFrame {
	origin: Position;
	size: Size;
}

export class Sprite {
	private looping = true;
	private isPlaying = true;
	private framesPerSecond: number;
	private currentFrameIndex = 0;
	private image: HTMLImageElement;
	private frames: SpriteFrame[] = [];
	private offset: Size = [0, 0];
	private startOfAnimation: number | undefined;

	constructor(
		path: string,
		frameSize: Size,
		startingFrame = 0,
		amountOfFrames = 1,
		framesPerSecond = 1,
		looping = true
	) {
		this.image = getImage(path);
		this.framesPerSecond = framesPerSecond;
		this.looping = looping;

		for (
			let f = startingFrame;
			f < startingFrame + amountOfFrames;
			f += 1
		) {
			this.frames.push({
				origin: multiplyByComponents(frameSize, [f, 0]) as Position,
				size: frameSize,
			});
		}
	}

	public update(time: number) {
		if (
			this.framesPerSecond === 0 ||
			this.frames.length <= 1 ||
			!this.isPlaying
		) {
			return;
		}

		if (this.startOfAnimation === undefined) {
			this.startOfAnimation = time;
		}

		const elapsed = time - this.startOfAnimation;
		this.currentFrameIndex = calculateNewFrameIndex(
			this.frames.length,
			this.framesPerSecond,
			elapsed,
			this.looping
		);
	}

	public draw(context: CanvasRenderingContext2D, position: Position) {
		if (!this.frames[this.currentFrameIndex]) {
			throw new Error(
				`Sprite does not have frame with index ${this.currentFrameIndex}`
			);
		}

		const frame = this.frames[this.currentFrameIndex];

		context.drawImage(
			this.image,
			Math.round(frame.origin[0]),
			Math.round(frame.origin[1]),
			Math.round(frame.size[0]),
			Math.round(frame.size[1]),
			Math.round(position[0] + this.offset[0]),
			Math.round(position[1] + this.offset[1]),
			Math.round(frame.size[0]),
			Math.round(frame.size[1])
		);
	}
}

export function calculateNewFrameIndex(
	amountOfFrames: number,
	framesPerSecond: number,
	elapsedTime: number,
	isLooping: boolean
): number {
	if (isLooping) {
		return (
			Math.round(elapsedTime / (1000 / framesPerSecond)) % amountOfFrames
		);
	}

	return Math.min(
		Math.round(elapsedTime / (1000 / framesPerSecond)),
		amountOfFrames - 1
	);
}
