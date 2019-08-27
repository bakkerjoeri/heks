export default function findElementOrSelector(elementOrSelector, container = document.documentElement) {
    if (elementOrSelector instanceof Element) {
        return elementOrSelector;
    }
    if (typeof elementOrSelector !== 'string' || !container) {
        return null;
    }
    return container.querySelector(elementOrSelector);
}
