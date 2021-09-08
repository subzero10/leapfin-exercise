import {parentPort, workerData} from 'worker_threads';
import {debug as Debug} from 'debug';
import {WorkerMessage} from './worker-message';
import actions from './worker-actions';
import {CryptoRandomStreamGenerator} from '../stream-read/crypto-random-stream-generator';
import config from '../config';
import {WorkerMessenger} from './worker-messenger';
import {SearchAlgorithm} from '../search/search-algorithm';
import {IndexOfStringSearch} from '../search/index-of-string-search';
import {WorkerResults} from './worker-results';
import {StreamReader} from '../stream-read/stream-reader';

const log = Debug('worker');

export class Worker {

    private readonly messenger: WorkerMessenger;
    private readonly search: string;
    private readonly searchAlgorithm: SearchAlgorithm;
    private readonly streamReader: StreamReader;
    private bytesRead = 0;
    private timeStarted = 0;

    constructor(messenger: WorkerMessenger, searchAlgorithm: SearchAlgorithm, streamReader: StreamReader, search: string) {
        this.messenger = messenger;
        this.searchAlgorithm = searchAlgorithm;
        this.streamReader = streamReader;
        this.search = search;
    }

    public run(): void {
        try {
            this.timeStarted = Date.now();
            this.process();
        } catch (e) {
            this.postError(e);
        }
    }

    private readStream(): string {
        return this.streamReader.read();
    }

    private process() {
        let stream = this.readStream();
        while (!this.performSearch(stream)) {
            stream = this.readStream();
        }

        this.postSuccess();
    }

    private performSearch(stream: string) {
        const foundIt = this.searchAlgorithm.search(stream, this.search);
        this.bytesRead += stream.length;

        if (foundIt) {
            log(`stream contains search[${this.search}] string: ${stream}`,);
        }
        return foundIt;
    }

    private postSuccess() {
        const result = {
            status: 'SUCCESS',
            timeElapsedMs: Date.now() - this.timeStarted,
            bytesRead: this.bytesRead
        } as WorkerResults;
        this.postMessage(actions.STREAM_RESULT, result);
    }

    private postError(err: Error) {
        const result = {
            status: 'FAILURE',
            timeElapsedMs: 0,
            bytesRead: 0,
            errorDetails: err.message
        } as WorkerResults;
        this.postMessage(actions.STREAM_RESULT, result);
    }

    private postMessage(action: string, data: any) {
        this.messenger.postMessage({
            action,
            data
        } as WorkerMessage);
    }
}

if (workerData && parentPort) {
    new Worker(
        parentPort,
        new IndexOfStringSearch(),
        new CryptoRandomStreamGenerator(config.streamChunkSize),
        workerData.search
    ).run();
}
