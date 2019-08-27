import Hex from './Hex.js';
import { Component, Components } from './Component.js';
import createUuid from './utilities/createUuid.js';

export default class Entity<TComponents extends Components = {}> {
    public id: string;
    private engine: Hex;

    public constructor(
        engine: Hex,
        entityId: Entity['id'] = createUuid()
    ) {
        this.id = entityId;
        this.engine = engine;
    }

    public has(componentName: string): boolean {
        return !!this.engine.getValueOfComponentForEntity(componentName, this.id);
    }

    public set(componentName: string, value: Component): void {
        this.engine.setComponentForEntity(componentName, value, this.id);
    }

    public remove(componentName: string): void {
        this.engine.removeComponentFromEntity(componentName, this.id);
    }

    public get components(): TComponents {
        return this.engine.getComponentsForEntity<TComponents>(this.id);
    }

    public set components(newComponents) {
        this.engine.setComponentsForEntity(newComponents, this.id);
    }
}
