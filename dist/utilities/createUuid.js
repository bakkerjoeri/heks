export default function createUuid() {
    let seed = Date.now();
    if (window.performance && typeof window.performance.now === 'function') {
        seed += performance.now();
    }
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (seed + Math.random() * 16) % 16 | 0;
        seed = Math.floor(seed / 16);
        return (c === 'x' ? r : r & (0x3 | 0x8)).toString(16);
    });
    return uuid;
}
