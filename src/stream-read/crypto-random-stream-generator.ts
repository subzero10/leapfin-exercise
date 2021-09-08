import * as Crypto from 'crypto';
import {StreamReader} from './stream-reader';

export class CryptoRandomStreamGenerator implements StreamReader {

    protected readonly MAX_CHUNK_SIZE = 10000000;
    private readonly chunkSize: number;

    constructor(chunkSize: number) {
        this.chunkSize = chunkSize;
    }

    read(): string {
        if (this.chunkSize >= this.MAX_CHUNK_SIZE) {
            throw new Error(`size param is too large[${this.chunkSize}]. please try a smaller value (< ${this.MAX_CHUNK_SIZE})`);
        }

        return Crypto
            .randomBytes(this.chunkSize)
            .toString('base64')
            .slice(0, this.chunkSize);
    }
}

