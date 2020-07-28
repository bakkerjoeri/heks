# ☞ Heks Engine

A game development framework in TypeScript.

## Installation
```bash
npm install heks
```

## Usage

Start by creating a new game:

```ts
import { Game } from 'heks';

const game = new Game(
	{ width: 320, height: 180 },
	{ containerSelector: '#game' },
);
```

You can optionally provide a selector for the container the game should mount its canvas in, but by default it will put that in the `body`.

### Options

Option | Default
-|-
`initialState` | `{ entities: {}, sprites: {} }`
`containerSelector` | `"body"`

## Concepts

Heks has two main concepts: **events** and **entities**.

### Entities

Entities are the game's objects, and are described by their components. Through functions like `findEntities`, heks provides you a way to find entities with certain components.

### Events

Events are what makes the Heks game framework tick.

When you start your game by calling `game.start()`, a `start` event is fired. Then, each animation frame, the following events are fired in order:

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

Each handler is required to return `state`, whether altered or not:

```ts
game.on('update', moveBlocks);

function moveEntitiesRight(state) {
	const updatedEntities = state.entities.map((entity) => {
		return {
			...entities,
			position: {
				x: entities.position.x + 1,
				y: entities.position.y,
			}
		}
	});

	return {
		...state,
		entities: {
			...state.entities,
			updatedEntities,
		},
	};
}
```

You can also emit events from within other events:

```ts
import {
    Game,
    Entity,
    getEntities,
    findEntity,
    GameState,
    EventEmitter,
    GameEvents,
    UpdateEvent,
    EventHandlerContext
} from 'heks';

// Make sure you declare any event types not already in GameEvents.
interface Events extends GameEvents {
    jump: { entity: Entity, time: number };
}

const game = new Game<GameState, Events>({ width: 320, height: 180 });

const processPlayerState = (
    state: GameState,
    { time }: UpdateEvent,
    { emit }: EventHandlerContext<Events>
): GameState => {
    const playerEntity = findEntity(getEntities(state), { isPlayer: true });

    if (!playerEntity) {
        return state;
    }

    if (playerEntity.state === 'jump') {
        return emit('jump', state, { entity: playerEntity, time, });
    }

    return state;
}

game.on('update', processPlayerState);
```
