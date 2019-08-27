import Heks from './Heks.js';
import { Component, Components } from './Component.js';
export default class Entity<TComponents extends Components = {}> {
    id: string;
    private engine;
    constructor(engine: Heks, entityId?: Entity['id']);
    has(componentName: string): boolean;
    set(componentName: string, value: Component): void;
    remove(componentName: string): void;
    components: TComponents;
}
