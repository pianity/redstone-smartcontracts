"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WasmHandlerApi = void 0;
const HandlerExecutorFactory_1 = require("../HandlerExecutorFactory");
const AbstractContractHandler_1 = require("./AbstractContractHandler");
const utils_1 = require("../../../../utils/utils");
class WasmHandlerApi extends AbstractContractHandler_1.AbstractContractHandler {
    constructor(swGlobal, 
    // eslint-disable-next-line
    contractDefinition, wasmExports) {
        super(swGlobal, contractDefinition);
        this.wasmExports = wasmExports;
    }
    async handle(executionContext, currentResult, interactionData) {
        try {
            const { interaction, interactionTx } = interactionData;
            this.swGlobal._activeTx = interactionTx;
            this.swGlobal.caller = interaction.caller; // either contract tx id (for internal writes) or transaction.owner
            this.swGlobal.gasLimit = executionContext.evaluationOptions.gasLimit;
            this.swGlobal.gasUsed = 0;
            this.assignReadContractState(executionContext, interactionTx);
            this.assignViewContractState(executionContext);
            this.assignWrite(executionContext);
            await this.swGlobal.kv.open();
            await this.swGlobal.kv.begin();
            const handlerResult = await this.doHandle(interaction);
            if (interactionData.interaction.interactionType === 'view') {
                // view calls are not allowed to perform any KV modifications
                await this.swGlobal.kv.rollback();
            }
            else {
                await this.swGlobal.kv.commit();
            }
            return {
                type: 'ok',
                result: handlerResult,
                state: this.doGetCurrentState(),
                gasUsed: this.swGlobal.gasUsed,
                event: null
            };
        }
        catch (e) {
            await this.swGlobal.kv.rollback();
            const result = {
                errorMessage: e.message,
                state: currentResult.state,
                result: null
            };
            if (e instanceof HandlerExecutorFactory_1.ContractError || e instanceof HandlerExecutorFactory_1.NonWhitelistedSourceError) {
                return {
                    ...result,
                    error: e.error,
                    type: 'error',
                    event: null
                };
            }
            else if (e instanceof utils_1.NetworkCommunicationError) {
                throw e;
            }
            else {
                return {
                    ...result,
                    type: 'exception',
                    event: null
                };
            }
        }
        finally {
            await this.swGlobal.kv.close();
        }
    }
    initState(state) {
        switch (this.contractDefinition.srcWasmLang) {
            case 'rust': {
                if ('initStateLegacy' in this.wasmExports) {
                    this.wasmExports.initStateLegacy(state);
                    return;
                }
                const ret = this.wasmExports.initState(state);
                if (ret) {
                    throw new Error(ret);
                }
                else {
                    return;
                }
            }
            default: {
                throw new Error(`Support for ${this.contractDefinition.srcWasmLang} not implemented yet.`);
            }
        }
    }
    async doHandleLegacy(action) {
        // pre- warp_contract macro contracts
        const handleResult = await this.wasmExports.handle(action.input);
        if (!handleResult) {
            return;
        }
        if (Object.prototype.hasOwnProperty.call(handleResult, 'Ok')) {
            return handleResult.Ok;
        }
        let errorKey;
        let errorArgs = '';
        if (typeof handleResult.Err === 'string' || handleResult.Err instanceof String) {
            errorKey = handleResult.Err;
        }
        else if ('kind' in handleResult.Err) {
            throw new HandlerExecutorFactory_1.ContractError(handleResult.Err);
            errorKey = handleResult.Err.kind;
            errorArgs = 'data' in handleResult.Err ? ' ' + JSON.stringify(handleResult.Err.data, null, 2) : '';
        }
        else {
            errorKey = Object.keys(handleResult.Err)[0];
            errorArgs = ' ' + handleResult.Err[errorKey];
        }
        if (errorKey == 'RuntimeError') {
            throw new Error(`[RE:RE]${errorArgs}`);
        }
        else {
            throw new HandlerExecutorFactory_1.ContractError(`[CE:${errorKey}${errorArgs}]`);
        }
    }
    async doHandle(action) {
        switch (this.contractDefinition.srcWasmLang) {
            case 'rust': {
                if ('handle' in this.wasmExports) {
                    return await this.doHandleLegacy(action);
                }
                const handleResult = action.interactionType === 'write'
                    ? await this.wasmExports.warpContractWrite(action.input)
                    : await this.wasmExports.warpContractView(action.input);
                if (!handleResult) {
                    return;
                }
                if (handleResult.type === 'ok') {
                    return handleResult.result;
                }
                this.logger.error('Error from rust', handleResult);
                if (handleResult.type === 'error')
                    throw new HandlerExecutorFactory_1.ContractError(handleResult.error);
                throw new Error(handleResult.errorMessage);
            }
            default: {
                throw new Error(`Support for ${this.contractDefinition.srcWasmLang} not implemented yet.`);
            }
        }
    }
    async maybeCallStateConstructor(initialState, executionContext) {
        var _a, _b;
        if ((_b = (_a = this.contractDefinition.manifest) === null || _a === void 0 ? void 0 : _a.evaluationOptions) === null || _b === void 0 ? void 0 : _b.useConstructor) {
            throw Error('Constructor is not implemented for wasm');
        }
        return initialState;
    }
    doGetCurrentState() {
        switch (this.contractDefinition.srcWasmLang) {
            case 'rust': {
                return this.wasmExports.currentState();
            }
            default: {
                throw new Error(`Support for ${this.contractDefinition.srcWasmLang} not implemented yet.`);
            }
        }
    }
}
exports.WasmHandlerApi = WasmHandlerApi;
//# sourceMappingURL=WasmHandlerApi.js.map