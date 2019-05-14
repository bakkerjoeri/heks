export default function isEmptyObject(object) {
    return Object.entries(object).length === 0 &&
        object.constructor === Object;
}
