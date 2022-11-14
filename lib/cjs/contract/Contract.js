"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractError = void 0;
class ContractError extends Error {
    constructor(error) {
        super('ContractError');
        this.error = error;
        this.name = 'ContractError';
    }
}
exports.ContractError = ContractError;
//# sourceMappingURL=Contract.js.map