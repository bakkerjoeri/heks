const audioCache: {
	[path: string]: HTMLAudioElement;
} = {};

const imageCache: {
	[path: string]: HTMLImageElement;
} = {};

export async function loadAssets(assets: Array<{
	type: 'audio' | 'image';
	url: string;
}>): Promise<void> {
	await Promise.all<HTMLAudioElement | HTMLImageElement>(assets.map(assetDefinition => {
		if (assetDefinition.type === 'audio') {
			return loadAudio(assetDefinition.url);
		}

		if (assetDefinition.type === 'image') {
			return loadImage(assetDefinition.url);
		}

		throw new Error(`Unsupported asset type ${assetDefinition.type}.`);
	}));
}

export function getImage(url: string, fromCache = true): HTMLImageElement {
	if (fromCache && imageCache[url]) {
		return imageCache[url];
	}

	const image = new Image();
	image.src = url;
	imageCache[url] = image;

	return image;
}

export async function loadImage(url: string, fromCache = true): Promise<HTMLImageElement> {
	const image = getImage(url, fromCache);

	return new Promise((resolve, reject) => {
		if (image.complete) {
			return resolve(image);
		}

		image.onload = () => {
			resolve(image);
			image.onload = null;
			image.onerror = null;
		}

		image.onerror = (error) => {
			reject(error);
			image.onload = null;
			image.onerror = null;
		}
	})
}

export function getAudio(url: string, fromCache = true): HTMLAudioElement {
	if (fromCache && audioCache[url]) {
		return audioCache[url];
	}

	const audio = new Audio();
	audio.src = url;
	audioCache[url] = audio;

	return audio;
}

export async function loadAudio(url: string, fromCache = true): Promise<HTMLAudioElement> {
	const audio = getAudio(url, fromCache);

	return new Promise((resolve, reject) => {
		if (audio.readyState === 4) {
			return resolve(audio);
		}

		audio.onload = () => {
			resolve(audio)
			audio.onload = null;
			audio.onerror = null;
		};

		audio.onerror = (error) => {
			reject(error);
			audio.onload = null;
			audio.onerror = null;
		}
	});
}
