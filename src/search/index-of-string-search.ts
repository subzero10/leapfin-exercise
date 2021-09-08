import {SearchAlgorithm} from './search-algorithm';

export class IndexOfStringSearch implements SearchAlgorithm {
    search(text: string, pattern: string): { index: number, bytesRead: number } {
        const result = text.indexOf(pattern);

        return {
            index: result,
            bytesRead: -1
        };
    }
}
