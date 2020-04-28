# ☞ Heks Engine

A game development framework in TypeScript.

## Installation
```bash
npm install heks
```

## Usage

Start by creating a new game:

```ts
import { Game, GameEvents, EventEmitter } from 'heks';

const eventEmitter = new EventEmitter<GameEvents>();
const Game = new Game(
	{ width: 320, height: 180 },
	eventEmitter,
	{ containerSelector: '#game' },
);
```

 A game takes an event emitter. You can write your own, or use the one provided by Heks.

 You can also optionally provide a selector for the container the game should mount its canvas in, but by default it will put that in the `body`.

### Concepts

Heks has two main concepts: **events** and **entities**.

#### Entities

Entities are the game objects, and are described by their components. Through functions like `findEntities`, heks provides you a way to find entities with certain components.

#### Events

Events are what makes the Heks game framework tick.

When the game starts, a `start` event is fired. Then, each animation frame, the following events are fired in order:

1. `beforeUpdate`
2. `update`
3. `afterUpdate`
4. `beforeDraw`
5. `draw`
6. `afterDraw`

Each event calls their subscribed handlers with the current state and some event object. Each event handler is expected to return a new state.

Subscribe to an event using `on`:

```ts
game.on('draw', renderGame);
```

You can also emit events:

```ts
import { getEntities, findEntity } from 'heks';

// Make sure you declare any event types not already in GameEvents.
const eventEmitter = new EventEmitter<GameEvents & {
    jump: { entity: Entity }
}>();

const Game = new Game(
	{ width: 320, height: 180 },
	eventEmitter,
);

eventEmitter.on('update', (state) => {
    const playerEntity = findEntity(getEntities(state), { isPlayer: true });

    if (!playerEntity) {
        return state;
    }

    if (playerEntity.state === 'jump') {
        return eventEmitter.emit('jump', { entity: playerEntity });
    }

    return state;
});
```
