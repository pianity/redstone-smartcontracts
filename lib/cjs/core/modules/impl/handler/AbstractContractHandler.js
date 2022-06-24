"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractContractHandler = void 0;
const _warp_1 = require("../../../../index");
class AbstractContractHandler {
    constructor(swGlobal, contractDefinition) {
        this.swGlobal = swGlobal;
        this.contractDefinition = contractDefinition;
        this.logger = _warp_1.LoggerFactory.INST.create('ContractHandler');
        this.assignReadContractState = this.assignReadContractState.bind(this);
        this.assignViewContractState = this.assignViewContractState.bind(this);
        this.assignWrite = this.assignWrite.bind(this);
        this.assignRefreshState = this.assignRefreshState.bind(this);
    }
    async dispose() {
        // noop by default;
    }
    assignWrite(executionContext, currentTx) {
        this.swGlobal.contracts.write = async (contractTxId, input) => {
            if (!executionContext.evaluationOptions.internalWrites) {
                throw new Error("Internal writes feature switched off. Change EvaluationOptions.internalWrites flag to 'true'");
            }
            this.logger.debug('swGlobal.write call:', {
                from: this.contractDefinition.txId,
                to: contractTxId,
                input
            });
            // The contract that we want to call and modify its state
            const calleeContract = executionContext.warp.contract(contractTxId, executionContext.contract, this.swGlobal._activeTx);
            const result = await calleeContract.dryWriteFromTx(input, this.swGlobal._activeTx, [
                ...(currentTx || []),
                {
                    contractTxId: this.contractDefinition.txId,
                    interactionTxId: this.swGlobal.transaction.id
                }
            ]);
            this.logger.debug('Cache result?:', !this.swGlobal._activeTx.dry);
            await executionContext.warp.stateEvaluator.onInternalWriteStateUpdate(this.swGlobal._activeTx, contractTxId, {
                state: result.state,
                validity: {}
            });
            return result;
        };
    }
    assignViewContractState(executionContext) {
        this.swGlobal.contracts.viewContractState = async (contractTxId, input) => {
            this.logger.debug('swGlobal.viewContractState call:', {
                from: this.contractDefinition.txId,
                to: contractTxId,
                input
            });
            const childContract = executionContext.warp.contract(contractTxId, executionContext.contract, this.swGlobal._activeTx);
            return await childContract.viewStateForTx(input, this.swGlobal._activeTx);
        };
    }
    assignReadContractState(executionContext, currentTx, currentResult, interactionTx) {
        this.swGlobal.contracts.readContractState = async (contractTxId, height, returnValidity) => {
            const requestedHeight = height || this.swGlobal.block.height;
            this.logger.debug('swGlobal.readContractState call:', {
                from: this.contractDefinition.txId,
                to: contractTxId,
                height: requestedHeight,
                transaction: this.swGlobal.transaction.id
            });
            const { stateEvaluator } = executionContext.warp;
            const childContract = executionContext.warp.contract(contractTxId, executionContext.contract, interactionTx);
            await stateEvaluator.onContractCall(interactionTx, executionContext, currentResult);
            const stateWithValidity = await childContract.readState(requestedHeight, [
                ...(currentTx || []),
                {
                    contractTxId: this.contractDefinition.txId,
                    interactionTxId: this.swGlobal.transaction.id
                }
            ]);
            // TODO: it should be up to the client's code to decide which part of the result to use
            // (by simply using destructuring operator)...
            // but this (i.e. returning always stateWithValidity from here) would break backwards compatibility
            // in current contract's source code..:/
            return returnValidity ? (0, _warp_1.deepCopy)(stateWithValidity) : (0, _warp_1.deepCopy)(stateWithValidity.state);
        };
    }
    assignRefreshState(executionContext) {
        this.swGlobal.contracts.refreshState = async () => {
            const stateEvaluator = executionContext.warp.stateEvaluator;
            const result = await stateEvaluator.latestAvailableState(this.swGlobal.contract.id, this.swGlobal.block.height);
            return result === null || result === void 0 ? void 0 : result.cachedValue.state;
        };
    }
}
exports.AbstractContractHandler = AbstractContractHandler;
//# sourceMappingURL=AbstractContractHandler.js.map