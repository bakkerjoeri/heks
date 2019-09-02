# ☞ Heks Engine

An JavaScript game engine leveraging events and entities composed of components. It's fully typed, so you can also build your game in TypeScript.

## Installation
```bash
npm install heks
```

## Getting started
Start by creating a new instance of Heks.

```ts
import Heks from 'heks';
import { Graphics2D, Mouse, Keyboard } from 'heks/modules';

const engine = new Heks({
    modules: [ Graphics2D, Mouse, Keyboard ].
    container: '.game',
    size: { width: 120, height: 80 },
    scale: 4,
});
```

You can pass any of the following options:

| Option     | Default          | Type                     | Explanation |
|------------|------------------|--------------------------|-------------|
|`container` | `"body"`         | `string \| Element`      | Selector or element insert the game into. |
|`modules`   | `[]`             | `Module[]`               | See [Modules](#modules) below |
|`size`      | `{ x: 0, y: 0 }` | `{x: number; y: number}` | Canvas size before scaling.
|`scale`     | `1`              | `number`                 | Zoom in or out. The on-screen size of the canvas is `size` multiplied by this `scale`.

## Rooms
Rooms are the scenes of Heks. Each room contains its own collection of entities. At any time there is one active room. Any events will only ever receive a (sub)set of the entities in the currently active room.

Start out by creating a room, passing an ID, the size, and whether to make the created room the currently active room:

```ts
engine.createRoom('dungeon', {
    width: 240,
    height: 160,
}, true);
```

You can always change the active room later.

```ts
engine.setCurrentRoom('overworld');
```

## Viewports
Just create one like this for now. I'll explain later.

```ts
engine.createViewport();
```

## Entities and components
When working with Hex, entities are the bread and components are the butter. You can create an entity and immediately pass its components. You can specify the ID of a room to add it to, but if you don't it's just added to the currently active room.

```ts
const playerCharacter = engine.createEntity({
    player: true,
    glyph: '@',
    health: { current: 3, max: 3 },
    position: { x: 10, y: 10 },
}, 'dungeon');
```

You can always add components later:

```ts
function poisenCharacter(character: Entity, forTurns: number = 1) {
    character.set('poison', {
        turnsLeft: forTurns,
        damage: 2,
    });
}
```

## Events

### The main game loop
The main idea behind Heks is that, every frame, you first update your game's state and then you draw your gamestate to the screen. To support this, there is a main loop of events that will repeat every frame of the game:

1. `beforeUpdate`
2. `update`
3. `afterUpdate`
4. `beforeDraw`
5. `draw`
6. `afterDraw`

The handlers for each of these events receive the Heks instance as their first argument and `timeElapsed` in milliseconds as their second argument.

You'll generally want to use `update` to manage your entities, and you should use `draw` to output your gamestate to the screen. Try to use the others sparingly and only in very specific cases. A good use of `beforeDraw`, for instance, would be to update viewport positions before drawing but after all entities have updates their positions. Avoid relying on that event order for any real game logic. If you find yourself doing so, you're likely not isolating your game logic well.

### Custom events

You could of course drop all your game logic into the `update` event, but that would become unmanagable rather quickly. You can add your own event handlers:

```ts
engine.addEventHandler('playSound', (engine: Heks, file: string) => {
    stopPlayingAllSounds();
    startPlayingSound(file);
});
```

To trigger an event (and thus call its handlers), you can emit it from the engine:

```ts
engine.addEventHandler('hitEnemy', (engine: Heks, attacker: Entity, target: Entity) => {
    const damage = Math.max(0, attacker.components.attack - target.components.defence);

    engine.emit('doDamage', target, damage);
    engine.emit('playSound', './sounds/thwack.wav');
});
```

## Modules
Modules usually register a some event handlers or emit some of their own events in order to extend the functionality of Heks. They might also provide some utility.

You can register any them on initialization:

```ts
const myEngine = new Heks({
    modules: [
        Graphics2D,
        Mouse,
        Keyboard,
    ]
});
```

For each module, Heks will call `new Module(this)` and store the instance on itself. The module instances can then be accessed on the `modules` property:

```ts
function isLeftMouseButtonPressed(engine: Heks): boolean {
    return engine.modules.Mouse.isButtonDown('left');
}
```

### Useful modules

* Graphics2D - Manage sprites, animate them and render them to viewports on the `draw` event.
* Mouse - Keeps track of the mouse position, button interactions and emits relevant events for those.
* Keyboard - Keeps track of key interactions and emits relevant events for those.

Note that these modules currently ship with the engine, but will probably be put in their own package once they're sufficiently isolated:

### Writing your own modules

A module has to implement or extend the following:

```ts
class Module {
    public engine: Heks;

    public constructor(engine: Heks) {
        this.engine = engine;
    }
}
```

If you want, you can `import` this a base class from `heks/Module`.

```ts
import Module from 'heks/Module';

class MyModule extends Module {}
```

Note that if you're working in TypeScript, you'll need to make sure you augment the type of the `modules` property with your own somewhere in your project.

```ts
declare module 'heks/Module' {
    interface Modules: {
        MyModule: MyModule;
    }
}
```
