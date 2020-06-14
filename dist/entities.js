import uuid from '@bakkerjoeri/uuid';
import { pipe } from '@bakkerjoeri/fp';
export const setEntity = (entity) => (state) => {
    const id = entity.id || uuid();
    return Object.assign(Object.assign({}, state), { entities: Object.assign(Object.assign({}, state.entities), { [id]: Object.assign({ id }, entity) }) });
};
export const setEntities = (...entities) => (state) => {
    return pipe(...entities.map(setEntity))(state);
};
export const setComponent = (componentName) => (value) => (entity) => {
    return Object.assign(Object.assign({}, entity), { [componentName]: value });
};
export function getEntity(state, entityId) {
    if (!state.entities.hasOwnProperty(entityId)) {
        throw new Error(`Entity with id ${entityId} doesn't exist.`);
    }
    return state.entities[entityId];
}
export function getEntities(state) {
    return Object.values(state.entities).reduce((entities, entity) => {
        return [
            ...entities,
            entity,
        ];
    }, []);
}
export const doesEntityMatch = (filters) => (entity) => {
    return Object.entries(filters).every(([componentName, filterValue]) => {
        if (typeof filterValue === 'function' && entity.hasOwnProperty(componentName)) {
            return filterValue(entity[componentName]);
        }
        if (typeof filterValue === 'boolean' && !filterValue) {
            return !entity.hasOwnProperty(componentName) || !entity[componentName];
        }
        if (typeof filterValue === 'boolean' && filterValue) {
            return entity.hasOwnProperty(componentName) && !!entity[componentName];
        }
        return entity.hasOwnProperty(componentName) && filterValue === entity[componentName];
    });
};
export function findEntities(entities, filters) {
    return entities.filter(doesEntityMatch(filters));
}
export function findEntity(entities, filters) {
    return entities.find(doesEntityMatch(filters));
}
