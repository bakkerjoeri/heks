import uuid from '@bakkerjoeri/uuid';
import { pipe } from '@bakkerjoeri/fp';

export type Component = any;

export interface Entity extends Components {
	readonly id: string;
}

export interface EntityState {
	entities: {
		[entityId: string]: Entity;
	};
}

export interface Components {
	[componentName: string]: Component;
}

export interface ComponentFilterMap {
	[componentName: string]: ComponentFilter;
}

export type ComponentFilter = boolean | any | {
	(value: any): boolean;
};

type Optional<
	T extends Record<string, unknown>,
	K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>
>;

export const setEntity = (entity: Optional<Entity, 'id'>) => <State extends EntityState>(state: State): State => {
	const id = entity.id || uuid();

	return {
		...state,
		entities: {
			...state.entities,
			[id]: {
				id,
				...entity,
			},
		},
	};
}

export const setEntities = (...entities: Entity[]) => <State extends EntityState>(state: State): State => {
	return pipe(...entities.map(setEntity))(state);
}

export const setComponent = (componentName: string) => <ValueType = any>(value: ValueType) => <EntityType = Entity>(entity: EntityType): EntityType => {
	return {
		...entity,
		[componentName]: value,
	};
}

export function getEntity<State extends EntityState>(state: State, entityId: string): Entity {
	if (!state.entities.hasOwnProperty(entityId)) {
		throw new Error(`Entity with id ${entityId} doesn't exist.`);
	}

	return state.entities[entityId];
}

export function getEntities<State extends EntityState>(state: State): Entity[] {
	return Object.values(state.entities).reduce((entities: Entity[], entity: Entity): Entity[] => {
		return [
			...entities,
			entity,
		]
	}, []);
}

export const doesEntityMatch = (filters: ComponentFilterMap) => (entity: Entity): boolean => {
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

export function findEntities(entities: Entity[], filters: ComponentFilterMap): Entity[] {
	return entities.filter(doesEntityMatch(filters));
}

export function findEntity(entities: Entity[], filters: ComponentFilterMap): Entity | undefined {
	return entities.find(doesEntityMatch(filters));
}
