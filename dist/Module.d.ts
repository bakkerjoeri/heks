import Heks, { Constructable } from './Heks.js';
export default class Module {
    engine: Heks;
    constructor(engine: Heks);
}
export interface Modules {
    [moduleName: string]: Module;
}
export declare type ConstructableModules = Constructable<Module>[];
