export interface CompilerResponse {
    compilationSucceeded: boolean;
    compilationTraces: string[];
    assemblyBytes: string;
    pdbBytes: string;
}

export interface QueryResponse<T> {
    compilationOutput: CompilerResponse;
    runtimeSucceeded: boolean;
    invocationOutput: T;
}
