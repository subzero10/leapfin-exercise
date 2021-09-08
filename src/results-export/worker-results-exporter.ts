import {WorkerResults} from '../domain/worker-results';

export interface WorkerResultsExporter {
    export(results: WorkerResults[]): void;
}
