import Hex from './../../src/Hex.js';
import benchmark from './../../src/utilities/benchmark.js';
import createUuid from './../../src/utilities/createUuid.js';
import repeat from './../../src/utilities/repeat.js';
import getRandomNumberInRange from './../../src/utilities/getRandomNumberInRange.js';

const iterations = 100000;

function runBenchmark(functionName, totalEntities, uniqueComponents, totalFilters) {
    totalFilters = Math.min(uniqueComponents, totalFilters);

    const hex = new Hex();
    hex.createRoom(undefined, true);

    repeat(totalEntities, () => {
        hex.createEntity();
    });

    repeat(uniqueComponents, (c) => {
        repeat(Object.keys(hex.entities).length, (e) => {
            let chance = getRandomNumberInRange(0, 1);

            if (chance) {
                hex.setComponentForEntity(
                    c,
                    createUuid(),
                    Object.keys(hex.entities)[e]
                );
            }
        });
    });

    const filterList = [];

    repeat(iterations, () => {
        let filter = {};

        while (Object.keys(filter).length < totalFilters) {
            filter[getRandomNumberInRange(0, uniqueComponents - 1)] = true;
        }

        filterList.push(filter);
    });

    const report = benchmark(iterations, (i) => {
        hex[functionName](filterList[i]);
    });

    reportResults(functionName, Object.keys(hex.entities).length, Object.keys(hex.componentsMap).length, report);
}

function reportResults(functionName, entityCount, componentCount, report) {
    console.log('Benchmark results:');
    console.log(`Called ${functionName} ${report.iterations} times with ${entityCount} entities and ${componentCount} unique components`);
    console.log(`Total duration: ${report.totalTime}ms`);
    console.log(`Average iteration duration: ${report.timePerIteration}ms`);
    console.log();
}

runBenchmark('getEntitiesEverywhere', 100, 10, 3);
runBenchmark('getEntities', 100, 10, 3);
