export default function intersect(
    shortArray: any[],
    longArray: any[]
): any[] {
    let tempArray: any[];

    if (longArray.length < shortArray.length) {
        tempArray = longArray;
        longArray = shortArray;
        shortArray = tempArray;
    }

    return shortArray.filter((value): boolean => {
        return longArray.includes(value);
    });
}
