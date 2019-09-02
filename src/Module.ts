import Heks, { Constructable } from './Heks.js';

export default class Module {
    public engine: Heks;

    public constructor(engine: Heks) {
        this.engine = engine;
    }
}

export interface Modules {
    [moduleName: string]: Module;
}

export type ConstructableModules = Constructable<Module>[];
