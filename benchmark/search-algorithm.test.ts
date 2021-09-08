import {performance} from 'perf_hooks';
import {IndexOfStringSearch} from '../src/search/index-of-string-search';
import {BoyerMooreHorspoolSearch} from '../src/search/boyer-moore-horspool-search';
import {BoyerMooreSearch} from '../src/search/boyer-moore-search';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const samples = require('../test/test-samples.json');

/**
 * Legend:
 * - Short needle: 5 characters
 * - Medium needle: 32 characters
 * - Long needle: 100 characters
 * - Short haystack: 1000
 * - Medium haystack: 100000
 * - Long haystack: 500000
 */


function getNeedle(size: 'short' | 'medium' | 'long'): string {
    return samples['needles'][size];
}

function getHaystack(size: 'short' | 'medium' | 'long'): string {
    return samples['haystacks'][size];
}

function comparePerformance(sizeOfNeedle: 'short' | 'medium' | 'long', sizeOfHaystack: 'short' | 'medium' | 'long') {
    const needle = getNeedle(sizeOfNeedle);
    const haystack = getHaystack(sizeOfHaystack);

    let start = performance.now();
    const indexOfSearch = new IndexOfStringSearch();
    const indexOfResult = indexOfSearch.search(haystack, needle);
    const indexOfTime = performance.now() - start;

    start = performance.now();
    const boyerMooreHorspool = new BoyerMooreHorspoolSearch();
    const bhResult = boyerMooreHorspool.search(haystack, needle);
    const bhTime = performance.now() - start;

    start = performance.now();
    const boyerMoore = new BoyerMooreSearch();
    const bmResult = boyerMoore.search(haystack, needle);
    const bmTime = performance.now() - start;

    console.info('Haystack:', sizeOfHaystack, '| Needle:', sizeOfNeedle);
    console.table([
        {name: 'indexOf', time: indexOfTime, result: indexOfResult},
        {name: 'boyerMooreHorspool', time: bhTime, result: bhResult},
        {name: 'boyerMoore', time: bmTime, result: bmResult},
    ]);
}

describe('test search algorithm', function () {
    it('algo should be close to indexOf performance: short needle, short haystack', function () {
        comparePerformance('short', 'short');
    });

    it('algo should be close to indexOf performance: short needle, medium haystack', function () {
        comparePerformance('short', 'medium');
    });

    it('algo should be close to indexOf performance: short needle, long haystack', function () {
        comparePerformance('short', 'long');
    });

    it('algo should be close to indexOf performance: medium needle, short haystack', function () {
        comparePerformance('medium', 'short');
    });

    it('algo should be close to indexOf performance: medium needle, medium haystack', function () {
        comparePerformance('medium', 'medium');
    });

    it('algo should be close to indexOf performance: medium needle, long haystack', function () {
        comparePerformance('medium', 'long');
    });

    it('algo should be close to indexOf performance: long needle, short haystack', function () {
        comparePerformance('long', 'short');
    });

    it('algo should be close to indexOf performance: long needle, medium haystack', function () {
        comparePerformance('long', 'medium');
    });

    it('algo should be close to indexOf performance: long needle, long haystack', function () {
        comparePerformance('long', 'long');
    });

});
