import Hex, { Constructable } from './Hex.js';

export interface Modules<TModulesOfEngine extends Modules<TModulesOfEngine> = {}> {
    [moduleName: string]: Module<TModulesOfEngine>;
}

export type ConstructableModules<TModules extends Modules<TModules> = {}> = {
    [ModuleName in keyof TModules]: Constructable<TModules[ModuleName]>
}

export default class Module<TModulesOfEngine extends Modules<TModulesOfEngine> = {}> {
    public engine: Hex<TModulesOfEngine>;

    public constructor(engine: Hex<TModulesOfEngine>) {
        this.engine = engine;
    }
}
