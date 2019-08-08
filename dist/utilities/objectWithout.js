export default function objectWithout(object, ...keysToExclude) {
    return Object.keys(object).reduce((newObject, key) => {
        if (!keysToExclude.includes(key)) {
            return Object.assign({}, newObject, { [key]: object[key] });
        }
        return newObject;
    }, {});
}
