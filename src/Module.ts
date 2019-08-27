import Heks from './Heks.js';

export default class Module {
    public engine: Heks;

    public constructor(engine: Heks) {
        this.engine = engine;
    }
}
