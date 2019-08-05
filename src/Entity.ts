import Hex from './Hex.js';
import { Components } from './Component.js';
import createUuid from './utilities/createUuid.js';

export interface Entity {
    id: string;
    engine: Hex;
    hasComponent: (componentName: string) => boolean;
    components: Components;
}

export type WithComponents<ComponentsOfEntity = {}> = {
    [Property in keyof ComponentsOfEntity]: ComponentsOfEntity[Property];
}

export function createEntityProxy(
    engine: Hex,
    entityId: Entity['id'] = createUuid()
): Entity {
    return new Proxy({
        engine,
        id: entityId,
        hasComponent(componentName: string): boolean {
            return engine.state.componentsMap.hasOwnProperty(componentName) &&
                engine.state.componentsMap[componentName].hasOwnProperty(entityId);
        },
        get components(): Components {
            return engine.getComponentsForEntity(entityId)
        },
        set components(newComponents) {
            engine.setComponentsForEntity(newComponents, entityId);
        },
    }, {
        get: (target, property: string, receiver): any => {
            if (target.hasOwnProperty(property)) {
                return Reflect.get(target, property, receiver);
            }

            if (property === 'components') {
                return target.engine.getComponentsForEntity(target.id);
            }

            return target.engine.getValueOfComponentForEntity(property, target.id);
        },
        set: (target, property: string, value): boolean => {
            if (property === 'id' || property === 'engine') {
                throw new Error(`Property "${property}" of an entity cannot be changed.`);
            }

            if (target.hasOwnProperty(property)) {
                return Reflect.set(target, property, value);
            }

            target.engine.setComponentForEntity(property, value, target.id);

            return true;
        },
        ownKeys: (target): (string | number | symbol)[] => {
            return [
                ...Reflect.ownKeys(target),
                ...Object.keys(target.engine.getComponentsForEntity(target.id)),
            ];
        },
        getOwnPropertyDescriptor: (): PropertyDescriptor => {
            return {
                enumerable: true,
                configurable: true,
            };
        },
        defineProperty(target, property: string, descriptor): boolean {
            if (target.hasOwnProperty(property)) {
                return Reflect.defineProperty(target, property, descriptor);
            }

            target.engine.setComponentForEntity(property, descriptor.value, target.id);

            return true;
        },
        deleteProperty: (target, property: string): boolean => {
            if (property === 'id' || property === 'engine') {
                throw new Error(`Deleting property ${property} of entity will break the proxy.`)
            }

            target.engine.removeComponentFromEntity(property, target.id);

            return true;
        }
    });
}
