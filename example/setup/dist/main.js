import { Game } from '../../../dist/index.js';
const game = new Game({
    width: 320,
    height: 180,
});
game.start();
game.on('draw', (state, { context }) => {
    context.clearRect(0, 0, 320, 180);
    context.fillRect(0, 0, 320, 180);
    return state;
});
