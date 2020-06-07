import { GameState } from './types';
export declare type Component = any;
export interface Entity {
    id: string;
    [componentName: string]: Component;
}
export interface ComponentFilterMap {
    [componentName: string]: ComponentFilter;
}
export declare type ComponentFilter = boolean | any | {
    (value: any): boolean;
};
export declare const addEntity: (components: any) => <State extends GameState>(state: State) => State;
export declare const createEntityIndex: (...entities: Entity[]) => {
    [entityId: string]: Entity;
};
export declare const setEntities: (...entities: Entity[]) => <State extends GameState>(state: State) => State;
export declare const setComponent: (componentName: string) => <ValueType = any>(value: ValueType) => <EntityType = Entity>(entity: EntityType) => EntityType;
export declare function getEntity<State extends GameState>(state: State, entityId: string): Entity;
export declare function getEntities<State extends GameState>(state: State): Entity[];
export declare function findEntities(entities: Entity[], filters: ComponentFilterMap): Entity[];
export declare function findEntity(entities: Entity[], filters: ComponentFilterMap): Entity | undefined;
export declare function doesEntityValueMatch(entity: Entity, filters: ComponentFilterMap): boolean;
