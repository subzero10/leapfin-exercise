export interface SearchAlgorithm {
    search(text: string, pattern: string): { index: number, bytesRead: number }
}
