export default function isObject(possibleObject) {
    return typeof possibleObject === 'object' &&
        !Array.isArray(possibleObject) &&
        possibleObject !== null;
}
