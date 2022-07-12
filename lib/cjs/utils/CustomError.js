"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
/**
 * The custom error type that every error originating from the library should extend.
 */
class CustomError extends Error {
    constructor(detail, message, originalError) {
        super(`${detail.type}${message ? `: ${message}` : ''}`);
        this.detail = detail;
        this.originalError = originalError;
        this.name = 'CustomError';
        Error.captureStackTrace(this, CustomError);
    }
}
exports.CustomError = CustomError;
//# sourceMappingURL=CustomError.js.map