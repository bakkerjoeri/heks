export default function objectWithout(
    object: { [key: string]: any },
    ...keysToExclude: string[]
): { [key: string]: any } {
    return Object.keys(object).reduce((newObject: { [key: string]: any }, key): { [key: string]: any } => {
        if (!keysToExclude.includes(key)) {
            return {
                ...newObject,
                [key]: object[key],
            };
        }

        return newObject;
    }, {})
}
