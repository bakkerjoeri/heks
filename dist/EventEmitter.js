import arrayWithout from '@bakkerjoeri/array-without';
import objectWithout from '@bakkerjoeri/object-without';
export default class EventEmitter {
    constructor() {
        this.eventHandlers = {};
        this.on = this.on.bind(this);
        this.emit = this.emit.bind(this);
        this.remove = this.remove.bind(this);
        this.removeAll = this.removeAll.bind(this);
    }
    on(eventType, handler) {
        this.eventHandlers = Object.assign(Object.assign({}, this.eventHandlers), { [eventType]: [
                ...this.eventHandlers[eventType] || [],
                handler,
            ] });
    }
    remove(eventType, handler) {
        this.eventHandlers = Object.assign(Object.assign({}, this.eventHandlers), { [eventType]: arrayWithout(this.eventHandlers[eventType], handler) });
    }
    removeAll(eventType) {
        this.eventHandlers = objectWithout(this.eventHandlers, eventType);
    }
    emit(eventType, initialState, event) {
        if (!this.eventHandlers.hasOwnProperty(eventType)) {
            return initialState;
        }
        const handlers = this.eventHandlers[eventType];
        return handlers.reduce((newState, currentHandler) => {
            return currentHandler(newState, event, {
                on: this.on,
                emit: this.emit,
                remove: this.remove,
                removeAll: this.removeAll,
            });
        }, initialState);
    }
}
