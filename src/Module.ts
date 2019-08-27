import Hex from './Hex.js';

export default class Module {
    public engine: Hex;

    public constructor(engine: Hex) {
        this.engine = engine;
    }
}
