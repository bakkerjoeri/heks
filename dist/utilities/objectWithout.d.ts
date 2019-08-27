export default function objectWithout(object: {
    [key: string]: any;
}, ...keysToExclude: string[]): {
    [key: string]: any;
};
