export interface WorkerResults {
    status?: 'SUCCESS' | 'TIMEOUT' | 'FAILURE';
    bytesRead: number;
    timeElapsedMs: number;
    errorDetails?: string
}
