"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarpBuilder = void 0;
const DebuggableExecutorFactor_1 = require("../plugins/DebuggableExecutorFactor");
const ArweaveGatewayInteractionsLoader_1 = require("./modules/impl/ArweaveGatewayInteractionsLoader");
const CacheableInteractionsLoader_1 = require("./modules/impl/CacheableInteractionsLoader");
const ArweaveContractDefinitionLoader_1 = require("./modules/impl/ArweaveContractDefinitionLoader");
const WarpGatewayContractDefinitionLoader_1 = require("./modules/impl/WarpGatewayContractDefinitionLoader");
const WarpGatewayInteractionsLoader_1 = require("./modules/impl/WarpGatewayInteractionsLoader");
const Warp_1 = require("./Warp");
const CacheableContractDefinitionLoader_1 = require("./modules/impl/CacheableContractDefinitionLoader");
class WarpBuilder {
    constructor(_arweave, _stateCache, _environment = 'custom') {
        this._arweave = _arweave;
        this._stateCache = _stateCache;
        this._environment = _environment;
    }
    setDefinitionLoader(value) {
        this._definitionLoader = value;
        return this;
    }
    setInteractionsLoader(value) {
        this._interactionsLoader = value;
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
        this._executorFactory = new DebuggableExecutorFactor_1.DebuggableExecutorFactory(this._executorFactory, sourceCode);
        return this.build();
    }
    useWarpGateway(gatewayOptions, cacheOptions) {
        this._interactionsLoader = new CacheableInteractionsLoader_1.CacheableInteractionsLoader(new WarpGatewayInteractionsLoader_1.WarpGatewayInteractionsLoader(gatewayOptions.confirmationStatus, gatewayOptions.source));
        this._definitionLoader = new CacheableContractDefinitionLoader_1.CacheableContractDefinitionLoader(new WarpGatewayContractDefinitionLoader_1.WarpGatewayContractDefinitionLoader(this._arweave, this._environment), this._environment, cacheOptions);
        return this;
    }
    useArweaveGateway(cacheOptions) {
        this._interactionsLoader = new CacheableInteractionsLoader_1.CacheableInteractionsLoader(new ArweaveGatewayInteractionsLoader_1.ArweaveGatewayInteractionsLoader(this._arweave, this._environment));
        this._definitionLoader = new CacheableContractDefinitionLoader_1.CacheableContractDefinitionLoader(new ArweaveContractDefinitionLoader_1.ArweaveContractDefinitionLoader(this._arweave, this._environment), this._environment, cacheOptions);
        return this;
    }
    build() {
        const warp = new Warp_1.Warp(this._arweave, this._definitionLoader, this._interactionsLoader, this._executorFactory, this._stateEvaluator, this._environment);
        this._definitionLoader.warp = warp;
        this._interactionsLoader.warp = warp;
        return warp;
    }
}
exports.WarpBuilder = WarpBuilder;
//# sourceMappingURL=WarpBuilder.js.map