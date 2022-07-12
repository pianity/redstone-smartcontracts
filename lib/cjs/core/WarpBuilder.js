"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarpBuilder = exports.R_GW_URL = void 0;
const _warp_1 = require("..");
exports.R_GW_URL = 'https://d1o5nlqr4okus2.cloudfront.net';
class WarpBuilder {
    constructor(_arweave) {
        this._arweave = _arweave;
        this._useWarpGwInfo = false;
    }
    setDefinitionLoader(value) {
        this._definitionLoader = value;
        return this;
    }
    setInteractionsLoader(value) {
        this._interactionsLoader = value;
        return this;
    }
    setCacheableInteractionsLoader(value, maxStoredInMemoryBlockHeights = 1) {
        this._interactionsLoader = new _warp_1.CacheableContractInteractionsLoader(value, new _warp_1.MemBlockHeightWarpCache(maxStoredInMemoryBlockHeights));
        return this;
    }
    setInteractionsSorter(value) {
        this._interactionsSorter = value;
        return this;
    }
    setExecutorFactory(value) {
        this._executorFactory = value;
        return this;
    }
    setStateEvaluator(value) {
        this._stateEvaluator = value;
        return this;
    }
    overwriteSource(sourceCode) {
        if (this._executorFactory == null) {
            throw new Error('Set base ExecutorFactory first');
        }
        this._executorFactory = new _warp_1.DebuggableExecutorFactory(this._executorFactory, sourceCode);
        return this.build();
    }
    useWarpGateway(confirmationStatus = null, source = null, address = exports.R_GW_URL) {
        this._interactionsLoader = new _warp_1.WarpGatewayInteractionsLoader(address, confirmationStatus, source);
        this._definitionLoader = new _warp_1.WarpGatewayContractDefinitionLoader(address, this._arweave, new _warp_1.MemCache());
        this._useWarpGwInfo = true;
        return this;
    }
    useArweaveGateway() {
        this._definitionLoader = new _warp_1.ContractDefinitionLoader(this._arweave, new _warp_1.MemCache());
        this._interactionsLoader = new _warp_1.CacheableContractInteractionsLoader(new _warp_1.ArweaveGatewayInteractionsLoader(this._arweave), new _warp_1.MemBlockHeightWarpCache(1));
        this._useWarpGwInfo = false;
        return this;
    }
    useWarpGwInfo() {
        this._useWarpGwInfo = true;
        return this;
    }
    build() {
        return new _warp_1.Warp(this._arweave, this._definitionLoader, this._interactionsLoader, this._interactionsSorter, this._executorFactory, this._stateEvaluator, this._useWarpGwInfo);
    }
}
exports.WarpBuilder = WarpBuilder;
//# sourceMappingURL=WarpBuilder.js.map