import uuid from '@bakkerjoeri/uuid';
export const addEntity = (components) => (state) => {
    const entity = Object.assign({ id: components.id || uuid() }, components);
    return Object.assign(Object.assign({}, state), { entities: Object.assign(Object.assign({}, state.entities), { [entity.id]: entity }) });
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
export function findEntities(entities, filters) {
    return entities.filter(entity => {
        return doesEntityValueMatch(entity, filters);
    });
}
export function findEntity(entities, filters) {
    return entities.find(entity => {
        return doesEntityValueMatch(entity, filters);
    });
}
export function doesEntityValueMatch(entity, filters) {
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
}
