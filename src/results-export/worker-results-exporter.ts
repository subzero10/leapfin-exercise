import {WorkerResults} from '../worker/worker-results';

export interface WorkerResultsExporter {
    export(results: WorkerResults[]): void;
}
