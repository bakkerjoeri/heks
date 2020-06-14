import { GameState } from './types';
import { Optional } from './utilities/Optional';
export declare type Component = any;
export interface Entity extends Components {
    id: string;
}
export interface Components {
    [componentName: string]: Component;
}
export interface ComponentFilterMap {
    [componentName: string]: ComponentFilter;
}
export declare type ComponentFilter = boolean | any | {
    (value: any): boolean;
};
export declare const setEntity: (entity: Optional<Entity, "id">) => <State extends GameState>(state: State) => State;
export declare const setEntities: (...entities: Entity[]) => <State extends GameState>(state: State) => State;
export declare const setComponent: (componentName: string) => <ValueType = any>(value: ValueType) => <EntityType = Entity>(entity: EntityType) => EntityType;
export declare function getEntity<State extends GameState>(state: State, entityId: string): Entity;
export declare function getEntities<State extends GameState>(state: State): Entity[];
export declare const doesEntityMatch: (filters: ComponentFilterMap) => (entity: Entity) => boolean;
export declare function findEntities(entities: Entity[], filters: ComponentFilterMap): Entity[];
export declare function findEntity(entities: Entity[], filters: ComponentFilterMap): Entity | undefined;
