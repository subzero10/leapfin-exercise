import {SearchAlgorithm} from './search-algorithm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fss = require('fast-string-search');

export class FastStringSearch implements SearchAlgorithm {
    search(text: string, pattern: string): boolean {
        return fss.indexOfSkip(text, pattern).length > 0;
    }
}
