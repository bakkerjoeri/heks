import uuid from '@bakkerjoeri/uuid';
import { GameState } from './types';

export type Component = any;

export interface Entity {
    id: string;
    [componentName: string]: Component;
}

export interface ComponentFilterMap {
	[componentName: string]: ComponentFilter;
}

export type ComponentFilter = boolean | any | {
	(value: any): boolean;
};

export const addEntity = (components: any) => (state: GameState): GameState => {
	const entity = {
		id: components.id || uuid(),
		...components,
	}

	return {
		...state,
		entities: {
			...state.entities,
			[entity.id]: entity,
		},
	};
}

export function getEntity(state: GameState, entityId: string): Entity {
    if (!state.entities.hasOwnProperty(entityId)) {
        throw new Error(`Entity with id ${entityId} doesn't exist.`);
    }

    return state.entities[entityId];
}

export function getEntities(state: GameState): Entity[] {
    return Object.values(state.entities).reduce((entities: Entity[], entity: Entity): Entity[] => {
        return [
            ...entities,
            entity,
        ]
    }, []);
}

export function findEntities(entities: Entity[], filters: ComponentFilterMap): Entity[] {
	return entities.filter(entity => {
		return doesEntityValueMatch(entity, filters);
	});
}

export function findEntity(entities: Entity[], filters: ComponentFilterMap): Entity | undefined {
	return entities.find(entity => {
		return doesEntityValueMatch(entity, filters);
	});
}

export function doesEntityValueMatch(entity: Entity, filters: ComponentFilterMap): boolean {
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
