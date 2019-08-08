export interface Components {
    [componentName: string]: Component;
}

export type Component = ComponentPrimitive | ComponentObject;

export interface ComponentObject {
    [key: string]: Component;
}

export type ComponentPrimitive = string | number | boolean | null | symbol;
