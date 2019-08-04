export default function isEmptyObject(object: object): boolean {
    return Object.entries(object).length === 0 &&
        object.constructor === Object;
}
