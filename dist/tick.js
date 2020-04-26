export function start(callback) {
    scheduleNextTick(callback);
}
export function scheduleNextTick(callback) {
    window.requestAnimationFrame((time) => {
        tick(callback, time);
    });
}
export function tick(callback, time) {
    callback(time);
    scheduleNextTick(callback);
}
