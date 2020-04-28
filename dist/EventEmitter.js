import arrayWithout from '@bakkerjoeri/array-without';
import objectWithout from '@bakkerjoeri/object-without';
export default class EventEmitter {
    constructor() {
        this.eventHandlers = {};
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
    removeEventType(eventType) {
        this.eventHandlers = objectWithout(this.eventHandlers, eventType);
    }
    emit(eventType, initialState, event) {
        if (!this.eventHandlers.hasOwnProperty(eventType)) {
            return initialState;
        }
        const handlers = this.eventHandlers[eventType];
        return handlers.reduce((newState, currentHandler) => {
            return currentHandler(newState, event);
        }, initialState);
    }
}