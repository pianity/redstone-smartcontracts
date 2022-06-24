"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    constructor(kind, message, originalError) {
        super(`${kind}${message ? `: ${message}` : ''}`);
        this.kind = kind;
        this.originalError = originalError;
        this.name = 'CustomError';
        Error.captureStackTrace(this, CustomError);
    }
}
exports.CustomError = CustomError;
//# sourceMappingURL=CustomError.js.map