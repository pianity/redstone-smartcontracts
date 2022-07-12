/**
 * A helper type to avoid having to type `{ type: "..." }` for every error detail types.
 */
export declare type Err<T extends string> = {
    type: T;
};
/**
 * The custom error type that every error originating from the library should extend.
 */
export declare class CustomError<T extends {
    type: string;
}> extends Error {
    detail: T;
    originalError?: unknown;
    constructor(detail: T, message?: string, originalError?: unknown);
}
//# sourceMappingURL=CustomError.d.ts.map