export class CustomError extends Error {
    constructor(kind, message, originalError) {
        super(`${kind}${message ? `: ${message}` : ''}`);
        this.kind = kind;
        this.originalError = originalError;
        this.name = 'CustomError';
        Error.captureStackTrace(this, CustomError);
    }
}
//# sourceMappingURL=CustomError.js.map