import cli from 'cli-ux';
import {WorkerResultsExporter} from './worker-results-exporter';
import {WorkerResults} from '../domain/worker-results';

export class WorkerResultsConsoleExporter implements WorkerResultsExporter {
    export(results: WorkerResults[]): void {

        const sortedTableData: WorkerResults[] = [];
        let successfulWorkers = 0;
        let avgBytesReadPerWorker = 0;

        results
            .filter(r => r.status === 'SUCCESS')
            .sort((r1, r2) => {
                if (r1.timeElapsedMs === r2.timeElapsedMs) {
                    return 0;
                }
                return r1.timeElapsedMs > r2.timeElapsedMs ? -1 : 1;
            })
            .forEach(worker => {
                sortedTableData.push({
                    timeElapsedMs: worker.timeElapsedMs,
                    bytesRead: worker.bytesRead,
                    status: worker.status
                });

                successfulWorkers++;
                avgBytesReadPerWorker += (worker.bytesRead / worker.timeElapsedMs);
            });

        results
            .forEach(worker => {
                if (worker.status === 'SUCCESS') {
                    return;
                }

                sortedTableData.push({
                    timeElapsedMs: 0,
                    bytesRead: 0,
                    status: worker.status
                });
            });

        const avgBytesPerMs = Math.round(avgBytesReadPerWorker / successfulWorkers);
        const avgBytesStr = avgBytesPerMs ? `${avgBytesPerMs} bytes/ms` : 'n/a';
        const avgBytesReadMsg = `Average bytes read: ${avgBytesStr}.`;
        this.logToTable(sortedTableData, avgBytesReadMsg);
    }

    private logToTable(sortData: WorkerResults[], avgBytesReadMsg: string) {
        cli.table(sortData,
            {
                timeElapsedMs: {
                    get: row => row.timeElapsedMs || ''
                },
                bytesRead: {
                    get: row => row.bytesRead || ''
                },
                status: {}
            }, {
                'no-header': true
            });
        cli.log(avgBytesReadMsg);
    }

}
