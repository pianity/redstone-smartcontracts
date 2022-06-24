"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarpWebFactory = void 0;
const plugins_1 = require("../../plugins/index");
const core_1 = require("../index");
const cache_1 = require("../../cache/index");
/**
 * A factory that simplifies the process of creating different versions of {@link Warp}.
 * All versions use the {@link Evolve} plugin.
 * Warp instances created by this factory can be safely used in a web environment.
 */
class WarpWebFactory {
    /**
     * Returns a fully configured {@link Warp} that is using mem cache for all layers.
     */
    static memCached(arweave, maxStoredBlockHeights = 10) {
        return this.memCachedBased(arweave, maxStoredBlockHeights).build();
    }
    /**
     * Returns a preconfigured, memCached {@link WarpBuilder}, that allows for customization of the Warp instance.
     * Use {@link WarpBuilder.build()} to finish the configuration.
     */
    static memCachedBased(arweave, maxStoredBlockHeights = 10, confirmationStatus = { notCorrupted: true }) {
        const interactionsLoader = new core_1.WarpGatewayInteractionsLoader(core_1.R_GW_URL, confirmationStatus);
        const definitionLoader = new core_1.WarpGatewayContractDefinitionLoader(core_1.R_GW_URL, arweave, new cache_1.MemCache());
        const executorFactory = new plugins_1.CacheableExecutorFactory(arweave, new core_1.HandlerExecutorFactory(arweave), new cache_1.MemCache());
        const stateEvaluator = new core_1.CacheableStateEvaluator(arweave, new cache_1.MemBlockHeightWarpCache(maxStoredBlockHeights), [new plugins_1.Evolve(definitionLoader, executorFactory)]);
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
exports.WarpWebFactory = WarpWebFactory;
//# sourceMappingURL=WarpWebFactory.js.map