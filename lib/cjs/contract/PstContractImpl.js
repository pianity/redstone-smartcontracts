"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PstContractImpl = void 0;
const contract_1 = require("./index");
class PstContractImpl extends contract_1.HandlerBasedContract {
    async currentBalance(target) {
        const interactionResult = await this.viewState({ function: 'balance', target });
        if (interactionResult.type !== 'ok') {
            throw Error(interactionResult.errorMessage);
        }
        return interactionResult.result;
    }
    async currentState() {
        return (await super.readState()).state;
    }
    async transfer(transfer) {
        return await this.writeInteraction({ function: 'transfer', ...transfer });
    }
}
exports.PstContractImpl = PstContractImpl;
//# sourceMappingURL=PstContractImpl.js.map