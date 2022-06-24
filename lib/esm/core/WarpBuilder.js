import { ArweaveGatewayInteractionsLoader, CacheableContractInteractionsLoader, ContractDefinitionLoader, DebuggableExecutorFactory, MemBlockHeightWarpCache, MemCache, WarpGatewayContractDefinitionLoader, WarpGatewayInteractionsLoader, Warp } from '../index';
export const R_GW_URL = 'https://d1o5nlqr4okus2.cloudfront.net';
export class WarpBuilder {
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
        this._interactionsLoader = new CacheableContractInteractionsLoader(value, new MemBlockHeightWarpCache(maxStoredInMemoryBlockHeights));
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
        this._executorFactory = new DebuggableExecutorFactory(this._executorFactory, sourceCode);
        return this.build();
    }
    useWarpGateway(confirmationStatus = null, source = null, address = R_GW_URL) {
        this._interactionsLoader = new WarpGatewayInteractionsLoader(address, confirmationStatus, source);
        this._definitionLoader = new WarpGatewayContractDefinitionLoader(address, this._arweave, new MemCache());
        this._useWarpGwInfo = true;
        return this;
    }
    useArweaveGateway() {
        this._definitionLoader = new ContractDefinitionLoader(this._arweave, new MemCache());
        this._interactionsLoader = new CacheableContractInteractionsLoader(new ArweaveGatewayInteractionsLoader(this._arweave), new MemBlockHeightWarpCache(1));
        this._useWarpGwInfo = false;
        return this;
    }
    useWarpGwInfo() {
        this._useWarpGwInfo = true;
        return this;
    }
    build() {
        return new Warp(this._arweave, this._definitionLoader, this._interactionsLoader, this._interactionsSorter, this._executorFactory, this._stateEvaluator, this._useWarpGwInfo);
    }
}
//# sourceMappingURL=WarpBuilder.js.map