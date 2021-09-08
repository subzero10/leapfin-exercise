import {SearchAlgorithm} from './search-algorithm';

/**
 * Credits to: https://gist.github.com/jhermsmeier/2138865
 * I modified the implementation to return bytes processed.
 */
export class BoyerMooreHorspoolSearch implements SearchAlgorithm {
    search(text: string, pattern: string): { index: number, bytesRead: number } {
        const textBuffer = Buffer.from(text);
        const patternBuffer = Buffer.from(pattern);

        return this.boyerMooreHorspool(textBuffer, patternBuffer);
    }

    private boyerMooreHorspool(haystack: Buffer, needle: Buffer): { index: number, bytesRead: number } {

        const nlen = needle.length;
        let hlen = haystack.length;
        let bytesRead = 0;

        if (nlen <= 0 || hlen <= 0) {
            return {index: -1, bytesRead};
        }

        let jump, offset = 0;
        let scan = 0;
        const last = nlen - 1;
        const skip: any = {};

        for (scan = 0; scan < last; scan++) {
            bytesRead++;
            skip[needle[scan]] = last - scan;
        }

        while (hlen >= nlen) {
            for (scan = last; haystack[offset + scan] === needle[scan]; scan--) {
                bytesRead += 2;
                if (scan === 0) {
                    return {index: offset, bytesRead};
                }
            }
            bytesRead++;
            jump = skip[haystack[offset + last]];
            jump = jump != null ? jump : nlen;
            hlen -= jump;
            offset += jump;
        }

        return {index: -1, bytesRead};
    }
}

