export default function isPlainObject(possiblePlainObject) {
    if (Object.prototype.toString.call(possiblePlainObject) !== '[object Object]') {
        return false;
    }

    const prototype = Object.getPrototypeOf(possiblePlainObject);

    return prototype === null || prototype === Object.getPrototypeOf({});
}
