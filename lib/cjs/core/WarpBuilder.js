"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarpBuilder = void 0;
const DebuggableExecutorFactor_1 = require("../plugins/DebuggableExecutorFactor");
const ArweaveGatewayInteractionsLoader_1 = require("./modules/impl/ArweaveGatewayInteractionsLoader");
const CacheableInteractionsLoader_1 = require("./modules/impl/CacheableInteractionsLoader");
const ContractDefinitionLoader_1 = require("./modules/impl/ContractDefinitionLoader");
const WarpGatewayContractDefinitionLoader_1 = require("./modules/impl/WarpGatewayContractDefinitionLoader");
const WarpGatewayInteractionsLoader_1 = require("./modules/impl/WarpGatewayInteractionsLoader");
const Warp_1 = require("./Warp");
class WarpBuilder {
    constructor(_arweave, _cache, _environment = 'custom') {
        this._arweave = _arweave;
        this._cache = _cache;
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
        this._interactionsLoader = new CacheableInteractionsLoader_1.CacheableInteractionsLoader(new WarpGatewayInteractionsLoader_1.WarpGatewayInteractionsLoader(gatewayOptions.address, gatewayOptions.confirmationStatus, gatewayOptions.source));
        this._definitionLoader = new WarpGatewayContractDefinitionLoader_1.WarpGatewayContractDefinitionLoader(gatewayOptions.address, this._arweave, cacheOptions);
        return this;
    }
    useArweaveGateway() {
        this._definitionLoader = new ContractDefinitionLoader_1.ContractDefinitionLoader(this._arweave);
        this._interactionsLoader = new CacheableInteractionsLoader_1.CacheableInteractionsLoader(new ArweaveGatewayInteractionsLoader_1.ArweaveGatewayInteractionsLoader(this._arweave, this._environment));
        return this;
    }
    build() {
        return new Warp_1.Warp(this._arweave, this._cache, this._definitionLoader, this._interactionsLoader, this._executorFactory, this._stateEvaluator, this._environment);
    }
}
exports.WarpBuilder = WarpBuilder;
//# sourceMappingURL=WarpBuilder.js.map