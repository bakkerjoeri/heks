export default function findElementOrSelector(
    elementOrSelector: Element | string,
    container = document.documentElement
): Element | null {
    if (elementOrSelector instanceof Element) {
        return elementOrSelector;
    }

    if (typeof elementOrSelector !== 'string' || !container) {
        return null;
    }

    return container.querySelector(elementOrSelector);
}
