export declare class CustomError<T> extends Error {
    kind: T;
    originalError?: unknown;
    constructor(kind: T, message?: string, originalError?: unknown);
}
//# sourceMappingURL=CustomError.d.ts.map