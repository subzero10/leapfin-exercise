import {SearchAlgorithm} from './search-algorithm';

/**
 * Credits to: https://gist.github.com/jhermsmeier/2138865
 * I modified the implementation to return bytes processed.
 */
export class BoyerMooreSearch implements SearchAlgorithm {

    private alphabetSize = 256;
    private bytesRead = 0;

    search(text: string, pattern: string): { index: number, bytesRead: number } {
        this.bytesRead = 0;
        const textBuffer = Buffer.from(text);
        const patternBuffer = Buffer.from(pattern);

        return this.indexOf(patternBuffer, textBuffer);
    }

    /*
     Returns the index of the first occurrence of
     the `needle` buffer within the `haystack` buffer.
   */
    private indexOf(needle: Buffer, haystack: Buffer): { index: number, bytesRead: number } {

        let i, k;
        const n = needle.length;
        const m = haystack.length;

        if (n === 0) return {index: n, bytesRead: this.bytesRead};

        const charTable = this.makeCharTable(needle);
        const offsetTable = this.makeOffsetTable(needle);

        for (i = n - 1; i < m;) {
            for (k = n - 1; needle[k] === haystack[i]; --i, --k) {
                this.bytesRead++;
                if (k === 0) return {index: i, bytesRead: this.bytesRead};
            }
            // i += n - k; // for naive method
            i += Math.max(offsetTable[n - 1 - k], charTable[haystack[i]]);
        }

        return {index: -1, bytesRead: this.bytesRead};
    }

    /*
      Makes the jump table based on the
      mismatched character information.
    */
    private makeCharTable(needle: Buffer): Uint32Array {

        const table = new Uint32Array(this.alphabetSize);
        let n = needle.length;
        const t = table.length;
        let i = 0;

        for (; i < t; ++i) {
            table[i] = n;
        }

        n--;

        for (i = 0; i < n; ++i) {
            this.bytesRead++;
            table[needle[i]] = n - i;
        }

        return table;

    }

    /*
      Makes the jump table based on the
      scan offset which mismatch occurs.
    */
    private makeOffsetTable(needle: Buffer): Uint32Array {

        let i, suffix;
        const n = needle.length;
        const m = n - 1;
        let lastPrefix = n;
        const table = new Uint32Array(n);

        for (i = m; i >= 0; --i) {
            if (this.isPrefix(needle, i + 1)) {
                lastPrefix = i + 1;
            }
            table[m - i] = lastPrefix - i + m;
        }

        for (i = 0; i < n; ++i) {
            suffix = this.suffixLength(needle, i);
            table[suffix] = m - i + suffix;
        }

        return table;

    }

    /*
      Is `needle[i:end]` a prefix of `needle`?
    */
    private isPrefix(needle: Buffer, i: number): boolean {

        let k = 0;
        const n = needle.length;

        for (; i < n; ++i, ++k) {
            this.bytesRead += 2;
            if (needle[i] !== needle[k]) {
                return false;
            }
        }

        return true;

    }

    /*
      Returns the maximum length of the
      substring ends at `i` and is a suffix.
    */
    private suffixLength(needle: Buffer, i: number): number {

        let k = 0;
        const n = needle.length;
        let m = n - 1;

        for (; i >= 0 && needle[i] === needle[m]; --i, --m) {
            this.bytesRead += 2;
            k += 1;
        }

        return k;

    }
}
