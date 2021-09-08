import {performance} from 'perf_hooks';
import {expect} from '@oclif/test';
import {IndexOfStringSearch} from '../src/search/index-of-string-search';
import {FastStringSearch} from '../src/search/fast-string-search';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const samples = require('./test-samples.json');

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
    const fastSearch = new FastStringSearch();
    fastSearch.search(haystack, needle);
    const fssTime = performance.now() - start;

    start = performance.now();
    const indexOfSearch = new IndexOfStringSearch();
    indexOfSearch.search(haystack, needle);
    const indexOfTime = performance.now() - start;

    expect(indexOfTime).to.be.lessThan(fssTime);
}

describe('test search algorithm', function () {
    it('indexOf should be faster than fast-string-search: short needle, short haystack', function () {
        comparePerformance('short', 'short');
    });

    it('indexOf should be faster than fast-string-search: short needle, medium haystack', function () {
        comparePerformance('short', 'medium');
    });

    it('indexOf should be faster than fast-string-search: short needle, long haystack', function () {
        comparePerformance('short', 'long');
    });

    it('indexOf should be faster than fast-string-search: medium needle, short haystack', function () {
        comparePerformance('medium', 'short');
    });

    it('indexOf should be faster than fast-string-search: medium needle, medium haystack', function () {
        comparePerformance('medium', 'medium');
    });

    it('indexOf should be faster than fast-string-search: medium needle, long haystack', function () {
        comparePerformance('medium', 'long');
    });

    it('indexOf should be faster than fast-string-search: long needle, short haystack', function () {
        comparePerformance('long', 'short');
    });

    it('indexOf should be faster than fast-string-search: long needle, medium haystack', function () {
        comparePerformance('long', 'medium');
    });

    it('indexOf should be faster than fast-string-search: long needle, long haystack', function () {
        comparePerformance('long', 'long');
    });

});
