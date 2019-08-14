import Hex, { Constructable } from './Hex.js';

export interface Modules {
    [moduleName: string]: Module;
}

export type ConstructableModules<TModules extends Modules> = {
    [ModuleName in keyof TModules]: Constructable<TModules[ModuleName]>
}

export default class Module<TModulesOfEngine extends Modules = {}> {
    public engine: Hex<TModulesOfEngine>;

    public constructor(engine: Hex<TModulesOfEngine>) {
        this.engine = engine;
    }
}
