import createUuid from './utilities/createUuid.js';

export default function Entity(engine, entityId = createUuid()) {
    return new Proxy({
        engine,
        id: entityId,
        hasComponent(componentName) {
            return engine.componentsMap.hasOwnProperty(componentName) &&
                engine.componentsMap[componentName].hasOwnProperty(entityId);
        },
        get components() {
            return engine.getComponentsForEntity(entityId)
        },
        set components(newComponents) {
            engine.setComponentsForEntity(newComponents, entityId);
        },
    }, {
        get: (target, property, receiver) => {
            if (target.hasOwnProperty(property)) {
                return Reflect.get(target, property, receiver);
            }

            if (property === 'components') {
                return target.engine.getComponentsForEntity(target.id);
            }

            return target.engine.getComponentForEntity(property, target.id);
        },
        set: (target, property, value) => {
            if (property === 'id' || property === 'engine') {
                throw new Error(`Property "${property}" of an entity cannot be changed.`);
            }

            if (target.hasOwnProperty(property)) {
                return Reflect.set(target, property, value);
            }

            target.engine.setComponentForEntity(property, value, target.id);

            return true;
        },
        ownKeys: (target) => {
            return [
                ...Reflect.ownKeys(target),
                ...Object.keys(target.engine.getComponentsForEntity(target.id)),
            ];
        },
        getOwnPropertyDescriptor: () => {
            return {
                enumerable: true,
                configurable: true,
            };
        },
        defineProperty(target, property, descriptor) {
            target.engine.setComponentForEntity(property, descriptor.value, target.id);
        },
        deleteProperty: (target, property) => {
            if (property === 'id' || property === 'engine') {
                throw new Error(`Deleting property ${property} of entity will break the proxy.`)
            }

            target.engine.removeComponentFromEntity(property, target.id);

            return true;
        }
    });
}
