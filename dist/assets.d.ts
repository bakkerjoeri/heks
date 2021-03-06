export declare function loadAssets(assets: Array<{
    type: 'audio' | 'image';
    url: string;
}>): Promise<void>;
export declare function getImage(url: string, fromCache?: boolean): HTMLImageElement;
export declare function loadImage(url: string, fromCache?: boolean): Promise<HTMLImageElement>;
export declare function getAudio(url: string, fromCache?: boolean): HTMLAudioElement;
export declare function loadAudio(url: string, fromCache?: boolean): Promise<HTMLAudioElement>;
