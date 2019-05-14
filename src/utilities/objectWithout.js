export default function(object, ...keysToExclude) {
    return Object.keys(object).reduce((newObject, key) => {
        if (!keysToExclude.includes(key)) {
            return {
                ...newObject,
                [key]: object[key],
            };
        }

        return newObject;
    }, {})
}
