import Hex from './../../src/Hex.js';
import Keyboard from './../../src/Keyboard.js';
import getRandomNumberInRange from './../../src/utilities/getRandomNumberInRange.js';
import drawState from './../../src/utilities/drawState.js';

const debugScreen = document.querySelector('.debug');
const hex = new Hex({
    Keyboard,
});

function update() {
    hex.emitEvent('update');
    hex.emitEvent('endUpdate');
    hex.emitEvent('draw');

    window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);

hex.createRoom('world', true);

hex.createEntity({
    player: true,
    health: { current: 5, max: 10 },
    position: { x: 0, y: 0 },
});

hex.createEntity({
    enemy: true,
    health: { current: 3, max: 3 },
    position: {x: 5, y: 3},
});

hex.createEntity({
    creature: true,
    isDead: true,
});
hex.createEntity({
    creature: true,
});
hex.createEntity({
    creature: true,
});

console.log(hex.getEntities({
    creature: true,
    isDead: false,
}));

hex.addEventHandlerForEntities('update', (engine, entity) => {
    entity.position = {
        x: entity.position.x + getRandomNumberInRange(0, 2) - 1,
        y: entity.position.y + getRandomNumberInRange(0, 2) - 1
    };
}, {
    'enemy': true,
    'position': true,
});

hex.addEventHandlerForEntities('keyPressed', (engine, entity, key) => {
    if (key === 'arrowup') {
        entity.position = {
            x: entity.position.x,
            y: entity.position.y - 1,
        }
    }

    if (key === 'arrowright') {
        entity.position = {
            x: entity.position.x + 1,
            y: entity.position.y,
        }
    }

    if (key === 'arrowdown') {
        entity.position = {
            x: entity.position.x,
            y: entity.position.y + 1,
        }
    }

    if (key === 'arrowleft') {
        entity.position = {
            x: entity.position.x - 1,
            y: entity.position.y,
        }
    }
}, {
    'player': true,
    'position': true,
});

hex.addEventHandler('draw', () => {
    drawState(hex, debugScreen);
});
