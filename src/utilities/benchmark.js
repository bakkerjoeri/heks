export default function benchmark(iterations = 100000, functionToBenchmark) {
    if (typeof functionToBenchmark !== 'function') {
        throw new Error(`Can only benchmark a function. Got ${typeof functionToBenchmark} instead.`);
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i += 1) {
        functionToBenchmark(i);
    }
    const end = performance.now();

    return {
        iterations,
        totalTime: end - start,
        timePerIteration: (end - start) / iterations,
    };
}
