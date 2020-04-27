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
export declare const addEntity: (components: any) => (state: GameState) => GameState;
export declare function getEntity(state: GameState, entityId: string): Entity;
export declare function getEntities(state: GameState): Entity[];
export declare function findEntities(entities: Entity[], filters: ComponentFilterMap): Entity[];
export declare function findEntity(entities: Entity[], filters: ComponentFilterMap): Entity | undefined;
export declare function doesEntityValueMatch(entity: Entity, filters: ComponentFilterMap): boolean;
