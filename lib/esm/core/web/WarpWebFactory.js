import { CacheableExecutorFactory, Evolve } from '../../plugins/index';
import { CacheableStateEvaluator, HandlerExecutorFactory, LexicographicalInteractionsSorter, R_GW_URL, WarpGatewayContractDefinitionLoader, WarpGatewayInteractionsLoader, Warp } from '../index';
import { MemBlockHeightWarpCache, MemCache } from '../../cache/index';
/**
 * A factory that simplifies the process of creating different versions of {@link Warp}.
 * All versions use the {@link Evolve} plugin.
 * Warp instances created by this factory can be safely used in a web environment.
 */
export class WarpWebFactory {
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
        const interactionsLoader = new WarpGatewayInteractionsLoader(R_GW_URL, confirmationStatus);
        const definitionLoader = new WarpGatewayContractDefinitionLoader(R_GW_URL, arweave, new MemCache());
        const executorFactory = new CacheableExecutorFactory(arweave, new HandlerExecutorFactory(arweave), new MemCache());
        const stateEvaluator = new CacheableStateEvaluator(arweave, new MemBlockHeightWarpCache(maxStoredBlockHeights), [new Evolve(definitionLoader, executorFactory)]);
        const interactionsSorter = new LexicographicalInteractionsSorter(arweave);
        return Warp.builder(arweave)
            .setDefinitionLoader(definitionLoader)
            .setInteractionsLoader(interactionsLoader)
            .useWarpGwInfo()
            .setInteractionsSorter(interactionsSorter)
            .setExecutorFactory(executorFactory)
            .setStateEvaluator(stateEvaluator);
    }
}
//# sourceMappingURL=WarpWebFactory.js.map