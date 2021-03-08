export declare type Component = any;
export interface Entity extends Components {
    readonly id: string;
}
export interface EntityState {
    entities: {
        [entityId: string]: Entity;
    };
}
export declare const entityState: EntityState;
export interface Components {
    [componentName: string]: Component;
}
export interface ComponentFilterMap {
    [componentName: string]: ComponentFilter;
}
export declare type ComponentFilter = boolean | any | {
    (value: any): boolean;
};
declare type Optional<T extends Record<string, unknown>, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export declare const setEntity: (entity: Optional<Entity, 'id'>) => <State extends EntityState>(state: State) => State;
export declare const setEntities: (...entities: Entity[]) => <State extends EntityState>(state: State) => State;
export declare const setComponent: (componentName: string) => <ValueType = any>(value: ValueType) => <EntityType = Entity>(entity: EntityType) => EntityType;
export declare function getEntity<ExpectedComponents extends Components, State extends EntityState>(state: State, entityId: string): (Entity & ExpectedComponents);
export declare function getEntities<State extends EntityState>(state: State): Entity[];
export declare const doesEntityMatch: (filters: ComponentFilterMap) => (entity: Entity) => boolean;
export declare function findEntities<ExpectedComponents extends Components>(entities: Entity[], filters: ComponentFilterMap): (Entity & ExpectedComponents)[];
export declare function findEntity<ExpectedComponents extends Components>(entities: Entity[], filters: ComponentFilterMap): (Entity & ExpectedComponents) | undefined;
export {};
