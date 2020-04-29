import { start } from './tick.js';
import { setupGame } from './setupGame.js';
export const defaultState = {
    entities: {},
    sprites: {},
};
export default class Game {
    constructor(size, eventEmitter, { initialState = defaultState, scale = 1, containerSelector = 'body' } = {}) {
        this.eventEmitter = eventEmitter;
        const { canvas, context } = setupGame(containerSelector, size, scale);
        this.canvas = canvas;
        this.context = context;
        this.scale = scale;
        this.state = Object.assign({}, initialState);
    }
    start() {
        this.state = this.eventEmitter.emit('start', this.state, {});
        start((time) => {
            this.state = this.eventEmitter.emit('beforeUpdate', this.state, { time });
            this.state = this.eventEmitter.emit('update', this.state, { time });
            this.state = this.eventEmitter.emit('afterUpdate', this.state, { time });
            this.state = this.eventEmitter.emit('beforeDraw', this.state, { time, context: this.context, scale: this.scale });
            this.state = this.eventEmitter.emit('draw', this.state, { time, context: this.context, scale: this.scale });
            this.state = this.eventEmitter.emit('afterDraw', this.state, { time, context: this.context, scale: this.scale });
        });
    }
}
