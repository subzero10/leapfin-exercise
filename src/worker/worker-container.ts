import {Worker} from 'worker_threads';
import {join} from 'path';
import {existsSync} from 'fs';
import {debug as Debug} from 'debug';
import actions from './worker-actions';
import {WorkerMessage} from './worker-message';
import {WorkerResults} from './worker-results';
import {WorkerResultsConsoleExporter} from '../results-export/worker-results-console-exporter';

const logDebug = Debug('worker-container');

export class WorkerContainer {

    private readonly search: string;
    private readonly timeout: number
    private readonly numberOfWorkers: number
    private workers: Array<Worker> = []
    private _results: Array<WorkerResults> = [];
    private promiseCallback?: (() => void);
    private timeoutHandle: any;

    constructor(search: string, timeout: number, numberOfWorkers: number) {
        this.search = search;
        this.timeout = timeout;
        this.numberOfWorkers = numberOfWorkers;
    }

    get results(): Array<WorkerResults> {
        return this._results;
    }

    public async run(): Promise<void> {
        return new Promise((resolve) => {
            this.promiseCallback = resolve;
            const workerFilePath = this.getWorkerFilePath();
            for (let i = 0; i < this.numberOfWorkers; i++) {
                this.workers[i] = this.spawnWorker(i, workerFilePath);
                this._results[i] = {
                    status: undefined,
                    bytesRead: 0,
                    timeElapsedMs: 0
                } as WorkerResults;
            }

            this.timeoutHandle = setTimeout(() => {
                this.terminateContainer();
            }, this.timeout);
        });
    }

    private shouldTerminateContainer() {
        for (let i = 0; i < this.numberOfWorkers; i++) {
            if (typeof this._results[i].status === 'undefined') {
                return false;
            }
        }

        return true;
    }

    private terminateContainer() {
        clearTimeout(this.timeoutHandle);
        for (let i = 0; i < this.numberOfWorkers; i++) {
            if (typeof this._results[i].status === 'undefined') {
                this.onTimeout(i);
            }
        }
        this.logResults();
        if (this.promiseCallback) {
            this.promiseCallback();
        }
    }

    private logResults() {
        new WorkerResultsConsoleExporter().export(this._results);
    }

    private getWorkerFilePath(): string {
        const workerJs = join(__dirname, './worker.js');
        return existsSync(workerJs) ? workerJs :  join(__dirname, './worker-wrapper.js');
    }

    private spawnWorker(workerId: number, workerJsPath: string): Worker {
        const worker = new Worker(workerJsPath, {
            workerData: {
                path: './worker.ts',
                search: this.search
            }

        });
        worker.on('message', (message) => this.onMessage(workerId, message));
        worker.on('error', (err) => this.onError(workerId, err));
        /*
        worker.on('exit', (code) => {
        });
         */
        return worker;
    }

    private onMessage(workerId: number, message: WorkerMessage) {

        if (!message.action) {
            this.onError(workerId, 'invalid message');
            return;
        }

        switch (message.action) {
        case actions.STREAM_RESULT:
            this.processResult(workerId, message.data as WorkerResults);
            break;
        default:
            this.onError(workerId, `unhandled message action[${message.action}]`);
            return;
        }
    }

    private onTimeout(workerId: number) {
        this.terminateWorker(workerId, 'TIMEOUT', false);
    }

    private onSuccess(workerId: number, data: WorkerResults) {
        this._results[workerId].bytesRead = data.bytesRead;
        this._results[workerId].timeElapsedMs = data.timeElapsedMs;

        this.terminateWorker(workerId, 'SUCCESS');
        logDebug(`[${workerId}] processing result from worker`, data.timeElapsedMs, data.bytesRead);
    }

    private onError(workerId: number, errorMessage: string) {
        console.error(`Worker[${workerId}]: ${errorMessage}`,);
        this.terminateWorker(workerId, 'FAILURE');
    }

    private terminateWorker(workerId: number, status: 'SUCCESS' | 'TIMEOUT' | 'FAILURE', checkTerminateContainer = true) {
        this._results[workerId].status = status;
        this.workers[workerId].terminate();

        if (checkTerminateContainer && this.shouldTerminateContainer()) {
            this.terminateContainer();
        }
    }

    private processResult(workerId: number, data: WorkerResults) {
        if (!data.status) {
            logDebug(workerId, 'could not process worker results from worker', data);
            return;
        }

        switch (data.status) {
        case 'SUCCESS':
            this.onSuccess(workerId, data);
            break;
        case 'FAILURE':
            this.onError(workerId, data.errorDetails || 'ERROR');
            break;
        default:
            logDebug(workerId, 'could not process worker results from worker because status is not recognized', data);
            return;
        }
    }
}
