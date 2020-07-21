import { Game } from '../../dist/index.js';
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
game.on('mousePressed', (state, { button }) => {
    console.log('pressed', button);
    return state;
});
game.on('mouseDown', (state, { button }) => {
    console.log('down', button);
    return state;
});
game.on('mouseUp', (state, { button }) => {
    console.log('up', button);
    return state;
});
