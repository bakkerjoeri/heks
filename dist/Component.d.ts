export interface Components {
    [componentName: string]: Component;
}
export declare type Component = ComponentPrimitive | ComponentObject;
export interface ComponentObject {
    [key: string]: Component;
}
export declare type ComponentPrimitive = string | number | boolean | null | undefined | symbol;
