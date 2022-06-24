"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IvmHandlerApi = void 0;
const AbstractContractHandler_1 = require("./AbstractContractHandler");
class IvmHandlerApi extends AbstractContractHandler_1.AbstractContractHandler {
    constructor(swGlobal, contractDefinition, ivm) {
        super(swGlobal, contractDefinition);
        this.ivm = ivm;
    }
    async handle(executionContext, currentResult, interactionData) {
        try {
            const { interaction, interactionTx, currentTx } = interactionData;
            this.swGlobal._activeTx = interactionTx;
            this.swGlobal.caller = interaction.caller; // either contract tx id (for internal writes) or transaction.owner
            this.assignReadContractState(executionContext, currentTx, currentResult, interactionTx);
            this.assignViewContractState(executionContext);
            this.assignWrite(executionContext, currentTx);
            this.assignRefreshState(executionContext);
            const handlerResult = await this.ivm.contract.apply(undefined, [currentResult.state, interaction], {
                arguments: { copy: true },
                result: { copy: true, promise: true }
            });
            if (handlerResult && (handlerResult.state !== undefined || handlerResult.result !== undefined)) {
                return {
                    type: 'ok',
                    result: handlerResult.result,
                    state: handlerResult.state || currentResult.state
                };
            }
            // Will be caught below as unexpected exception.
            throw new Error(`Unexpected result from contract: ${JSON.stringify(handlerResult)}`);
        }
        catch (err) {
            if (err.stack.includes('ContractError')) {
                return {
                    type: 'error',
                    errorMessage: err.message,
                    state: currentResult.state,
                    // note: previous version was writing error message to a "result" field,
                    // which fucks-up the HandlerResult type definition -
                    // HandlerResult.result had to be declared as 'Result | string' - and that led to a poor dev exp.
                    // TODO: this might be breaking change!
                    result: null
                };
            }
            else {
                return {
                    type: 'exception',
                    errorMessage: `${(err && err.stack) || (err && err.message) || err}`,
                    state: currentResult.state,
                    result: null
                };
            }
        }
    }
    initState(state) {
        // nth to do in this impl...
    }
    async dispose() {
        /*try {
          this.ivm.contract.release();
          this.ivm.sandbox.release();
          this.ivm.context.release();
          this.ivm.isolate.dispose();
        } catch (e: any) {
          this.logger.error(e);
        }*/
    }
}
exports.IvmHandlerApi = IvmHandlerApi;
//# sourceMappingURL=IvmHandlerApi.js.map