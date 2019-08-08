export default function arrayWithout(array, ...valuesToExclude) {
    return array.filter((value) => {
        return !valuesToExclude.includes(value);
    });
}
