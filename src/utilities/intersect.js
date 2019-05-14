export default function intersect(shortArray, longArray) {
    let tempArray;

    if (longArray.length < shortArray.length) {
        tempArray = longArray;
        longArray = shortArray;
        shortArray = tempArray;
    }

    return shortArray.filter((value) => {
        return longArray.includes(value);
    });
}
