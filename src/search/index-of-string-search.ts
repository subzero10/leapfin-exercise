import {SearchAlgorithm} from './search-algorithm';

export class IndexOfStringSearch implements SearchAlgorithm{
    search(text: string, pattern: string): boolean {
        return text.indexOf(pattern) > -1;
    }
}
