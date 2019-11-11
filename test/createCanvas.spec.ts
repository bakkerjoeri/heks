import { JSDOM } from 'jsdom';
import { createCanvas } from './../src/createCanvas';

describe('createCanvas', () => {
    test('returns a canvas', () => {
        const { window } = new JSDOM();
        const canvas = createCanvas(window.document, { width: 100, height: 100 }, 1);

        expect(canvas).toBeInstanceOf(window.HTMLCanvasElement);
    });

    test('scales the canvas properly', () => {
        const { window } = new JSDOM();
        const canvasScale1 = createCanvas(window.document, { width: 100, height: 100 }, 1);
        expect(canvasScale1.width).toBe(100);
        expect(canvasScale1.height).toBe(100);
        expect(window.getComputedStyle(canvasScale1).width).toBe('100px');
        expect(window.getComputedStyle(canvasScale1).height).toBe('100px');

        const canvasScale3 = createCanvas(window.document, { width: 100, height: 100 }, 3);
        expect(canvasScale3.width).toBe(100);
        expect(canvasScale3.height).toBe(100);
        expect(window.getComputedStyle(canvasScale3).width).toBe('300px');
        expect(window.getComputedStyle(canvasScale3).height).toBe('300px');
    });
});
