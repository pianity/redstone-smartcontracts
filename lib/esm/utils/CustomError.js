/**
 * The custom error type that every error originating from the library should extend.
 */
export class CustomError extends Error {
    constructor(detail, message, originalError) {
        super(`${detail.type}${message ? `: ${message}` : ''}`);
        this.detail = detail;
        this.originalError = originalError;
        this.name = 'CustomError';
        Error.captureStackTrace(this, CustomError);
    }
}
//# sourceMappingURL=CustomError.js.map