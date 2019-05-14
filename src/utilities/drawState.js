export default function drawState(engine, element) {
    element.innerText = JSON.stringify({
        rooms: Object.keys(engine.rooms).map((roomId) => {
            return {
                id: roomId,
                entities: Object.keys(engine.entities).map((entityId) => {
                    return {
                        id: entityId,
                        components: engine.getComponentsForEntity(entityId),
                    }
                }),
            }
        }),
        keys: engine.Keyboard ? {
            pressedKeys: engine.Keyboard.pressedKeys,
            activeKeys: engine.Keyboard.activeKeys,
            releasedKeys: engine.Keyboard.releasedKeys,
        } : {},
    }, undefined, 2);
}
