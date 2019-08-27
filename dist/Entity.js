import createUuid from './utilities/createUuid.js';
export default class Entity {
    constructor(engine, entityId = createUuid()) {
        this.id = entityId;
        this.engine = engine;
    }
    has(componentName) {
        return !!this.engine.getValueOfComponentForEntity(componentName, this.id);
    }
    set(componentName, value) {
        this.engine.setComponentForEntity(componentName, value, this.id);
    }
    remove(componentName) {
        this.engine.removeComponentFromEntity(componentName, this.id);
    }
    get components() {
        return this.engine.getComponentsForEntity(this.id);
    }
    set components(newComponents) {
        this.engine.setComponentsForEntity(newComponents, this.id);
    }
}
