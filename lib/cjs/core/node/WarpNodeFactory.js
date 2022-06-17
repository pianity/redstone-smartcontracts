"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarpNodeFactory = void 0;
const core_1 = require("../index");
const plugins_1 = require("../../plugins/index");
const cache_1 = require("../../cache/index");
const KnexStateCache_1 = require("../../cache/impl/KnexStateCache");
/**
 * A {@link Warp} factory that can be safely used only in Node.js env.
 */
class WarpNodeFactory extends core_1.WarpWebFactory {
    /**
     * Returns a fully configured, memcached {@link Warp} that is suitable for tests with ArLocal
     */
    static forTesting(arweave) {
        return this.memCachedBased(arweave).useArweaveGateway().build();
    }
    /**
     * Returns a fully configured {@link Warp} that is using file-based cache for {@link StateEvaluator} layer
     * and mem cache for the rest.
     *
     * @param cacheBasePath - path where cache files will be stored
     * @param maxStoredInMemoryBlockHeights - how many cache entries per contract will be stored in
     * the underneath mem-cache
     *
     */
    static fileCached(arweave, cacheBasePath, maxStoredInMemoryBlockHeights = 10) {
        return this.fileCachedBased(arweave, cacheBasePath, maxStoredInMemoryBlockHeights).build();
    }
    /**
     * Returns a preconfigured, fileCached {@link WarpBuilder}, that allows for customization of the Warp instance.
     * Use {@link WarpBuilder.build()} to finish the configuration.
     * @param cacheBasePath - see {@link fileCached.cacheBasePath}
     * @param maxStoredInMemoryBlockHeights - see {@link fileCached.maxStoredInMemoryBlockHeights}
     *
     */
    static fileCachedBased(arweave, cacheBasePath, maxStoredInMemoryBlockHeights = 10, confirmationStatus = { notCorrupted: true }) {
        const interactionsLoader = new core_1.WarpGatewayInteractionsLoader(core_1.R_GW_URL, confirmationStatus);
        const definitionLoader = new core_1.WarpGatewayContractDefinitionLoader(core_1.R_GW_URL, arweave, new cache_1.MemCache());
        const executorFactory = new plugins_1.CacheableExecutorFactory(arweave, new core_1.HandlerExecutorFactory(arweave), new cache_1.MemCache());
        const stateEvaluator = new core_1.CacheableStateEvaluator(arweave, new cache_1.FileBlockHeightWarpCache(cacheBasePath, maxStoredInMemoryBlockHeights), [new plugins_1.Evolve(definitionLoader, executorFactory)]);
        const interactionsSorter = new core_1.LexicographicalInteractionsSorter(arweave);
        return core_1.Warp.builder(arweave)
            .setDefinitionLoader(definitionLoader)
            .setInteractionsLoader(interactionsLoader)
            .useWarpGwInfo()
            .setInteractionsSorter(interactionsSorter)
            .setExecutorFactory(executorFactory)
            .setStateEvaluator(stateEvaluator);
    }
    static async knexCached(arweave, dbConnection, maxStoredInMemoryBlockHeights = 10) {
        return (await this.knexCachedBased(arweave, dbConnection, maxStoredInMemoryBlockHeights)).build();
    }
    /**
     */
    static async knexCachedBased(arweave, dbConnection, maxStoredInMemoryBlockHeights = 10, confirmationStatus = { notCorrupted: true }) {
        const interactionsLoader = new core_1.WarpGatewayInteractionsLoader(core_1.R_GW_URL, confirmationStatus);
        const definitionLoader = new core_1.WarpGatewayContractDefinitionLoader(core_1.R_GW_URL, arweave, new cache_1.MemCache());
        const executorFactory = new plugins_1.CacheableExecutorFactory(arweave, new core_1.HandlerExecutorFactory(arweave), new cache_1.MemCache());
        const stateEvaluator = new core_1.CacheableStateEvaluator(arweave, await KnexStateCache_1.KnexStateCache.init(dbConnection, maxStoredInMemoryBlockHeights), [new plugins_1.Evolve(definitionLoader, executorFactory)]);
        const interactionsSorter = new core_1.LexicographicalInteractionsSorter(arweave);
        return core_1.Warp.builder(arweave)
            .setDefinitionLoader(definitionLoader)
            .setInteractionsLoader(interactionsLoader)
            .useWarpGwInfo()
            .setInteractionsSorter(interactionsSorter)
            .setExecutorFactory(executorFactory)
            .setStateEvaluator(stateEvaluator);
    }
}
exports.WarpNodeFactory = WarpNodeFactory;
//# sourceMappingURL=WarpNodeFactory.js.map